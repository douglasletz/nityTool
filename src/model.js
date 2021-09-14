const mongoose = require("mongoose")

module.exports.metaModel = (modelName) => {
    return mongoose.model(
        modelName,
        new mongoose.Schema({
            name: String,
            image: String,
            tokenId: Number,
            attributes: []
        })
    )
}

module.exports.tokenData = mongoose.model(
    "token_data",
    new mongoose.Schema({
        token_name: String,
        address: String
    })
)
