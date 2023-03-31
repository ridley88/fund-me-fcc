const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    console.log("THIS IS COMING FROM THE MOCKS DEPLOY FILE")
    if (chainId === 31337) {
        console.log("from 00-deploy-mocks ... below is a log message...")
        log("local network detected! deploying mocks")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks deployed!")
        log("------------------------------------------")
        console.log("mocks must've been deployed")
    }
}

module.exports.tags = ["all", "mocks"]
