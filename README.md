make a directory,
navigate inside it, type yarn add --dev hardhat
now copy package.json of the repo, because the functions might not work this time
delete the node modules folder and after that write yarn install
create a .env and put the keys inside it
now go to contracts and create the first contract FundMe, and PriceConverter
now install chainlink using yarn add --dev @chainlink/contracts
now do yarn hardhat compile.
now do yarn add --dev hardhat-deploy
now create new folder name it deploy and write all your deploy scripts there.
now create deploy scripts in the folder and name them using numbers 00_nameoffile, 01_, so that they run in order
modify the contracts to remove hardcoded AggregatorV3Interface and pass it in the constructor
now to fetch the AggregatorV3Interface Address for different blockchains, create a helper-hardhat-config.js.
the helper hardhat file contain the chainID and details about AggregatorV3Interface.
now since hardhat chain is deployed locally on the computer, it will not have any AggregatorV3Interface.
so create a mock contract which will be used a AggregatorV3Interface for local blockchain