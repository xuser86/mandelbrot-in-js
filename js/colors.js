const palettes = [[
    [66, 30, 15], // brown 3
    [25, 7, 26], // dark violett
    [9, 1, 47], // darkest blue
    [4, 4, 73], // blue 5
    [0, 7, 100], // blue 4
    [12, 44, 138], // blue 3
    [24, 82, 177], // blue 2
    [57, 125, 209], // blue 1
    [134, 181, 229], // blue 0
    [211, 236, 248], // lightest blue
    [241, 233, 191], // lightest yellow
    [248, 201, 95], // light yellow
    [255, 170, 0], // dirty yellow
    [204, 128, 0], // brown 0
    [153, 87, 0], // brown 1
    [106, 52, 3] // brown 2
],[
    [255,255,255],
    [210,210,210],
    [168,168,168],
    [127,127,127],
    [84,84,84],
    [42,42,42],
    [0, 0, 0], //7
    [0x4c,0x04,0x14],
    [0xa2,0x12,0x12],
    [0xda,0x33,0x30],
    [0xff,0x4e,0x41],
    [0xf9,0xc7,0x3f],
    [0xff,0xe0,0x46],
    [0xff,0xe0,0x20]
],[
    [240,249,33],
    [166, 36, 151],
    [13,22,135]
],[
    [255,255,255],
    [0,0,0]
],[
    [84,48,4],
    [140,80,10],
    [191,129,46],
    [223,194,124],
    [246,232,195],
    [245,245,245],
    [199,234,229],
    [128,205,193],
    [53,150,142],
    [0,101,93],
    [0,59,48],

    [42, 52, 22]
],/*[
    [60, 153, 178],
    [86, 166, 186],
    [113, 179, 194],
    [158, 191, 145],
    [209, 199, 76],
    [233, 197, 32],
    [228, 184, 13],
    [226, 158, 0],
    [234, 92, 0],
    [242, 35, 0],

    //[250, 120, 120],
    [180, 210, 210],
    [160, 180, 180],
    [90, 170, 180]
  ],*/[
    [41, 187, 156],
    [56, 201, 115],
    [58, 153, 216],
    [154, 92, 180],
    [230, 36, 101],
    [228, 76,  65],
    [228, 126, 48],
    [239, 194, 48]
]];

function interpolate(colors, targetNum) {
  if (colors.length > targetNum) {
    throw new Error('Color reduction not implemented');
  }
  let result = [];

  for (let didx = 0; didx < targetNum; didx++) {
    const idx = didx/(targetNum - 1);
    const sidx = (colors.length - 1) * idx;

    const sidxLow = Math.floor(sidx);
    const sidxHigh = Math.ceil(sidx);

    if (sidxLow === sidxHigh) {
      result[didx] = colors[sidxLow];
    } else {
      const colorLow = colors[sidxLow];
      const colorHigh = colors[sidxHigh];
      const prop = sidx - sidxLow;

      result.push([
        Math.round(colorLow[0] + (colorHigh[0] - colorLow[0]) * prop),
        Math.round(colorLow[1] + (colorHigh[1] - colorLow[1]) * prop),
        Math.round(colorLow[2] + (colorHigh[2] - colorLow[2]) * prop)
      ]);
    }
  }

  return result;
}

function extend(pallete, num) {
  let palette0 = [];

  if (pallete.length < 16) {
    palette0.push(...interpolate([...pallete, pallete[0]], 16));
  } else {
    palette0 = [...pallete];
  }
  
  let pow = 5;//Math.floor(Math.log2(pallete.length)+1);
  while (palette0.length < num) {
    palette0.push(...interpolate([...pallete, pallete[0]], Math.pow(2, pow)));
    pow++;
  } 

  return palette0;
}

export default {
  palettes, interpolate, extend
};