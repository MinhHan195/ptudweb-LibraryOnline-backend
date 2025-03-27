const { MongoClient} = require("mongodb");

class MongoDB {
    static connect = async (uri) => {
        if (this.client) return this.client;
        this.client = await MongoClient.connect(uri);
        return this.client;
    };

    static getDB() {
        if (!this.client) {
            throw new Error("MongoDB chưa được kết nối. Hãy gọi MongoDB.connect(uri) trước.");
        }
        return this.client.db(); // Không cần truyền tên DB nếu đã kết nối trực tiếp
    }
}

module.exports = MongoDB;