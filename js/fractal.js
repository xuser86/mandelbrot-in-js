const worker = [];
const tileLength = 175;
const workerCount = window.navigator.hardwareConcurrency - 1 || 1;

let buffer; //needs chrome
let canvas;
let palette;

for (let i = 0; i < workerCount; i++) {
  worker[i] = new Worker("./js/worker.js");
}

function init(canvasEl, palette0) {
  canvas = canvasEl;
  palette = palette0;
}

function setup() {
  const width = (canvas.width = canvas.clientWidth);
  const height = (canvas.height = canvas.clientHeight);

  buffer = new SharedArrayBuffer(canvas.width * canvas.height * 4);

  for (let i = 0; i < workerCount; i++) {
    worker[i].postMessage({
      type: "setup",
      buffer,
      width,
      height,
      palette,
      workerId: i
    });
  }
}

function setPalette(palette0) {
  palette = palette0;

  for (let i = 0; i < workerCount; i++) {
    worker[i].postMessage({
      type: "palette",
      palette
    });
  }
}

function flipFullscreen(sharedArray) {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(width, height);

  /* ctx.beginPath();     
  ctx.lineWidth = "1";
  ctx.strokeStyle = "green";
  ctx.rect(spec.left, spec.top, spec.width, spec.height);
  ctx.stroke();  */

  for (let h = 0; h < height; h++) {
    const firstColumn = width * h;

    for (let w = 0; w < width; w++) {
      let idx = (firstColumn + w) * 4;

      imageData.data[idx] = sharedArray[idx];
      imageData.data[idx + 1] = sharedArray[idx + 1];
      imageData.data[idx + 2] = sharedArray[idx + 2];
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function flip(spec, sharedArray) {
  const width = canvas.width;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(spec.width, spec.height);

  /* ctx.beginPath();     
  ctx.lineWidth = "1";
  ctx.strokeStyle = "green";
  ctx.rect(spec.left, spec.top, spec.width, spec.height);
  ctx.stroke();  */

  for (let h = 0; h < spec.height; h++) {
    const firstColumn = width * (spec.top + h);
    const firstImgColumn = spec.width * h;

    for (let w = 0; w < spec.width; w++) {
      let idx = (firstColumn + spec.left + w) * 4;
      let idxImg = (firstImgColumn + w) * 4;

      imageData.data[idxImg] = sharedArray[idx];
      imageData.data[idxImg + 1] = sharedArray[idx + 1];
      imageData.data[idxImg + 2] = sharedArray[idx + 2];
      imageData.data[idxImg + 3] = 255;
    }
  }

  ctx.putImageData(imageData, spec.left, spec.top);
}

let tilesQueueInstanceCounter = 0;

class TilesQueue {
  constructor(width, height, center, range, iterations) {
    this.tiles = [];
    this.tilesCompletted = [];
    this.instanceId = tilesQueueInstanceCounter;
    tilesQueueInstanceCounter++;

    for (let h = 0; h < height; h += tileLength) {
      for (let w = 0; w < width; w += tileLength) {
        this.tilesCompletted[this.tiles.length] = false;
        this.tiles.push({
          top: h,
          left: w,
          width: w + tileLength > width ? width - w : tileLength,
          height: h + tileLength > height ? height - h : tileLength,
          range,
          center,
          iterations,
          instance: this.instanceId,
          id: this.tiles.length
        });
      }
    }
  }

  next() {
    return this.tiles.pop();
  }

  hasNext() {
    return this.tiles.length > 0;
  }

  markAsCompleted(spec) {
    if (this.instanceId === spec.instance) {
      this.tilesCompletted[spec.id] = true;
    }
  }

  isQueueCompleted() {
    return this.tilesCompletted.reduce((p, c) => p && c);
  }
}

let tilesQueue;

function draw(center, range, iterations) {
  const width = canvas.width;
  const height = canvas.height;

  const sharedArray = new Uint8ClampedArray(buffer);

  /* start redner timer */
  console.time("redner duration");

  tilesQueue = new TilesQueue(width, height, center, range, iterations);

  const onmessage = function(e) {
    const result = e.data;
    /* put data to canvas by tiles */
    //flip(result.spec, sharedArray);

    /* imege completion logic */
    tilesQueue.markAsCompleted(result.spec);
    if (tilesQueue.isQueueCompleted()) {
      // render finished
      /* put data to canvas by one image */
      flipFullscreen(sharedArray);
      console.timeEnd("redner duration");
    }

    if (tilesQueue.hasNext()) {
      worker[result.workerId].postMessage({
        type: "calculate",
        spec: tilesQueue.next()
      });
    }
  };

  for (let i = 0; i < workerCount; i++) {
    worker[i].onmessage = onmessage;
  }

  for (let i = 0; i < workerCount && tilesQueue.hasNext(); i++) {
    worker[i].postMessage({
      type: "calculate",
      spec: tilesQueue.next()
    });
  }
}

export default {
  init,
  setup,
  draw,
  setPalette
};
