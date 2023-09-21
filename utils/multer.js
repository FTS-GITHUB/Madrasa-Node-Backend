const multer = require("multer");
const { memoryStorage } = require("multer");
const AppError = require("./AppError");

const upload = multer({
    storage: memoryStorage(),
    fileFilter: (req, file, callback) => {
        console.log("------------->", file)
        if (["image/png", "image/jpeg","image/gif" , "image/bmp","image/tiff","image/webp", "image/svg+xml", "image/x-icon","image/heif", "image/heic", "application/octet-stream" , "application/pdf"].includes(file.mimetype)
        ) {
            callback(null, true);
        } else {
            callback(
                new AppError(
                    `Not an image or Document file! Please upload only image or Document files`,
                    400
                ),
                false
            );
        }
    },
});

module.exports = upload;
