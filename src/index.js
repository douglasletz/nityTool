require("dotenv").config()
var express = require("express")
var app = express()
var cors = require("cors")
const { ethers } = require("ethers")
const axios = require("axios")
const asyncPool = require("tiny-async-pool")
const db = require("./db")
const { metaModel, tokenData } = require("./model")
const mongoose = require("mongoose")
const tokenModels = {}

var contractInstance
var metaData = []

const provider = new ethers.providers.WebSocketProvider(
    process.env.socketProviderURI,
    "homestead"
)

app.use(
    cors({
        origin: "*"
    })
)

// Create new Instance of Smart Contract using ADDRESS + ABI + PROVIDER
const initContractInstance = (_contractAddress, _contractABI, _provider) => {
    contractInstance = new ethers.Contract(
        _contractAddress,
        _contractABI,
        _provider
    )
}

/****************** API Router *************************************************/
app.get("/ethereum/:address", async (req, res) => {
    let contractAddress = req.params.address

    let tokenInfo = await tokenData.findOne({ address: contractAddress })
    if (tokenInfo != undefined) {
        console.log(
            `This token is already exist in our database...so it doesn't take a long time to respond data`
        )
        const collectionName = tokenInfo.token_name
        if (tokenModels[collectionName] == undefined)
            tokenModels[collectionName] = metaModel(collectionName)
        const curModel = tokenModels[collectionName]
        const metadata = await curModel.find({})
        res.send(metadata)
        return
    }

    let contractABIstr = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=Z6GREXDZPPJS48Q3VZDVVYI3WWGBEWAJ7Q`
    let contractABI

    try {
        const { data } = await axios.get(contractABIstr)
        let totalSuppy,
            tokenURI,
            contractABI = data.result
        initContractInstance(contractAddress, contractABI, provider)

        totalSupply = await contractInstance.totalSupply()
        totalSupply = parseInt(totalSupply._hex)
        // totalSupply = 10

        try {
            tokenURI = await contractInstance.baseURI()
        } catch (error) {
            tokenURI = await contractInstance.baseTokenURI()
        }

        let tokenIdxArray = Array.from(
            { length: totalSupply },
            (_, index) => index
        )

        let tokenIds = await asyncPool(
            process.env.asyncPoolLimit,
            tokenIdxArray,
            (idx) => contractInstance.tokenByIndex(idx)
        )

        metaData = await asyncPool(
            process.env.asyncPoolLimit,
            tokenIds,
            (idx) => axios.get(tokenURI + idx)
        )

        metaData = metaData.map((element, index) => {
            const { data } = element
            const res = {}
            res.name = data.name
            res.image = data.image
            res.attributes = data.attributes
            res.tokenId = parseInt(tokenIds[index])
            return res
        })

        res.send(metaData)

        // console.log(metaData)
        const collectionName = await contractInstance.name()
        try {
            if (tokenModels[collectionName] == undefined)
                tokenModels[collectionName] = metaModel(collectionName)
            const curModel = tokenModels[collectionName]
            await curModel.insertMany(metaData)
            await tokenData.create({
                token_name: collectionName,
                address: contractAddress
            })
            console.log(`${collectionName} meta is successfully added to DB`)
        } catch (error) {
            console.log(error)
        }
    } catch (error) {
        console.log(error)
    }
})

app.listen(process.env.PORT, () => {
    console.log(
        "Server is running at http://127.0.0.1:" + process.env.PORT + "/"
    )
})
