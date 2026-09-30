const fs = require("fs");
const MAX_AUDIO_BYTES = 5 * 1024 * 1024;

function audioSize(base64Data) {
  if (typeof base64Data !== 'string') return -1;
  const size = base64Data.length / 4 * 3 - (base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0);
  if (size > MAX_AUDIO_BYTES) return size;
  if (base64Data.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) return -1;
  return size;
}

function saveBase64AudioToFile(base64Data, filepath) {
  return new Promise((resolve, reject) => {
    // base64Data dạng "UklGRuIAAABXQVZFZm10IBAAAAABAAE...==" (chỉ phần base64)
    const buffer = Buffer.from(base64Data, "base64");
    fs.writeFile(filepath, buffer, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = { saveBase64AudioToFile, audioSize, MAX_AUDIO_BYTES };
