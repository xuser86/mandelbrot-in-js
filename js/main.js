import fractal from "/js/fractal.js";
import colors from "/js/colors.js";
//import {ColorEditor} from '/js/color-editor.js';

if (typeof SharedArrayBuffer === "undefined") {
  document.getElementById("shared-buf-warn").style.display = "";
} else {
  document.getElementById("help-screen").style.display = "";
}

const canvas = document.getElementById("main-canvas");
const colorEditor = document.getElementById("color-editor-1");

const places = [
  { range: 2.5, center: { x: -0.75, y: 0 } },
  {
    range: 0.00029,
    center: { x: -1.367, y: -0.02599 }
  },
  {
    range: 0.0000819,
    center: { x: -1.7715, y: -0.007975 }
  }
];
let placeId = 0;

let rangeGl = places[placeId].range; //0.00008197962619625785; //
let centerGl = places[placeId].center; //{ x: -1.5, y: 0 }; // { x: -1.7715283223160918, y: -0.007975972737360167 }; //
let iterationsGl = 1500;
let paletteIndex = 0;

//console.log(palette);

fractal.init(canvas, colors.extend(colors.palettes[0], 12000));

function fitSize(ev) {
  fractal.setup();
  fractal.draw(centerGl, rangeGl, iterationsGl);
}

function changePallete(palData) {
  fractal.setPalette(colors.extend(palData, 12000));
  fractal.draw(centerGl, rangeGl, iterationsGl);
}

function showPaletteEditor(state) {
  const container = document.getElementById("color-editor-container");
  container.style.display = !state ? "none" : "";

  if (state && colorEditor.palette.length === 0) {
    colorEditor.palette = colors.palettes[paletteIndex];
  }
}

colorEditor.addEventListener("change", ev => {
  console.log(ev);
  changePallete(ev.detail);
});

document.getElementById("ok-help").addEventListener("click", () => {
  document.getElementById("help-screen").style.display = "none";
});

window.addEventListener("resize", fitSize);
window.addEventListener("load", fitSize);
window.addEventListener("keydown", ev => {
  if (["1", "2", "3", "4", "5", "6"].includes(ev.key)) {
    if (colors.palettes.length > ev.key - 1) {
      changePallete(colors.palettes[ev.key - 1]);
      paletteIndex = ev.key - 1;
      showPaletteEditor(false);
    }
  } else if (["0", "p"].includes(ev.key)) {
    showPaletteEditor(true);
    changePallete(colorEditor.palette);
  } else if (["h"].includes(ev.key)) {
    document.getElementById("help-screen").style.display = "";
  }
});
canvas.addEventListener("contextmenu", ev => {
  ev.preventDefault();
});
canvas.addEventListener("mousedown", ev => {
  const x = ev.clientX;
  const y = ev.clientY;

  const width = canvas.width;
  const height = canvas.height;
  const scale = Math.min(width, height) / rangeGl;

  if (ev.button === 0) {
    rangeGl *= 0.9;
    centerGl.x = (x - width / 2) / scale + centerGl.x;
    centerGl.y = (-y + height / 2) / scale + centerGl.y;

    fractal.draw(centerGl, rangeGl, iterationsGl);
  } else if (ev.button === 1) {
    fractal.draw(centerGl, rangeGl, 12000);
  } else if (ev.button === 2) {
    rangeGl *= 1.1;
    centerGl.x = (x - width / 2) / scale + centerGl.x;
    centerGl.y = (-y + height / 2) / scale + centerGl.y;

    fractal.draw(centerGl, rangeGl, iterationsGl);
  }
});
