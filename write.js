function encode(data, named = true, defaultType = -1, defaultName) {
  let ret = [];

  let keys;
  if (named) {
    keys = Object.keys(data);
  } else {
    keys = data;
  }

  for (key of keys) {
    let split = named ? key.split(" ") : "oof";
    let name = named ? split.slice(1).join(" ") : defaultName;
    let typeName = split[0];
    let type = nameToCode(defaultType === -1 ? typeName : defaultType);

    let dat;
    if (named) {
      dat = data[key];
    } else {
      dat = key;
    }

    if (type === 1) {
      // Byte

      if (typeof dat === "number" && Math.round(dat) === dat) {
        if (dat < 128 && dat > -129) {
          if (named) {
            ret = ret.concat([1]).concat(stringToBuffer(name))
          }
          ret = ret.concat(byteToBuffer(dat));
        } else {
          throw `The byte "${name}" is out of range for type "byte"`;
        }
      } else {
        throw `The byte "${name}" isn't of type "byte"`;
      }
    } else if (type === 2) {
      // Short int, 16 bits

      if (typeof dat === "number" && Math.round(dat) === dat) {
        if (dat < 32768 && dat > -32769) {
          if (named) {
            ret = ret.concat([2]).concat(stringToBuffer(name))
          }
          ret = ret.concat(shortToBuffer(dat));
        } else {
          throw `The short "${name}" is out of range for type "short"`;
        }
      } else {
        throw `The short "${name}" isn't of type "short"`;
      }
    } else if (type === 3) {
      // Int, 32 bits

      if (typeof dat === "number" && Math.round(dat) === dat) {
        if (dat < 2147483648 && dat > -2147483649) {
          if (named) {
            ret = ret.concat([3]).concat(stringToBuffer(name))
          }
          ret = ret.concat(intToBuffer(dat));
        } else {
          throw `The int "${name}" is out of range for type "int"`;
        }
      } else {
        throw `The int "${name}" isn't of type "int"`;
      }
    } else if (type === 4) {
      // Long, 64 bits

      if (typeof dat === "bigint") {
        if (dat < 8791026472627208192n && dat > -9223372036854775809n) {
          if (named) {
            ret = ret.concat([4]).concat(stringToBuffer(name))
          }
          ret = ret.concat(longToBuffer(dat));
        } else {
          throw `The long "${name}" is out of range for type "long"`;
        }
      } else {
        throw `The long "${name}" isn't of type "long". Longs must be passed in as bigints`;
      }
    } else if (type === 5) {
      // 32 bit float

      if (typeof dat === "number") {
        try {
          if (named) {
            ret = ret.concat([5]).concat(stringToBuffer(name))
          }
          ret = ret.concat(floatToBuffer(dat));
        } catch {
          throw `The float "${name}" is likely out of range for type "float"`;
        }
      } else {
        throw `The float "${name}" isn't of type "float"`;
      }
    } else if (type === 6) {
      // 64 bit float, aka double

      if (typeof dat === "number") {
        try {
          if (named) {
            ret = ret.concat([6]).concat(stringToBuffer(name))
          }
          ret = ret.concat(doubleToBuffer(dat));
        } catch {
          throw `The double "${name}" is likely out of range for type "double"`;
        }
      } else {
        throw `The double "${name}" isn't of type "double"`;
      }
    } else if (type === 7) {
      // Byte array

      if (Array.isArray(dat)) {
        if (dat.length < 2147483648) {
          if (named) {
            ret = ret.concat([7]).concat(stringToBuffer(name));
          }
          ret = ret.concat(intToBuffer(dat.length));

          let array = [];
          for (let i = 0; i < dat.length; i++) {
            if (dat[i] < 128 && dat[i] > -129) {
              array.push(byteToBuffer(dat[i]));
            } else {
              throw `The byte array "${name}" has elements that aren't bytes`;
            }
          }

          ret = ret.concat(array);
        } else {
          throw `The byte array "${name}" is too long`;
        }
      } else {
        throw `The byte array "${name}" isn't of type "byte array". Byte arrays must be passed as arrays`;
      }
    } else if (type === 8) {
      // String

      if (typeof dat === "string") {
        if (named) {
          ret = ret.concat([8]).concat(stringToBuffer(name))
        }
        ret = ret.concat(stringToBuffer(dat));
      } else {
        throw `The string "${name} isn't of type "string"`;
      }
    } else if (type === 9) {
      // List

      if (Array.isArray(dat)) {
        if (dat.length < 2147483648) {
          if (named) {
            ret = ret.concat([9]).concat(stringToBuffer(name.split(" ")[1]));
          }
          ret = ret.concat(nameToCode(key.split(" ")[1])).concat(intToBuffer(dat.length)).concat(Array.from(encode(dat, false, key.split(" ")[1])));
        } else {
          throw `The list ${name} is too long`;
        }
      } else {
        throw `The list "${name}" isn't of type "list". Lists must be passed as arrays`;
      }
    } else if (type === 10) {
      // Compound

      if (typeof dat === "object") {
        if (named) {
          ret = ret.concat([10]).concat(stringToBuffer(name));
        }
        ret = ret.concat(Array.from(encode(dat))).concat([0]);
      } else {
        throw `The compound "${name}" isn't of type "compound". Compounds must be passed as objects`;
      }
    } else if (type === 11) {
      // Int array

      if (Array.isArray(dat)) {
        if (dat.length < 2147483648) {
          if (named) {
            ret = ret.concat([11]).concat(stringToBuffer(name));
          }
          ret = ret.concat(intToBuffer(dat.length));

          let array = [];
          for (let i = 0; i < dat.length; i++) {
            if (dat[i] < 2147483648 && dat[i] > -2147483649) {
              array = array.concat(intToBuffer(dat[i]));
            } else {
              throw `The int array "${name}" has elements that aren't ints`;
            }
          }

          ret = ret.concat(array);
        } else {
          throw `The int array "${name}" is too long`;
        }
      }
    } else if (type === 12) {
      if (dat.length < 2147483648) {
        if (named) {
          ret = ret.concat([12]).concat(stringToBuffer(name));
        }
        ret = ret.concat(intToBuffer(dat.length));

        let array = [];
        for (let i = 0; i < dat.length; i++) {
          if (typeof dat[i] === "bigint" && dat[i] < 9223372036854775808n && dat[i] > -9223372036854775809n) {
            array = array.concat(longToBuffer(dat[i]));
          } else {
            throw `The long array "${name}" has elements that aren't longs. Longs must be passed as bigints. The value is ${dat[i]} ${dat[i] < 9223372036854775808n}`;
          }
        }

        ret = ret.concat(array);
      } else {
        throw `The byte array "${name}" is too long`;
      }
    }
  }

  return new Buffer.from(ret);
}

