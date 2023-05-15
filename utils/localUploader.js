const fs = require("fs");
const path = require("path");





const uploadFile = (file, prevName) => {
  let filePath = path.join(__dirname, "../public");
  let fileName = file.originalname
  let ext = file.originalname.split(".").pop();
  if (prevName) {
    fileName = prevName;
  }
  let pathWithFileName = path.join(__dirname, `../public/${fileName}`);

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
  };

  fs.writeFileSync(pathWithFileName, file.buffer);
  let res = { url: fileName, storage: "local" }
  return res;
}

const uploadArrayOfFiles = (files) => {
  let filePath = path.join(__dirname, "../public");

  if (!Array.isArray(files)) {
    files = Array.of(files);
  }
  const fileArray = [];
  files.forEach((file) => {
    let fileName = file.originalname
    let ext = file.originalname.split(".").pop();

    let pathWithFileName = path.join(__dirname, `../public/${fileName}`);
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    };

    fs.writeFileSync(pathWithFileName, file.buffer);
    fileArray.push({ url: fileName });
  });
  return fileArray;
}

exports.deleteFile = async (key, next) => {
  if (!key) {
    return false
  }
  console.log("------KEY-------", key);
  const deleteParams = {
    Bucket: bucketName,
    Key: key,
  };
  const res = await s3.deleteObject(deleteParams).promise()
  console.log("========= S3 DELETE ========== ", res);
  return true
}

module.exports = { uploadFile, uploadArrayOfFiles };