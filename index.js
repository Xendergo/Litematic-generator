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

// zlib.gzip(write({
//   "compound thingy": {
//     "list byte thingy": [0, 1, 2, 3, 4, 5, 6, 7],
//     "string name": "ɮendergo",
//     "list compound": [{
//       "byte x": 1,
//       "byte y": 2,
//       "byte z": 3
//     }, {
//       "float π": 3.14,
//       "double e": 2.718,
//       "intArray fibonacci": [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
//     }]
//   }
// }), (err, data) => {
//   fs.writeFileSync("test.nbt", data);
// })

// console.log(read(write({
//   "compound thingy": {
//     "longArray twpsyn": [1000n, 2000n, 3000n, 4000n]
//   }
// }))[0]);