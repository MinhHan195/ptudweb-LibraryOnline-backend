const {ObjectId} = require("mongodb");

class BookService {
    constructor(client){
        this.Contact = client.db().collection("sach");
    }

    async extractBookData(payload) {
        const book = {
            tensach: payload.tensach,
            dongia: payload.dongia,
            soquyen: payload.soquyen, 
            namxuatban: payload.namxuatban,
            nhaxuatban: payload.nhaxuatban,
            tacgia: payload.tacgia,
            motasach: payload.motasach,
            imageUrl: payload.imageUrl,
            imagePublicId: payload.imagePublicId,
            dateTimeCreate: payload.dateTimeCreate ? payload.dateTimeCreate :new Date().toLocaleString(),
            dateTimeUpdate: new Date().toLocaleString(),
        };
        Object.keys(book).forEach(
            (key) => book[key] === undefined && delete book[key]
        );
        return book;
    }

    async create(payload) {
        const book = await this.extractBookData(payload);
        const result = await this.Contact.insertOne(book);
        if(result.acknowledged===true){
            book._id = new ObjectId(result.insertedId);
            return book;
        }
        else{
            console.log(result);
            return result;
        }
    }

    async find(filter) {
        const cursor = await this.Contact.find(filter);
        return await cursor.toArray();
    }

    async fetchAll(){
        return await this.find({});
    }

    async findById(id){
        return await this.Contact.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null
        })
    }

    async update(payload){
        const filter = {
            _id: ObjectId.isValid(payload._id) ? new ObjectId(payload._id) : null,
        };
        const book = await this.extractBookData(payload);
        const result = await this.Contact.findOneAndUpdate(
            filter,
            { $set: book},
            { returnDocument: "after"}
        );
        console.log(result);
        return result;
    }

    async delete(id){
        return await this.Contact.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null 
        })
    }
}
module.exports = BookService;