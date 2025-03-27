const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const cloudinary = require("../config/cloudinary.config");
const BookService = require("../services/book.service");
exports.create = async (req, res, next) => {
    try {
        const imageUrl = req.file.path;
        const imageData = await cloudinary.uploader.upload(imageUrl);
        const bookData = req.body;
        bookData.imageUrl = imageData.secure_url;
        bookData.imagePublicId = imageData.public_id;
        const bookService = new BookService(MongoDB.client);
        const result = await  bookService.create(bookData);
        console.log(result);
        return res.send({
            message: "Thêm sách thành công",
            document: result,
        })
    } catch (error) {
        console.log("Lỗi",error);
        return next(new ApiError(500,"Có lỗi khi thêm sách vào cơ sở dữ liệu"));
    }
}

exports.delete = async (req, res, next) => {
    try {
        // Lấy thông tin sách
        const bookService = new BookService(MongoDB.client);
        const book = await bookService.findById(req.params.id);
        console.log(book);
        // Xóa hình trên cloundinary
        const result = await cloudinary.uploader.destroy(book.imagePublicId);
        if(result.result === "not found"){
            return next(new ApiError(404,"Image not found"));
        }
        // Xóa dữ liệu còn lại trên mongodb
        const document = bookService.delete(req.params.id);
        return res.send({
            message: "Xóa thành công",
        });
    } catch (error) {
        console.log("Lỗi",error);
        return next(new ApiError(500,"Có lỗi khi xóa sách trong dữ liệu"));
    }
}

exports.getAll = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const books = await bookService.fetchAll();
        return res.send(books);
    } catch (error) {
        console.log("Lỗi",error);
        return next(new ApiError(500,"Có lỗi khi lấy tất cả sách"));
    }
}

exports.update = async (req, res, next) => {
    try {
        let newImageData;
        if(req.file !== undefined){     // Nếu có hình mới được thêm vào hay không
            // Xóa ảnh cũ
            const result = await cloudinary.uploader.destroy(req.body.publicId);
            if(result.result === "not found"){
                return next(new ApiError(404,"Image not found"));
            }
            // Thêm ảnh mới
            const imageUrl = req.file.path;
            newImageData = await cloudinary.uploader.upload(imageUrl);
        }
        const bookData = req.body;
        if(newImageData !== undefined){ //Nếu có hình mới được thêm vào
            // Cập nhật lại imageUrl và publicId
            bookData.imageUrl = newImageData.secure_url;
            bookData.publicId = newImageData.public_id;
        }
        // Cập nhật data trong mongodb
        const bookService = new BookService(MongoDB.client);
        console.log(bookData);
        const document = await bookService.update(bookData);
        // Trả về kết quả vừa cập nhật
        return res.send({
            message: "Cập nhật thành công",
            document: document,
        });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500,"Có lỗi khi cập nhật thông tin sách"));
    }
}
