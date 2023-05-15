const S3 = require("aws-sdk/clients/s3");
const { v4: uuidv4 } = require("uuid");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

exports.uploadFile = async (file) => {
  let myFile = file.originalname.split(".");
  const ext = myFile[myFile.length - 1];
  const uploadParams = {
    Bucket: bucketName,
    Body: file.buffer,
    Key: `${uuidv4()}.${ext}`,
    CacheControl: "max-age=86400",
    ContentType: file.mimetype,
  };
  const obj = await s3.upload(uploadParams).promise();
  return {
    ...obj,
    url: obj?.Location,
    storage: "aws_s3"
  };
};

exports.uploadArrayOfFiles = async (files) => {
  if (!Array.isArray(files)) {
    files = Array.of(files);
  }
  const fileArray = [];
  files.forEach((file) => {
    let myFile = file.originalname.split(".");
    const ext = myFile[myFile.length - 1];
    const uploadParams = {
      Bucket: bucketName,
      Body: file.buffer,
      Key: `${uuidv4()}.${ext}`,
      CacheControl: "max-age=86400",
      ContentType: file.mimetype,
    };
    fileArray.push(s3.upload(uploadParams).promise());
  });
  const images = await Promise.all(fileArray);
  return images;
};

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