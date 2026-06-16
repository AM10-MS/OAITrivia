const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const url = "https://oai-trivia.vercel.app/";
const version = 2;
const size = 17 + version * 4;
const dataCodewords = 34;
const errorCodewords = 10;
const scale = 18;
const quietZone = 4;
const outputPath = path.join(__dirname, "..", "qr-code.svg");
const pngOutputPath = path.join(__dirname, "..", "qr-code.png");

const modules = Array.from({ length: size }, () => Array(size).fill(false));
const isFunction = Array.from({ length: size }, () => Array(size).fill(false));

function setFunctionModule(x, y, dark) {
  modules[y][x] = dark;
  isFunction[y][x] = true;
}

function drawFinder(x, y) {
  for (let dy = -1; dy <= 7; dy += 1) {
    for (let dx = -1; dx <= 7; dx += 1) {
      const xx = x + dx;
      const yy = y + dy;
      if (xx < 0 || xx >= size || yy < 0 || yy >= size) continue;
      const inPattern = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
      const dark = inPattern && (
        dx === 0 || dx === 6 || dy === 0 || dy === 6 ||
        (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)
      );
      setFunctionModule(xx, yy, dark);
    }
  }
}

function drawAlignment(centerX, centerY) {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      setFunctionModule(centerX + dx, centerY + dy, distance !== 1);
    }
  }
}

function drawFunctionPatterns() {
  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);
  drawAlignment(18, 18);

  for (let i = 8; i <= size - 9; i += 1) {
    const dark = i % 2 === 0;
    setFunctionModule(6, i, dark);
    setFunctionModule(i, 6, dark);
  }

  drawFormatBits(0);
  setFunctionModule(8, size - 8, true);
}

function appendBits(bits, value, length) {
  for (let i = length - 1; i >= 0; i -= 1) {
    bits.push(((value >>> i) & 1) === 1);
  }
}

function makeDataCodewords() {
  const bytes = Buffer.from(url, "utf8");
  const bits = [];
  appendBits(bits, 0x4, 4);
  appendBits(bits, bytes.length, 8);
  bytes.forEach((byte) => appendBits(bits, byte, 8));

  const capacityBits = dataCodewords * 8;
  appendBits(bits, 0, Math.min(4, capacityBits - bits.length));
  while (bits.length % 8 !== 0) bits.push(false);

  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j += 1) value = (value << 1) | (bits[i + j] ? 1 : 0);
    codewords.push(value);
  }
  for (let pad = 0xec; codewords.length < dataCodewords; pad ^= 0xfd) {
    codewords.push(pad);
  }
  return codewords;
}

function makeGeneratorPolynomial(degree) {
  let result = [1];
  for (let i = 0; i < degree; i += 1) {
    result = multiplyPolynomials(result, [1, gfPow(2, i)]);
  }
  return result;
}

function multiplyPolynomials(left, right) {
  const result = Array(left.length + right.length - 1).fill(0);
  left.forEach((leftValue, leftIndex) => {
    right.forEach((rightValue, rightIndex) => {
      result[leftIndex + rightIndex] ^= gfMultiply(leftValue, rightValue);
    });
  });
  return result;
}

function makeErrorCodewords(data) {
  const generator = makeGeneratorPolynomial(errorCodewords);
  const result = Array(errorCodewords).fill(0);
  data.forEach((dataByte) => {
    const factor = dataByte ^ result.shift();
    result.push(0);
    generator.slice(1).forEach((coefficient, index) => {
      result[index] ^= gfMultiply(coefficient, factor);
    });
  });
  return result;
}

function gfPow(value, power) {
  let result = 1;
  for (let i = 0; i < power; i += 1) result = gfMultiply(result, value);
  return result;
}

function gfMultiply(left, right) {
  let result = 0;
  for (let i = 7; i >= 0; i -= 1) {
    result = (result << 1) ^ ((result >>> 7) * 0x11d);
    if (((right >>> i) & 1) !== 0) result ^= left;
  }
  return result & 0xff;
}

