const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config") // The object with all the networks and the array with names
const { verify } = require("../utils/verify") // a verify script that makes sure our code wont break if already verified
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        // this if statement is to dynamically get the address of the ETH/USD feed depending on whether test net or other
        console.log("chainId === 31337 (from 01-deploy-fund-me)")
        const ethUsdAggregator = await deployments.get("MockV3Aggregator") // this is the whole contract so we need to get the address on the next line
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"] // this is written as an address
    }

    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        // the deploy function from deployments from hardhat
        from: deployer,
        args: [ethUsdPriceFeedAddress], // these will be the arguments for the deployed fundMe contract
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`FundMe deployed at ${fundMe.address}`)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
}

module.exports.tags = ["all", "fundme"]
