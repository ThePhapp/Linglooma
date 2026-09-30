const path = require('path');
const fs = require('fs');

const uploadDirectory = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const uploadRecording = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có file ghi âm nào được gửi lên.' });
  }

  return res.status(200).json({ message: 'Ghi âm đã được tải lên thành công.' });
};

module.exports = { uploadRecording };