function drawCodewords(codewords) {
  const bits = [];
  codewords.forEach((codeword) => appendBits(bits, codeword, 8));

  let bitIndex = 0;
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1;
    for (let vertical = 0; vertical < size; vertical += 1) {
      const y = upward ? size - 1 - vertical : vertical;
      for (let column = 0; column < 2; column += 1) {
        const x = right - column;
        if (isFunction[y][x]) continue;
        modules[y][x] = bitIndex < bits.length ? bits[bitIndex] : false;
        bitIndex += 1;
      }
    }
    upward = !upward;
  }
}

function applyMask(mask) {
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!isFunction[y][x] && maskCondition(mask, x, y)) modules[y][x] = !modules[y][x];
    }
  }
}

function maskCondition(mask, x, y) {
  if (mask === 0) return (x + y) % 2 === 0;
  throw new Error(`Unsupported mask ${mask}`);
}

function drawFormatBits(mask) {
  const errorCorrectionBits = 1; // Low error correction.
  const data = (errorCorrectionBits << 3) | mask;
  let bits = data << 10;
  const generator = 0x537;
  for (let i = 14; i >= 10; i -= 1) {
    if (((bits >>> i) & 1) !== 0) bits ^= generator << (i - 10);
  }
  bits = ((data << 10) | bits) ^ 0x5412;

  for (let i = 0; i <= 5; i += 1) setFunctionModule(8, i, getBit(bits, i));
  setFunctionModule(8, 7, getBit(bits, 6));
  setFunctionModule(8, 8, getBit(bits, 7));
  setFunctionModule(7, 8, getBit(bits, 8));
  for (let i = 9; i < 15; i += 1) setFunctionModule(14 - i, 8, getBit(bits, i));
  for (let i = 0; i < 8; i += 1) setFunctionModule(size - 1 - i, 8, getBit(bits, i));
  for (let i = 8; i < 15; i += 1) setFunctionModule(8, size - 15 + i, getBit(bits, i));
}

function getBit(value, index) {
  return ((value >>> index) & 1) !== 0;
}

function toSvg() {
  const imageSize = (size + quietZone * 2) * scale;
  const rects = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!modules[y][x]) continue;
      rects.push(`<rect x="${(x + quietZone) * scale}" y="${(y + quietZone) * scale}" width="${scale}" height="${scale}"/>`);
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${imageSize}" height="${imageSize}" viewBox="0 0 ${imageSize} ${imageSize}" role="img" aria-label="QR code for ${url}">`,
    '<rect width="100%" height="100%" fill="#ffffff"/>',
    '<g fill="#000000">',
    ...rects,
    "</g>",
    "</svg>",
    "",
  ].join("\n");
}

function toPng() {
  const imageSize = (size + quietZone * 2) * scale;
  const dark = [0, 0, 0];
  const light = [255, 255, 255];
  const rows = [];

  for (let y = 0; y < imageSize; y += 1) {
    const row = Buffer.alloc(1 + imageSize * 3);
    row[0] = 0;
    const moduleY = Math.floor(y / scale) - quietZone;
    for (let x = 0; x < imageSize; x += 1) {
      const moduleX = Math.floor(x / scale) - quietZone;
      const isDark = moduleX >= 0 && moduleX < size && moduleY >= 0 && moduleY < size && modules[moduleY][moduleX];
      const color = isDark ? dark : light;
      const offset = 1 + x * 3;
      row[offset] = color[0];
      row[offset + 1] = color[1];
      row[offset + 2] = color[2];
    }
    rows.push(row);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", Buffer.concat([
      uint32(imageSize),
      uint32(imageSize),
      Buffer.from([8, 2, 0, 0, 0]),
    ])),
    pngChunk("IDAT", zlib.deflateSync(Buffer.concat(rows))),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const crcInput = Buffer.concat([typeBuffer, data]);
  return Buffer.concat([
    uint32(data.length),
    typeBuffer,
    data,
    uint32(crc32(crcInput)),
  ]);
}

function uint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0, 0);
  return buffer;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

drawFunctionPatterns();
const data = makeDataCodewords();
const error = makeErrorCodewords(data);
drawCodewords([...data, ...error]);
applyMask(0);
drawFormatBits(0);
fs.writeFileSync(outputPath, toSvg());
fs.writeFileSync(pngOutputPath, toPng());
console.log(outputPath);
console.log(pngOutputPath);
