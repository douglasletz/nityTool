const mongoose = require("mongoose")

const uri = "mongodb://127.0.0.1:27017/nft_metadata"
const options = {
    // autoIndex: false, // Don't build indexes
    //poolSize: 10, // Maintain up to 10 socket connections
    // serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    // socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    // family: 4, // Use IPv4, skip trying IPv6
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect(uri, options).catch((err) => {
    console.log(err)
})

const conn = mongoose.connection
conn.once("open", () => {
    console.log("MongoDB is successfully connected")
})

module.exports = conn
