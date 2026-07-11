const fs = require("node:fs");

function chunkName(buffer, offset) {
  return buffer.toString("ascii", offset, offset + 4);
}

function webpDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (chunkName(buffer, 0) !== "RIFF" || chunkName(buffer, 8) !== "WEBP") throw new Error(`${filePath} is not a WebP image`);

  for (let offset = 12; offset + 8 <= buffer.length;) {
    const type = chunkName(buffer, offset);
    const size = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (type === "VP8X") return { width: buffer.readUIntLE(data + 4, 3) + 1, height: buffer.readUIntLE(data + 7, 3) + 1 };
    if (type === "VP8 ") return { width: buffer.readUInt16LE(data + 6) & 0x3fff, height: buffer.readUInt16LE(data + 8) & 0x3fff };
    if (type === "VP8L") {
      const bits = buffer.readUInt32LE(data + 1);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
    offset = data + size + (size % 2);
  }
  throw new Error(`Could not read dimensions from ${filePath}`);
}

module.exports = { webpDimensions };
