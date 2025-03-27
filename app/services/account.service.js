const {ObjectId} = require("mongodb");
const bcrypt = require("bcrypt");

class AccountService{
    constructor(client){
        this.Contact = client.db().collection("docgia");
    }

    async extractAccountData(payload, hashToken) {
        const account = {
            hoten: payload.hoten,
            email: payload.email,
            ngaysinh: payload.ngaysinh,
            gioitinh: payload.gioitinh,
            sodienthoai: payload.sodienthoai, 
            diachi: payload.diachi,
            role: payload.role,
            password : await bcrypt.hash(payload.password, 10),
            activeStatus: false,
            token: hashToken,
            dateTimeCreate: new Date().toLocaleString(),
            dateTimeUpdate: new Date().toLocaleString(),
        };

        return account;
    }

    async create(payload, hashToken){
        const account = await this.extractAccountData(payload, hashToken);
        const result = await this.Contact.insertOne(account);
        return result;
    }

    async deleteAccount(id){
        const result = await this.Contact.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    async activateAccount(id){
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const result = await this.Contact.findOneAndUpdate(
            filter,
            { 
                $set: {
                    activeStatus: true,
                    dateTimeUpdate: new Date().toLocaleString(),
                },
                $unset: {
                    token: "",
                }
            },
            { returnDocument: "after"}
        );
        return result;
    }

    async find(filter) {
        const cursor = await this.Contact.find(filter);
        return await cursor.toArray();
    }

    async findByEmail(email) {
        return await this.Contact.findOne({
            email: email,
        })
    }

    async findById(id) {
        return await this.Contact.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async changePassword(userId, newPassword){
        const filter = {_id: ObjectId.isValid(userId) ? new ObjectId(userId) : null}
        const result = await this.Contact.findOneAndUpdate(
            filter,
            {$set: {password: await bcrypt.hash(newPassword, 10)}},
            {returnDocument: "after"}
        );
        return result;
    }

    async delete(id){
        return await this.Contact.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null
        })
    }
}

module.exports = AccountService;