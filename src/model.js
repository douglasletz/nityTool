const mongoose = require("mongoose")

module.exports.metaModel = (modelName) => {
    return mongoose.model(
        modelName,
        new mongoose.Schema({
            name: String,
            image: String,
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
