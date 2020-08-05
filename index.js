const zlib = require("zlib");
var fs = require('fs');

const read = require(`${__dirname}/read.js`);
const write = require(`${__dirname}/write.js`);

// fs.readFile('test.nbt', function (err, buffer) {
//   // zlib.gunzip(data, function (err, buffer) {
//   // console.log(JSON.stringify(parse(buffer)[0]));
//   console.log(read(buffer)[0]);
//   // });
// });

let n = 128;

let volume = 0;
let blockStates = "";
for (let i = 0; i < n ** 2; i++) {
  if (Math.random() > 0.5) {
    blockStates += "00";
  } else {
    blockStates += "01";
    volume++;
  }
}

blockStates = blockStates.match(/.{1,64}/g);

let blockStatesArray = [];
for (let i = 0; i < blockStates.length; i++) {
  blockStatesArray.push(BigInt("0b" + blockStates[i]) - 9223372036854775808n);
}

console.log(blockStatesArray);

const litematic = {
  "compound ": {
    "compound Metadata": {
      "compound EnclosingSize": {
        "int x": n,
        "int y": 1,
        "int z": n
      },
      "string Author": "F4Tornado",
      "string Description": "A normal map",
      "string Name": "Auto generated map",
      "int RegionCount": 1,
      "long TimeCreated": BigInt(Date.now()),
      "long TimeModified": BigInt(Date.now()),
      "int TotalBlocks": volume,
      "int TotalVolume": n ** 2
    },
    "compound Regions": {
      "compound Map": {
        "compound Position": {
          "int x": 0,
          "int y": 0,
          "int z": 0
        },
        "compound Size": {
          "int x": n,
          "int y": 1,
          "int z": n
        },
        "list compound BlockStatePalette": [{
          "string Name": "minecraft:air"
        }, {
          "string Name": "minecraft:red_concrete"
        }],
        "list compound Entities": [],
        "list compound PendingBlockTicks": [],
        "list compound PendingFluidTicks": [],
        "list compound TileEntities": [],
        "longArray BlockStates": blockStatesArray
      }
    },
    "int MinecraftDataVersion": 2230,
    "int Version": 5
  }
}

// fs.writeFileSync("D:/all items/games/.minecraft/schematics/test.litematic", write(litematic));
// console.log(read(write(litematic))[0])

// zlib.gzip(write(litematic), (err, data) => {
//   if (err) throw err;
//   fs.writeFileSync("D:/all items/games/.minecraft/schematics/test.litematic", data);
// })