function stringToBuffer(str) {
  let array = Array.from((new TextEncoder("utf-8")).encode(str));
  return shortToBuffer(array.length).concat(array);
}

function byteToBuffer(byte) {
  let buffer = [];
  if (byte >= 0) {
    buffer.push(byte);
  } else {
    buffer.push(byte + 256);
  }

  return buffer;
}

function shortToBuffer(short) {
  let a;
  let b;
  if (short >= 0) {
    a = Math.floor(short / 256);
    b = short % 256;
  } else {
    a = Math.floor((short + 65536) / 256);
    b = (short + 65536) % 256;
  }
  return [a, b];
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

function longToBuffer(long) {
  let a = long / (256n ** 7n) + (long < 0n ? 256n : 0n);
  long -= (a - (long < 0n ? 256n : 0n)) * (256n ** 7n);
  let b = long / (256n ** 6n);
  long -= b * (256n ** 6n);
  let c = long / (256n ** 5n);
  long -= c * (256n ** 5n);
  let d = long / (256n ** 4n);
  long -= d * (256n ** 4n);
  let e = long / (256n ** 3n);
  long -= e * (256n ** 3n);
  let f = long / (256n ** 2n);
  long -= f * (256n ** 2n);
  let g = long / (256n ** 1n);
  long -= g * (256n ** 1n);
  let h = long;
  return [Number(a), Number(b), Number(c), Number(d), Number(e), Number(f), Number(g), Number(h)];
}

function floatToBuffer(float) {
  let buffer = new Buffer.from([0, 0, 0, 0]);
  buffer.writeFloatBE(float);
  return Array.from(buffer);
}

function doubleToBuffer(double) {
  let buffer = new Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]);
  buffer.writeDoubleBE(double);
  return Array.from(buffer);
}

function nameToCode(typeName) {
  let type;
  switch (typeName) {
    case "byte":
      type = 1;
      break;
    case "short":
      type = 2;
      break;
    case "int":
      type = 3;
      break;
    case "long":
      type = 4;
      break;
    case "float":
      type = 5;
      break;
    case "double":
      type = 6;
      break;
    case "byteArray":
      type = 7;
      break;
    case "string":
      type = 8;
      break;
    case "list":
      type = 9;
      break;
    case "compound":
      type = 10;
      break;
    case "intArray":
      type = 11;
      break;
    case "longArray":
      type = 12;
      break;
  }
  return type;
}

module.exports = encode;