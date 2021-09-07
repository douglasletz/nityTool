require("dotenv").config()
var express = require("express")
var app = express()
var cors = require("cors")
const web3 = require("web3")
const { ethers } = require("ethers")
const axios = require("axios")

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

/******************* TotalSupply Init ******************************************/
// const initTotalSupply = async () => {
//     try {
//         totalSuppy = await contractInstance.totalSupply()
//         totalSuppy = parseInt(totalSuppy._hex)
//     } catch (error) {
//         console.log(error)
//     }
// }

/****************** API Router *************************************************/
app.get("/ethereum/:address", async (req, res) => {
    let contractAddress = req.params.address
    let contractABIstr = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=Z6GREXDZPPJS48Q3VZDVVYI3WWGBEWAJ7Q`
    let contractABI

    try {
        const { data } = await axios.get(contractABIstr)
        let totalSuppy, tokenURI

        contractABI = data.result
        initContractInstance(contractAddress, contractABI, provider)

        totalSuppy = await contractInstance.totalSupply()
        totalSuppy = parseInt(totalSuppy._hex)
        tokenURI = await contractInstance.baseTokenURI()

        // for (let idx = 1; idx <= totalSuppy; idx++) {
        //     let time1 = new Date()

        //     Promise.all([
        //         axios.get(tokenURI + idx),
        //         axios.get(tokenURI + idx),
        //         axios.get(tokenURI + idx),
        //         axios.get(tokenURI + idx)
        //     ])
        //         .then((values) => {
        //             console.log(values)
        //         })
        //         .catch((err) => {
        //             console.log(err)
        //         })
        //     // let { data } =
        //     // metaData.push({
        //     //     image: data.image,
        //     //     name: data.name,
        //     //     attributes: data.attributes
        //     // })
        //     let time2 = new Date()
        //     console.log(time2 - time1)
        // }
        let t1, t2
        t1 = new Date()
        Promise.all([
            axios.get(tokenURI + 1),
            axios.get(tokenURI + 2),
            axios.get(tokenURI + 3),
            axios.get(tokenURI + 4),
            axios.get(tokenURI + 5),
            axios.get(tokenURI + 1),
            axios.get(tokenURI + 2),
            axios.get(tokenURI + 3),
            axios.get(tokenURI + 4),
            axios.get(tokenURI + 5),
            axios.get(tokenURI + 1),
            axios.get(tokenURI + 2),
            axios.get(tokenURI + 3),
            axios.get(tokenURI + 4),
            axios.get(tokenURI + 5),
            axios.get(tokenURI + 1),
            axios.get(tokenURI + 2),
            axios.get(tokenURI + 3),
            axios.get(tokenURI + 4),
            axios.get(tokenURI + 5)
        ])
            .then((values) => {
                t2 = new Date()
                console.log(t2 - t1)
            })
            .catch((err) => {
                console.log(err)
            })

        res.send(metaData)
    } catch (error) {
        console.log(error)
    }
})

app.listen(process.env.PORT, () => {
    console.log(
        "Server is running at http://127.0.0.1/" + process.env.PORT + "/"
    )
})
