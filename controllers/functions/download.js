const path = require('path');
const fs = require('fs');
const File = require('../../models/file');

// -------------------- Render Logic For Download Page -------------------- //
async function renderDownloadPage(req, res, next) {
  try {
    if (req?.params?.uuid) {
      const { uuid } = req.params;
      const existFile = await File.findOne({ uuid }).exec();
      // ----------- If Doesn't Exist Render Download Page With An Error Message ---------- //
      if (!existFile) {
        return res.status(404).render('download', {
          error:
            'This link is maybe broken or expired. Request the sender to send a new link or a valid one.',
        });
      }
      // -------------------- Else Render Download Page With Download Link -------------------- //
      if (!fs.existsSync(path.join(__dirname, '../../', existFile.path))) {
        return res.status(404).render('download', {
          error:
            "The File you're trying to access doesn't exist anymore. Request the sender to upload it again.",
        });
      } else {
        return res.status(200).render('download', {
          fileName: getSmallFileName(existFile.fileName),
          fileSize: formatBytes(existFile.fileSize),
          downloadLink: `${process.env.ROOT_DOMAIN}/file/download/${existFile.uuid}`,
        });
      }
    } else {
      return res.status(404).render('errors/404');
    }
  } catch (error) {
    return res.status(404).render('download', {
      error: 'Something Went Wrong. Please Try Again Later.',
    });
  }
}

// -------------------- Download File -------------------- //
async function downloadFile(req, res) {
  try {
    if (req?.params?.uuid) {
      const { uuid } = req.params;
      const existFile = await File.findOne({ uuid }).exec();
      // -------------------- Check For The Existence In The Database -------------------- //
      if (!existFile) {
        return res.status(404).render('download', {
          error:
            'This link is maybe broken or expired. Request the sender to send a new link or a valid one.',
        });
      }

      // -------------------- Check For The Existence Of The File In The Uploads Folder -------------------- //
      if (fs.existsSync(path.join(__dirname, '../../', existFile.path))) {
        return res
          .status(200)
          .download(path.join(__dirname, '../../', existFile.path));
      } else {
        return res.status(404).render('download', {
          error:
            "The File you're trying to access doesn't exist anymore. Request the sender to upload it again.",
        });
      }
    } else {
      return res.status(404).render('erros/404');
    }
  } catch (error) {
    return res.status(404).render('client/download', {
      error: 'Something Went Wrong. Please Try Again Later.',
    });
  }
}

// -------------------- Compress The File Name -------------------- //
function getSmallFileName(filename) {
  if (filename.length > 25) {
    const length = filename.length;
    return `${filename.slice(0, 25)}...${filename.slice(length - 10, length)}`;
  }
  return filename;
}

// -------------------- Formatting The Size Of The File -------------------- //
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const kbToByte = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const size = Math.floor(Math.log(bytes) / Math.log(kbToByte));
  return (
    parseFloat((bytes / Math.pow(kbToByte, size)).toFixed(2)) +
    ' ' +
    sizes[size]
  );
}

module.exports = {
  renderDownloadPage,
  downloadFile,
};
