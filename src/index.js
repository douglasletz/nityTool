require("dotenv").config()
var express = require("express")
var app = express()
var cors = require("cors")
const { ethers } = require("ethers")
const axios = require("axios")
const asyncPool = require("tiny-async-pool")

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

        try {
            tokenURI = await contractInstance.baseURI()
        } catch (error) {
            tokenURI = await contractInstance.baseTokenURI()
        }

        let time1 = new Date()
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

        let time2 = new Date()
        console.log(time2 - time1)

        res.send("OK")
    } catch (error) {
        console.log(error)
    }
})

app.listen(process.env.PORT, () => {
    console.log(
        "Server is running at http://127.0.0.1:" + process.env.PORT + "/"
    )
})
