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

exports.getAllByUserId = async (req, res, next) => {
    try {
        const orderService = new OrderService(MongoDB.client);
        const bookService = new BookService(MongoDB.client)
        const orders = await orderService.find({
            madocgia: req.params.id
        })
        console.log(orders);
        const data = [];
        for(const order of orders) {
            const book = await bookService.findById(order.masach);
            data.push({ 
                _id: order._id,
                ngaymuon : order.ngaymuon,
                ngaytra : order.ngaytra,
                trangthai : order.trangthai,
                imageUrl : book.imageUrl,
                tensach : book.tensach,
            })
        }
        return res.send(data);
    } catch (error) {
        console.log(error);
        return next(new ApiError(500,"Có lỗi xảy ra trong khi lấy danh sách mượn sách"))
    }
}

exports.deleteOrderById = async (req, res, next) => {
    try {
        const orderService = new OrderService(MongoDB.client);
        const order = await orderService.findById(req.params.id);
        const bookService = new BookService(MongoDB.client);
        const subResult = await bookService.subQuantity(order.masach);
        if(subResult){
            const result = await orderService.deleteById(req.params.id);
            if(result.lastErrorObject.n===1){
                return res.send({
                    message: "Xóa thành công"
                });
            }
        }
        return res.send({
            message: "Xóa thất bại"
        });
    } catch (error) {
        console.log(error);
        return next(new ApiError(500,"Có lỗi xảy ra trong khi xóa đơn mượn sách"))
    }
}