const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

describe("FundMe", function () {
    let fundMe
    let mockV3Aggregator
    let deployer
    const sendValue = ethers.utils.parseEther("1") // 1 ETH
    beforeEach(async () => {
        // const accounts = await ethers.getSigners()
        // deployer = accounts[0]
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("constructor",async function(){
        it("sets the aggregator addresses correctly",async function(){
            const response = await fundMe.priceFeed();
            assert.equal(response,mockV3Aggregator.address);
        });

        it("fails on low ETH amount",async ()=>{
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
        });

        it("updates when the amount is funded", async ()=>{
            await fundMe.fund({value: sendValue});
            const response = await fundMe.addressToAmountFunded(deployer);
            assert.equal(response.toString(),sendValue.toString());
        });

        it("Adds funder to array of funder",async ()=>{
            await fundMe.fund({value:sendValue});
            const response = await fundMe.getFunder(0);
            assert.equal(response.toString(),deployer.toString());
        });
    });

    describe("withdraw",async function(){
        beforeEach("fund eth before withdraw",async function(){
            await fundMe.fund({value:sendValue});
        });
        
        it("withdraw eth from a single user",async function(){
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const startingDeployerMeBalance = await fundMe.provider.getBalance(deployer);
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1);
            const {gasUsed, effectiveGasPrice} = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

            assert.equal(endingFundMeBalance,0);
            assert.equal(startingDeployerMeBalance.add(startingFundMeBalance).toString(),endingDeployerBalance.add(gasCost).toString());
        });

        it("allows us to withdraw from multiple users",async function () {
            const accounts = await ethers.getSigners();
            for (let index = 0; index < 6; index++) {
                const fundMeConnectContract = await fundMe.connect(accounts[index]);
                await fundMeConnectContract.fund({value:sendValue});
            };
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const startingDeployerMeBalance = await fundMe.provider.getBalance(deployer);
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1);
            const {gasUsed, effectiveGasPrice} = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

            assert.equal(endingFundMeBalance,0);
            assert.equal(startingDeployerMeBalance.add(startingFundMeBalance).toString(),endingDeployerBalance.add(gasCost).toString());
            await expect(fundMe.funders(0)).to.be.reverted;

            for (let index = 0; index < 6; index++) {
                assert.equal(await fundMe.addressToAmountFunded(accounts[index].address),0);
            };
        });

        it("only allows the owner to withdraw",async function(){
            const accounts = await ethers.getSigners();
            const attacker = accounts[1];
            const attackerConnectAccount = await fundMe.connect(attacker);
            await expect(attackerConnectAccount.withdraw()).to.be.reverted;
        });
    })
})

// https://hentai0day.com/videos/20573/cute-big-nurses-love-sex-uncensored-hentai