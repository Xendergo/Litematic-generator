function parse(buffer, named = true, amt = Infinity, type = -1) {
  let ret;
  if (named) {
    ret = {};
  } else {
    ret = [];
  }

  let i = 0;
  while (i < buffer.length) {
    let tag = buffer[i];
    if (type > -1) {
      tag = type;
    }

    if (tag === 0 || amt === 0) {
      // End of a compound or list
      return [ret, i];
    } else if (tag === 1) {
      // Single byte
      if (named) {
        i++;
        var name = toString(buffer, i);
        i = name.newStart;
      }
      if (named) {
        ret["byte " + name.str] = toInt([buffer[i]]);
      } else {
        ret.push(toInt([buffer[i]]));
      }
      i++;
    } else if (tag === 2) {
      // 16 bit integer
      if (named) {
        i++;
        var name = toString(buffer, i);
        i = name.newStart;
      }

      if (named) {
        ret["short " + name.str] = toInt(buffer.slice(i, i + 2));
      } else {
        ret.push(toInt(buffer.slice(i, i + 2)));
      }

      i += 2;
    } else if (tag === 3) {
      // 32 bit integer
      if (named) {
        i++;
        var name = toString(buffer, i);
        i = name.newStart;
      }

      if (named) {
        ret["int " + name.str] = toInt(buffer.slice(i, i + 4));
      } else {
        ret.push(toInt(buffer.slice(i, i + 4)));
      }

      i += 4;
    } else if (tag === 4) {
      // 64 bit integer
      if (named) {
        i++;
        var name = toString(buffer, i);
        i = name.newStart;
      }

      if (named) {
        ret["long " + name.str] = toInt(buffer.slice(i, i + 8));
      } else {
        ret.push(toInt(buffer.slice(i, i + 8)));
      }

      i += 8;
    } else if (tag === 5) {
      // 32 bit float
      if (named) {
        i++;
        var name = toString(buffer, i);
        i = name.newStart;
      }

      if (named) {
        ret["float " + name.str] = toFloat(buffer.slice(i, i + 4));
      } else {
        ret.push(toFloat(buffer.slice(i, i + 4)))
      }

      i += 4;
    } else if (tag === 6) {
      // 64 bit float, AKA double
      if (named) {
        i++;
        var name = toString(buffer, i);
        i = name.newStart;
      }

      if (named) {
        ret["double" + name.str] = toFloat(buffer.slice(i, i + 8));
      } else {
        ret.push(toFloat(buffer.slice(i, i + 8)));
      }

      i += 8;
    } else if (tag === 7) {
      // Byte array
      if (named) {
        i++;
        var name = toString(buffer, i);
        i = name.newStart;
      }

      let len = toInt(buffer.slice(i, i + 4));
      i += 4;
      let arr = [];
      let end = i + len;

      while (i < end) {
        arr.push(buffer[i]);
        i++;
      }

      if (named) {
        ret["byteArray " + name.str] = arr;
      } else {
        ret.push(arr);
      }
    } else if (tag === 8) {
      // String
      if (named) {
        i++;
        var name = toString(buffer, i);
        i = name.newStart;
      }

      let str = toString(buffer, i);
      i = str.newStart;

      if (named) {
        ret["string " + name.str] = str.str;
      } else {
        ret.push(str.str);
      }
    } else if (tag === 9) {
      // List
      if (named) {
        i++;
        var name = toString(buffer, i);
        i = name.newStart;
      }

      let listType = buffer[i];
      i++;

      let len = toInt(buffer.slice(i, i + 4));
      i += 4;

      let data = parse(buffer.slice(i), false, len, listType);

      if (named) {
        ret[`list ${codeToName(listType)} ` + name.str] = data[0];
      } else {
        ret.push(parse(buffer.slice(i), false, len, listType));
      }
      i += data[1];
    } else if (tag === 10) {
      // Compound
      if (named) {
        i++;
        let name = toString(buffer, i);
        i = name.newStart;

        let data = parse(buffer.slice(i));
        i += data[1] + 1;
        ret["compound " + name.str] = data[0];
      } else {
        let data = parse(buffer.slice(i));
        i += data[1] + 1;
        ret.push(data[0]);
      }
    } else if (tag === 11) {
      // Int array
      if (named) {
        i++;
        var name = toString(buffer, i);
        i = name.newStart;
      }

      let len = toInt(buffer.slice(i, i + 4));
      i += 4;
      let arr = [];
      let end = i + len * 4;

      while (i < end) {
        arr.push(toInt(buffer.slice(i, i + 4)));
        i += 4;
      }

      if (named) {
        ret["intArray " + name.str] = arr;
      } else {
        ret.push(arr);
      }
    } else if (tag === 12) {
      // Long array
      if (named) {
        i++;
        var name = toString(buffer, i);
        i = name.newStart;
      }

      let len = toInt(buffer.slice(i, i + 4));
      i += 4;
      let arr = [];
      let end = i + len * 8;

      while (i < end) {
        arr.push(toBigInt(buffer.slice(i, i + 8), true));
        i += 8;
      }

      if (named) {
        ret["longArray " + name.str] = arr;
      } else {
        ret.push(arr);
      }
    }
    amt--;
  }

  return [ret, buffer.length - 1];
}

function codeToName(code) {
  let name;
  switch (code) {
    case 1:
      name = "byte";
      break;
    case 2:
      name = "short";
      break;
    case 3:
      name = "int";
      break;
    case 4:
      name = "long";
      break;
    case 5:
      name = "float";
      break;
    case 6:
      name = "double";
      break;
    case 7:
      name = "byteArray";
      break;
    case 8:
      name = "string";
      break;
    case 9:
      name = "list";
    case 10:
      name = "compound";
    case 11:
      name = "intArray";
      break;
    case 12:
      name = "longArray";
      break;
  }

  return name;
}

function toInt(buffer) {
  let sum = 0;
  for (let i = buffer.length - 1; i >= 0; i--) {
    sum += buffer[i] * (256 ** (buffer.length - 1 - i));
  }

  if (buffer[0] > 127) {
    sum -= (256 ** buffer.length);
  }

  return sum;
}

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

function binToNumber(bin) {
  sum = 0;
  for (let i = bin.length - 1; i >= 0; i--) {
    if (bin[i] === "1") {
      sum += 2 ** (bin.length - 1 - i);
    }
  }

  return sum;
}

function toFloat(buffer) {
  let bin = "";
  for (let i = 0; i < buffer.length; i++) {
    bin += buffer[i].toString(2).padStart(8, "0");
  }
  if (buffer.length === 4) {
    var sign = bin[0];
    var exp = binToNumber(bin.slice(1, 9)) - 127;
    var mant = binToNumber(("1" + bin.slice(9))) / (2 ** 23);
  } else if (buffer.length === 8) {
    var sign = bin[0];
    var exp = binToNumber(bin.slice(1, 12)) - 1023;
    var mant = binToNumber(("1" + bin.slice(12))) / (2 ** 52);
  }

  return (2 ** exp) * mant * (sign === "1" ? -1 : 1);
}

function toString(buffer, start) {
  let length = toInt(buffer.slice(start, start + 2));
  let newStart = start + length + 2;

  let str = buffer.slice(start + 2, newStart).toString("utf-8");
  return {
    str,
    newStart
  };
}

module.exports = parse;