const {ObjectId} = require("mongodb");
const { addDays } = require("date-fns");
class OrderService{
    constructor(client){
        this.Contact = client.db().collection("theodoimuonsach");
    }

    async extractBookBorrowData(userId, bookId){
        const data = {
            madocgia: userId,
            masach: bookId,
            ngaymuon: new Date().toLocaleString(),
            ngaytra: addDays(new Date(), 7).toLocaleString(),
            trangthai: "Chờ duyệt",
        }
        return data;
    }

    async create(userId, bookId) {
        const order = await this.extractBookBorrowData(userId, bookId);
        return await this.Contact.insertOne(order);
    }

    async find(filter) {
        const cursor = await this.Contact.find(filter);
        return await cursor.toArray();
    }

    async findById(id){
        return await this.Contact.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null
        })
    }

    async changeStatus(id, status){
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const order = this.findById(id);
        order.trangthai = status;
        const result = await this.Contact.findOneAndUpdate(
            filter,
            { $set: order},
            { returnDocument: "after"}
        );
        if(result.value._id){
            return true;
        }
        return false;
    }

    async deleteById(id) {
        return await this.Contact.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        })
    }
}

module.exports = OrderService;