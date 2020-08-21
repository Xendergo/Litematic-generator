// const {
//   performance
// } = require('perf_hooks');

const π = Math.PI;

const zlib = require("zlib");
const fs = require('fs');
const png = require("png-js");

// const read = require(`${__dirname}/read.js`);
const write = require(`${__dirname}/write.js`);

//https://xendergo.github.io/Julia/?iterator=julia&maxnum=25&control=false&addx=-0.640625&addy=-0.47265625&x=-0.0087890625&y=-0.0048828125&autozoom=0.25
let addX = -0.640625;
let addY = -0.47265625;

let w = 128;
let w2 = 128;
let h = 0;
let imgw = 775;
let imgh = 850;

let colors = JSON.parse(fs.readFileSync("colors.json"));
let keys = Object.keys(colors);

let blockPalette = ["minecraft:air", "minecraft:netherrack"];
let bitBlocks = "";

function graph(x, y) {
  return (Math.sin(4 * π * x) * Math.sin(5 * π * y) + 1) / 2;
}

png.decode("ferret.png", (pixels) => {
  let imageColors = (new Array(w));
  for (let i = imageColors.length - 1; i >= 0; i--) {
    imageColors[i] = [];
  }

  for (let i = 0; i < w * w2; i++) {
    let x = (i % w) * (imgw / w);
    let y = Math.floor(i / w2) * (imgh / w2);
    pixel = (Math.round(y) * imgw + Math.round(x)) * 4;
    let a = pixels[pixel + 3] / 255;
    let r = pixels[pixel] * a;
    let g = pixels[pixel + 1] * a;
    let b = pixels[pixel + 2] * a;
    imageColors[Math.floor(i % w)].push([r, g, b]);
    // imageColors.push([i % 3 === 0 ? 255 : 0, i % 2 === 0 ? 255 : 0, 0]);
  }

  // console.log("Generating heightmap");
  // let heights = [];
  // for (let i = 0; i < w; i++) {
  //   for (let j = 0; j < w2; j++) {
  //     heights.push(value((i - w / 2) / 64, (j - w2 / 2) / 64));
  //   }
  // }

  // console.log("Generating list of blocks");
  // for (let k = 0; k < h; k++) {
  //   for (let i = 0; i < w; i++) {
  //     for (let j = 0; j < w2; j++) {
  //       bitBlocks = (k < heights[i + j * w] ? (k < 24 ? "01" : "11") : (k < 22 ? "10" : "00")) + bitBlocks;
  //     }
  //   }
  // }

  const multipliers = [1, 0.86, 0.71];

  for (let i = 0; i < imageColors.length; i++) {
    let nextHeight = 0;
    console.log(i);
    for (let l = imageColors[i].length - 1; l >= 0; l--) {
      let min = Infinity;
      let block;
      let offset = 0;
      for (let j = keys.length - 1; j >= 0; j--) {
        for (let k = 0; k < 3; k++) {
          let score = 0;
          let multiplier = multipliers[k];
          let color = colors[keys[j]];
          let imgColor = imageColors[i][l]
          score += Math.abs(imgColor[0] - color[0] * multiplier);
          score += Math.abs(imgColor[1] - color[1] * multiplier);
          score += Math.abs(imgColor[2] - color[2] * multiplier);
          if (score < min) {
            min = score;
            block = keys[j];
            offset = k - 1;
          }
        }
      }

      imageColors[i][l] = ["minecraft:" + block, nextHeight];

      nextHeight += offset;
    }
    imageColors[i].unshift(["minecraft:netherrack", nextHeight]);
  }

  for (let i = imageColors.length - 1; i >= 0; i--) {
    for (let l = imageColors[i].length - 1; l >= 0; l--) {
      let paletteIndex = blockPalette.indexOf(imageColors[i][l][0]);
      if (paletteIndex === -1) {
        blockPalette.push(imageColors[i][l][0]);
      }
    }
  }

  let bits = 2;
  while (2 ** bits < blockPalette.length) {
    bits++;
  }

  console.log(bits, blockPalette.length);

  for (let i = imageColors.length - 1; i >= 0; i--) {
    let min = 0;
    for (let l = imageColors[i].length - 1; l >= 0; l--) {
      imageColors[i][l][0] = blockPalette.indexOf(imageColors[i][l][0]).toString(2).padStart(bits, "0");

      if (imageColors[i][l][1] < min) {
        min = imageColors[i][l][1];
      }
    }

    for (let l = imageColors[i].length - 1; l >= 0; l--) {
      imageColors[i][l][1] -= min;

      if (imageColors[i][l][1] > h) {
        h = imageColors[i][l][1];
      }

      if (imageColors[i][l][1] < 0) {
        console.log(imageColors[i][l][1]);
      }
    }
  }

  h++;
  w2++;

  for (let k = 0; k < h; k++) {
    for (let j = 0; j < w2; j++) {
      for (let i = 0; i < w; i++) {
        bitBlocks = (k === imageColors[i][j][1] ? imageColors[i][j][0] : "00".padStart(bits, "0")) + bitBlocks;
      }
    }
  }

  console.log("Convering list of blocks to long array");
  let BlockStatePalette = [];
  for (let i = 0; i < blockPalette.length; i++) {
    BlockStatePalette.push({
      "string Name": blockPalette[i]
    });
  }

  // console.log(imageColors);
  let blockStates = bitBlocks.split("").reverse().join("").match(/.{1,64}/g);
  for (let i = blockStates.length - 1; i >= 0; i--) {
    blockStates[i] = blockStates[i].split("").reverse().join("").padStart(64, "0");
  }

  let blockStatesBuffer = [];

  let len = blockStates.length
  for (let i = 0; i < len; i++) {
    let split = blockStates[i].match(/.{1,8}/g);
    for (let j = 0; j < 8; j++) {
      blockStatesBuffer.push(Number("0b" + split[j]));
    }
  }
  console.log(blockStatesBuffer.length);


  const litematic = {
    "compound ": {
      "compound Metadata": {
        "compound EnclosingSize": {
          "int x": w,
          "int y": h,
          "int z": w2
        },
        "string Author": "F4Tornado",
        "string Description": "A normal map",
        "string Name": "Auto generated map",
        "int RegionCount": 1,
        "long TimeCreated": BigInt(Date.now()),
        "long TimeModified": BigInt(Date.now()),
        "int TotalBlocks": w * w2,
        "int TotalVolume": w * w2 * h
      },
      "compound Regions": {
        "compound Map": {
          "compound Position": {
            "int x": 0,
            "int y": 0,
            "int z": 0
          },
          "compound Size": {
            "int x": w,
            "int y": h,
            "int z": w2
          },
          "list compound BlockStatePalette": BlockStatePalette,
          "list compound Entities": [],
          "list compound PendingBlockTicks": [],
          "list compound PendingFluidTicks": [],
          "list compound TileEntities": [],
          "longArray BlockStates": blockStatesBuffer
        }
      },
      "int MinecraftDataVersion": 2567,
      "int Version": 5
    }
  }

  // fs.writeFileSync("D:/all items/games/.minecraft/schematics/test.litematic", write(litematic));
  // console.log(read(write(litematic))[0])

  console.log("Encoding & compressing file");
  zlib.gzip(logWrite(litematic), (err, data) => {
    if (err) throw err;
    console.log("Writing file");
    fs.writeFileSync("D:/all items/games/.minecraft/schematics/step_map_test.litematic", data);
  });

});

function toBigInt(buffer) {
  let sum = 0n;
  for (let i = buffer.length - 1; i >= 0; i--) {
    sum += BigInt(buffer[i]) * BigInt(256 ** (buffer.length - 1 - i));
  }

  if (buffer[0] > 127n) {
    sum -= (256n ** BigInt(buffer.length));
  }

  return sum;
}

function value(x, y) {
  let newX = x;
  let newY = y;
  let num = 0;
  for (let i = 0; i < 25 && !(newX > 2 || newY > 2 || newX < -2 || newY < -2); i++) {
    let temp = [(newX ** 2 - newY ** 2) + addX, (2 * newX * newY) + addY];
    newX = temp[0];
    newY = temp[1];
    num++;
  }
  return Math.sqrt(num / 25) * 25;
}

function logWrite(data) {
  console.log("Encoding data");
  return write(data);
}

// console.log((3770512433891064017n).toString(2), (5374165438798n).toString(2));