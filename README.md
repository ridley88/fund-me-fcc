Smart Contract Funding Project
This project contains two smart contracts:

FundMe.sol: This contract allows users to fund ETH, withdraw ETH, and keep track of all the funders.
PriceConverter.sol: This contract uses an oracle network to get the current price of ETH to USD and adds a minimum USD requirement to the funding functions.

Installation
To use this project, follow these steps:

Clone the repository to your local machine.
Run npm install to install the necessary dependencies.
If you want to deploy to the hardhat local test net, run npx hardhat node to start the local test net.
If you want to use the deploy script for the mock contracts, navigate to the scripts folder and run npx hardhat run 00-deploy-mocks.js --network localhost.
To run the unit tests, navigate to the tests folder and run npx hardhat test.
Usage
To use the FundMe.sol, you can call the following functions:

fund(): Allows users to fund ETH to the contract.
withdraw(): Allows only the owner to withdraw ETH from the contract.
getFunders(): Returns an array of all the funders.
To use the PriceConverterContract, you can call the following functions:

Testing
This project includes unit tests and staging tests for the contracts. To run the tests, navigate to the tests folder and run npx hardhat test.

Disclaimer
This project is for educational purposes only and should not be used in production environments without proper testing and auditing. The author is not responsible for any loss of funds or damages caused by the use of this project.
