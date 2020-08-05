const zlib = require("zlib");
const fs = require('fs');
const png = require("png-js");

const read = require(`${__dirname}/read.js`);
const write = require(`${__dirname}/write.js`);

// fs.readFile('test.nbt', function (err, buffer) {
//   // zlib.gunzip(data, function (err, buffer) {
//   // console.log(JSON.stringify(parse(buffer)[0]));
//   console.log(read(buffer)[0]);
//   // });
// });

let w = 8;
let h = 8;
// let imgw = 1030;
// let imgh = 360;
let imgw = 984;
let imgh = 984;

let colors = JSON.parse(fs.readFileSync("colors.json"));
let keys = Object.keys(colors);

let blockPalette = ["minecraft:air"];
let blocks = [];

png.decode("xendergo logo.png", (pixels) => {
  let imageColors = [];
  for (let i = 0; i < w * h; i++) {
    // let pixel = (Math.floor(i * (imgh / h)) + Math.floor(i * (imgw / w))) * 4;
    // let a = pixels[pixel + 3];
    // let r = pixels[pixel] * a;
    // let g = pixels[pixel + 1] * a;
    // let b = pixels[pixel + 2] * a;
    // imageColors.push([r, g, b]);
    imageColors.push([i % 3 === 0 ? 255 : 0, 255, 255])
  }

  for (let i = 0; i < imageColors.length; i++) {
    let min = Infinity;
    let block;
    for (let j = keys.length - 1; j >= 0; j--) {
      let score = 0;
      score += Math.abs(imageColors[i][0] - colors[keys[j]][0]);
      score += Math.abs(imageColors[i][1] - colors[keys[j]][1]);
      score += Math.abs(imageColors[i][2] - colors[keys[j]][2]);
      if (score < min) {
        min = score;
        block = keys[j];
      }
    }

    block = "minecraft:" + block;
    let paletteIndex = blockPalette.indexOf(block);
    if (paletteIndex === -1) {
      paletteIndex = blockPalette.length;
      blockPalette.push(block);
    }
    blocks.push(paletteIndex);
  }

  for (let i = 0; i < w * h; i += w) {
    let table = [];
    table.push(blocks.slice(i, i + w));
    console.log(table.join("\n"))
  }

  let BlockStatePalette = [];
  for (let i = 0; i < blockPalette.length; i++) {
    BlockStatePalette.push({
      "string Name": blockPalette[i]
    });
  }

  let bits = 2;
  while (2 ** bits < blockPalette.length) {
    bits++;
  }

  let blockStatesBits = [];
  for (let i = 0; i < blocks.length; i++) {
    blockStatesBits.push(blocks[i].toString(2).padStart(bits, "0"));
  }

  // blockStatesBits = blockStatesBits.reverse().join("");

  if (parseInt(blockStatesBits.slice(0, bits)) === 0) {
    blockStatesBits = blockStatesBits.slice(bits);
  }

  let blockStatesSplit = blockStatesBits.join("").match(/.{1,8}/g);

  for (let i = 0; i < w * h; i += w) {
    let table = [];
    table.push(blockStatesSplit);
    console.log(table.join("\n"))
  }

  let buffer = [];
  for (let i = blockStatesSplit.length - 1; i >= 0; i--) {
    buffer.unshift(Number("0b" + blockStatesSplit[i]))
  }

  buffer = buffer.reverse();

  while (buffer.length % 8 !== 0) {
    buffer.push(0);
  }

  buffer = intToBuffer(Math.ceil(buffer.length / 8)).concat(buffer);

  console.log(buffer);

  buffer = Buffer.from(buffer)

  const litematic = {
    "compound ": {
      "compound Metadata": {
        "compound EnclosingSize": {
          "int x": w,
          "int y": 1,
          "int z": h
        },
        "string Author": "F4Tornado",
        "string Description": "A normal map",
        "string Name": "Auto generated map",
        "int RegionCount": 1,
        "long TimeCreated": BigInt(Date.now()),
        "long TimeModified": BigInt(Date.now()),
        "int TotalBlocks": w * h,
        "int TotalVolume": w * h
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
            "int y": 1,
            "int z": h
          },
          "list compound BlockStatePalette": BlockStatePalette,
          "list compound Entities": [],
          "list compound PendingBlockTicks": [],
          "list compound PendingFluidTicks": [],
          "list compound TileEntities": [],
          "longArray BlockStates": buffer
        }
      },
      "int MinecraftDataVersion": 2567,
      "int Version": 5
    }
  }

  // fs.writeFileSync("D:/all items/games/.minecraft/schematics/test.litematic", write(litematic));
  // console.log(read(write(litematic))[0])

  zlib.gzip(write(litematic), (err, data) => {
    if (err) throw err;
    fs.writeFileSync("D:/all items/games/.minecraft/schematics/test.litematic", data);
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

function intToBuffer(int) {
  let a = Math.floor(int / (256 ** 3)) + (int < 0 ? 256 : 0);
  int -= (a - (int < 0 ? 256 : 0)) * (256 ** 3);
  let b = Math.floor(int / (256 ** 2));
  int -= b * (256 ** 2);
  let c = Math.floor(int / (256));
  int -= c * (256);
  let d = int;
  return [a, b, c, d];
}

console.log(Array.isArray(Buffer.from([0, 0])));