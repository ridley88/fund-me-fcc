const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

const { assert, expect } = require("chai")

const { BigNumber } = require("ethers")

require("@nomicfoundation/hardhat-chai-matchers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe
          let deployer
          let mockV3Aggregator
          let provider
          let deployerSigner
          const sendValue = ethers.utils.parseEther("1")

          beforeEach(async () => {
              console.log("\n \n")
              deployer = (await getNamedAccounts()).deployer //this is an address
              provider = ethers.provider // this is an object
              deployerSigner = ethers.provider.getSigner(deployer) //this is an object
              // console.log(deployerSigner)
              await deployments.fixture(["all"])

              fundMe = await ethers.getContract("FundMe", deployer)

              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
              // console.log("\n")
          })
          describe("** Constructor **", async () => {
              it("sets the aggregator addresses correctly", async () => {
                  console.log("COMMENCING THE CONSTRUCTOR TEST<=======")

                  // console.log(`Deployer signer in the first test is : ${deployerSigner}`)

                  const response = await fundMe.getPriceFeed()
                  expect(response).to.equal(mockV3Aggregator.address)
                  console.log("\n")
              })
          })
          describe(" ** should handle Ether sent to the contract addresses ** ", async () => {
              it("should prove fallback function works because contract balance changes", async () => {
                  console.log(
                      `COMMENCING the FALLBACK FUNCTION TEST <========\n`
                  )

                  let initialBalance = await provider.getBalance(fundMe.address)

                  const value = ethers.utils.parseEther("1")

                  // Send transaction with no data to the contract address
                  await deployerSigner.sendTransaction({
                      to: fundMe.address,
                      value,
                  })
                  // Check if the receive function was triggered and the contract balance increases
                  initialBalance = initialBalance.toString()
                  console.log(
                      `initialBalance of the contract is ${initialBalance}`
                  )
                  const newBalance = await provider.getBalance(fundMe.address)
                  console.log(
                      `The new balance after the transaction is ${ethers.utils.formatEther(
                          newBalance.toString()
                      )}`
                  )
                  expect(initialBalance).to.not.equal(newBalance)
                  console.log("\n")
              })
          })
          describe("** FUND **", function () {
              it("Fails if you don't send enough ETH", async () => {
                  console.log("COMMENCING REQUIRE ENOUGH ETH TEST<======\n")
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("Updates the amount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  console.log(
                      "INITIATING THE FUND STRUCTURE TEST <===========\n"
                  )

                  console.log(
                      `The response, the amount funded by the deployer is : ${ethers.utils.formatEther(
                          response.toString()
                      )}`
                  )
                  assert.equal(response.toString(), sendValue.toString())
                  console.log("\n")
              })
              it("Adds funder to array of funders", async function () {
                  console.log(
                      "INITIATING THE ADD FUNDER TO ARRAY TEST <===========\n"
                  )
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(deployer, funder)
                  console.log(`The funder address is : ${provider}`)
              })
          })
          describe("Withdraw", () => {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })
              it("can withdraw ETH from a single funder", async () => {
                  console.log(
                      "INITIATING THE WITHDRAW SINGLE TEST <===========\n"
                  )
                  //arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  console.log(
                      `STARTING BALANCE OF FUND ME CONTRACT IS: ${ethers.utils.formatEther(
                          startingFundMeBalance
                      )}`
                  )
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer) // should be ~10k
                  console.log(
                      `STARTING BALANCE OF THE DEPLOYER IS : ${ethers.utils.formatEther(
                          startingDeployerBalance
                      )}`
                  )
                  //act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  console.log(
                      `ENDING BALANCE OF FUND ME CONTRACT IS: ${ethers.utils.formatEther(
                          endingFundMeBalance
                      )}`
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  console.log(
                      `ENDING BALANCE OF THE DEPLOYER IS : ${ethers.utils.formatEther(
                          endingDeployerBalance
                      )}`
                  )

                  //assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })
              it("allows us to withdraw with multiple funders", async function () {
                  console.log(
                      "INITIATING THE WITHDRAW MULTIPLE TEST <===========\n"
                  )
                  // ARRANGE
                  const accounts = await ethers.getSigners() // an array of objects
                  console.log(`accounts[1] is: ${accounts[1]}`)
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                      const currentBalance =
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          )
                      console.log(
                          `The current balance of ${
                              accounts[i].address
                          } is ${ethers.utils.formatEther(currentBalance)} ETH`
                      )
                      const contractBalance = await fundMe.provider.getBalance(
                          fundMe.address
                      )
                      // console.log(contractBalance)
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //ACT
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // ASSERT
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  //make sure the funders array is reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("withdraw with multiple funders WITH CHEAPER WITHDRAW function", async function () {
                  console.log(
                      "INITIATING THE CHEAPER WITHDRAW FUNCTION TEST <===========\n"
                  )
                  // ARRANGE
                  console.log("")
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                      const currentBalance =
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          )
                      console.log(
                          `The current balance of ${
                              accounts[i].address
                          } is ${ethers.utils.formatEther(currentBalance)} ETH`
                      )
                      const contractBalance = await fundMe.provider.getBalance(
                          fundMe.address
                      )
                      // console.log(contractBalance)
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //ACT
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // ASSERT
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  //make sure the funder array is reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("only allows the owner to withdraw", async function () {
                  console.log(
                      "INITIATING THE ONLY OWNER WITHDRAW TEST <===========\n"
                  )
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  console.log(attacker.address)
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  )
                  await expect(attackerConnectedContract.withdraw()).to.be
                      .reverted
              })
          })
      })
