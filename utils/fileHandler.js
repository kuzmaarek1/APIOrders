const fs = require("fs");

const downloadAndDelete = (res, filePath) => {
  res.download(filePath, (err) => {
    if (err) {
      console.error("Download error:", err.message);
    }

    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Failed to delete file:", unlinkErr.message);
      }
    });
  });
};

module.exports = { downloadAndDelete };
