const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Staging Tests", async function () {
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseEther(".1")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })
          it("allows people to fund and withdraw", async function () {
              const fundMeTxResponse = await fundMe.fund({ value: sendValue })
              // await fundMe.fund({ value: sendValue })
              await fundMeTxResponse.wait(1)
              const withdrawTxResponse = await fundMe.withdraw()
              await withdrawTxResponse.wait(1)

              // await fundMe.withdraw()
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              console.log(
                  `the ending balance, :${endingBalance}, should equal 0, initiating the assert equal ...`
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
