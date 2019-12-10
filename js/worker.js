var sharedArray;
var width;
var height;
var workerId;
var palette;

function check4stable(re, im, maxIt) {
  let zim = 0,
    zre = 0,
    powzim,
    powzre;
  for (let i = 0; i < maxIt; i++) {
    powzim = zim * zim;
    powzre = zre * zre;

    if (powzim + powzre > 4) {
      return i;
    }

    zim = 2 * zre * zim + im;
    zre = powzre - powzim + re;
  }

  return maxIt;
}

function calcualte(spec) {
  const scale = Math.min(width, height) / spec.range;
  const startRe = (spec.left - width / 2) / scale + spec.center.x;
  const startIm = (-spec.top + height / 2) / scale + spec.center.y;

  const reduceFn = (p, c) => {
    let color = c === spec.iterations ? [0, 0, 0] : palette[c]; // % palette.length];

    p[0] += color[0];
    p[1] += color[1];
    p[2] += color[2];

    return p;
  };

  const stage1 = new Int32Array(spec.height * spec.width);
  let step = 1 / scale;

  let firstColumn;
  for (let w = 0, re = startRe; w < spec.width; w++, re += step) {
    firstColumn = w * spec.height;
    for (let h = 0, im = startIm; h < spec.height; h++, im -= step) {
      stage1[h + firstColumn] = check4stable(re, im, spec.iterations);
    }
  }

  let d = step / 3;
  //let d0 = (-d * (aa - 1)) / 2;
  for (let h = 0, im = startIm; h < spec.height; h++, im -= step) {
    firstColumn = width * (spec.top + h);
    for (let w = 0, re = startRe; w < spec.width; w++, re += step) {
      let mtx = [stage1[h + w * spec.height]];
      let needsAA = false;
      if (w === 0 || h === 0 || w === spec.width - 1 || h === spec.height - 1) {
        needsAA = true;
      } else if (
        stage1[h - 1 + (w - 1) * spec.height] !==
          stage1[h + 1 + (w + 1) * spec.height] ||
        stage1[h - 1 + w * spec.height] !== stage1[h + 1 + w * spec.height] ||
        stage1[h + (w + 1) * spec.height] !==
          stage1[h + (w - 1) * spec.height] ||
        stage1[h - 1 + (w + 1) * spec.height] !==
          stage1[h + 1 + (w - 1) * spec.height]
      ) {
        needsAA = true;
      }

      if (needsAA) {
        mtx.push(
          check4stable(re - d, im - d, spec.iterations),
          check4stable(re - d, im, spec.iterations),
          check4stable(re - d, im + d, spec.iterations),

          check4stable(re, im - d, spec.iterations),
          check4stable(re, im + d, spec.iterations),

          check4stable(re + d, im - d, spec.iterations),
          check4stable(re + d, im, spec.iterations),
          check4stable(re + d, im + d, spec.iterations)
        );
      }

      let sum = mtx.reduce(reduceFn, [0, 0, 0]).map(a => a / mtx.length);
      /*let r = 0,
        g = 0,
        b = 0;
      for (let i = 0; i < mtx.length; i++) {
        let color = mtx[i] === spec.iterations ? [0, 0, 0] : palette[mtx[i]];

        r += color[0];
        g += color[1];
        b += color[2];
      }*/

      let idx = (firstColumn + spec.left + w) * 4;

      sharedArray[idx] = sum[0]; //r / mtx.length; //
      sharedArray[idx + 1] = sum[1]; //g / mtx.length; //
      sharedArray[idx + 2] = sum[2]; //b / mtx.length; //
    }
  }
}

onmessage = msg => {
  const data = msg.data;

  if (data.type === "setup") {
    sharedArray = new Uint8ClampedArray(data.buffer);
    width = data.width;
    height = data.height;
    workerId = data.workerId;
    palette = data.palette;
  } else if (data.type === "calculate") {
    calcualte(data.spec);
    postMessage({
      spec: data.spec,
      workerId: workerId
    });
  } else if (data.type === "palette") {
    palette = data.palette;
  }
};
