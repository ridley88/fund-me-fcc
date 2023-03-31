require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")

const PRIVATE_KEY = process.env.PRIVATE_KEY
const GOERLI_URL = process.env.GOERLI_RPC_URL
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    loggingEnabled: true,
    // solidity: "0.8.8",
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: GOERLI_URL || "",
            accounts: [PRIVATE_KEY],
            blockConfirmations: 5,
            chainId: 5,
        },
        // sepolia: {
        //   url: "",
        //   accounts: [PRIVATE_KEY],
        //   blockConfirmations: 5,
        //   chainId: 11155,
        // },
    },

    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    chai: {
        reporterOptions: {
            log: true,
        },
    },
    mocha: {
        reporterOptions: {
            log: true,
        },
    },
}
