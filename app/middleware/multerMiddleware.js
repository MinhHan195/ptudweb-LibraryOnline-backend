const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary.config");
const multer = require("multer");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "library-online",
        format: "png"
    }
})

const upload = multer({storage});

module.exports = upload;