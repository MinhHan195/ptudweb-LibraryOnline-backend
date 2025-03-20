const {ObjectId} = require("mongodb");
const bcrypt = require("bcrypt");

class AccountService{
    constructor(client){
        this.Contact = client.db().collection("account");
    }

    async extractAccountData(payload, hashToken) {
        const account = {
            name: payload.name,
            email: payload.email,
            phone: payload.phone, 
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
}

module.exports = AccountService;