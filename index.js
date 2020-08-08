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

let w = 5;
let h = 5;
// let imgw = 1030;
// let imgh = 360;
let imgw = 984;
let imgh = 984;

let colors = JSON.parse(fs.readFileSync("colors.json"));
let keys = Object.keys(colors);

let blockPalette = ["minecraft:air", "minecraft:emerald_block", "minecraft:redstone_block", "minecraft:black_terracotta", "minecraft:gold_block"];
let blocks = [];

png.decode("xendergo logo.png", (pixels) => {
  let imageColors = [];
  for (let i = 0; i < w * h; i++) {
    // let x = (i % w) * (imgw / w);
    // let y = Math.floor(i / h) * (imgh / h);
    // pixel = (Math.round(y) * imgw + Math.round(x)) * 4;
    // let a = pixels[pixel + 3] / 255;
    // let r = pixels[pixel] * a;
    // let g = pixels[pixel + 1] * a;
    // let b = pixels[pixel + 2] * a;
    // imageColors.push([r, g, b]);
    imageColors.push([i % 3 === 0 ? 255 : 0, i % 2 === 0 ? 255 : 0, 0]);
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
  while (2 ** bits - 1 < blockPalette.length) {
    bits++;
  }
  console.log(bits, "bits");

  let bitBlocks = [];
  for (let i = blocks.length - 1; i >= 0; i--) {
    bitBlocks.unshift(blocks[i].toString(2).padStart(bits, "0"));
  }

  let blockStates = [];
  while (bitBlocks.length !== 0) {
    let long = [];
    let longLength = 0;
    while (longLength < 64 && bitBlocks.length !== 0) {
      let toPush = bitBlocks.shift();
      long.unshift(toPush);
      longLength += toPush.length;
    }

    console.log(long);
    long = long.join("");
    console.log(long)

    if (long.length > 64) {
      bitBlocks.unshift(long.substr(0, longLength - 64));
      long = long.substr(longLength - 64);
    }

    blockStates.push(long);
  }

  console.log(blockStates);


  for (let i = blockStates.length - 1; i >= 0; i--) {
    // console.log(blockStates[i], blockStates[i].length);
    let split = blockStates[i].match(/.{1,8}/g);
    let buffer = [];
    for (let j = split.length - 1; j >= 0; j--) {
      buffer.unshift(Number("0b" + split[j]));
    }
    // console.log(split);
    blockStates[i] = toBigInt(buffer);
  }


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
          "longArray BlockStates": blockStates
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

// console.log((3770512433891064017n).toString(2), (5374165438798n).toString(2));