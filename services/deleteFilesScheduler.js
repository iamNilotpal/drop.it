const File = require('../models/file');
const fs = require('fs');
const path = require('path');

async function deleteFilesFromDB() {
  try {
    console.log('<-------------- Starting Scheduler -------------->');
    const deleteFilesTime = new Date(Date.now() - 1000 * 60 * 60 * 5);
    const files = await File.find({ createdAt: { $lt: deleteFilesTime } });

    if (files?.length > 0) {
      files.forEach(async (file) => {
        try {
          if (fs.existsSync(path.join(__dirname, '..', file.path)))
            fs.unlinkSync(path.join(__dirname, '..', file.path));
          console.log(`File removed. ${file.fileName}`);
          await file.remove();
        } catch (error) {
          console.error(error);
        }
      });
    }
    console.log('<-------------- Ending Scheduler -------------->');
  } catch (error) {
    console.error(error);
  }
}

module.exports = deleteFilesFromDB;
