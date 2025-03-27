const ApiError = require("../api-error");
const OrderService = require("../services/order.service");
const BookService = require("../services/book.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
    try {
        const bookService = new BookService(MongoDB.client);
        const subResult = await bookService.subQuantity(req.params.bookId);
        if(subResult){
            const orderService = new OrderService(MongoDB.client);
            const result = await orderService.create(req.user._id, req.params.bookId);
            return res.send({
                message: "Đăng ký mượn thành công",
                document: result,
            })
        }   

        return res.send({
            message: "Sách đã được mượn hết trước đó"
        })
    } catch (error) {
        console.log(error);
        return next(new ApiError(500,"Có lỗi xảy ra trong khi tạo lượt mượn sách"))
    }
}

exports.getAll = async (req, res, next) => {
    try {
        const orderService = new OrderService(MongoDB.client);
        const document = await orderService.find({});
        return res.send(document);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500,"Có lỗi xảy ra trong khi lấy lượt mượn sách"))
    }
}

exports.switchState = async (req, res, next) => {
    try {
        let state;
        if(req.params.state==="notApprove"){
            state = "Không duyệt"
        }
        else if(req.params.state==="approve"){
            state = "Đã mượn"
        }
        else if(req.params.state==="giveBack"){
            state = "Đã trả"
        }else if (req.params.state==="Overdue "){
            state = "Quá hạn"
        }
        const orderService = new OrderService(MongoDB.client);
        const status = (await orderService.findById(req.params.id)).trangthai;
        if(status === state){
            return res.send({
                message: "Đã duyệt trước đó"
            })
        }
        const result = await orderService.changeStatus(req.params.id, state);
        if(result){
            return res.send({
                message: "Duyệt thành công"
            })
        }
        return res.send({
            message: "Duyệt thất bại"
        })
    } catch (error) {
        console.log(error);
        return next(new ApiError(500,"Có lỗi xảy ra trong khi lấy lượt mượn sách"))
    }
}