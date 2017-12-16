var Hydrocoin = artifacts.require("./Hydrocoin.sol");
var HYCCrowdsalePreICO = artifacts.require("./HYCCrowdsalePreICO.sol");
var HYCCrowdsaleICO = artifacts.require("./HYCCrowdsaleICO.sol");
var Payment = artifacts.require("./Payment.sol");

contract('Hydrocoin', function(accounts) {
    let hyc;

    before(async function(){
        hyc = await Hydrocoin.deployed();
        // console.log('Hydrocoin: ', hyc.address);
    });

    describe('Setup', function(){
        it('should have owners setup', async () => {
            var owner1 = await hyc.owners.call(HYCCrowdsalePreICO.address);
            assert.equal(owner1[0], true, "HYCCrowdsalePreICO is not in owners mapping");

            var owner2 = await hyc.owners.call(HYCCrowdsaleICO.address);
            assert.equal(owner2[0], true, "HYCCrowdsalePreICO is not in owners mapping");
        });

        it('should have correct name', async () => {
            var name = await hyc.name.call();
            assert.equal(name, "HydroCoin", "Name incorrect");
        });

        it('should have correct symbol', async () => {
            var symbol = await hyc.symbol.call();
            assert.equal(symbol, "HYC", "Symbol incorrect");
        });

        it('should have correct decimals', async () => {
            var decimals = await hyc.decimals.call();
            assert.equal(decimals.toNumber(), 18, "Decimals incorrect");
        });

        it('should have correct total supply', async () => {
            var totalsupply = await hyc.totalSupply.call();
            assert.equal(
                totalsupply.toNumber(),
                web3.toWei(500100000, "ether"),
                "totalsupply incorrect");
        });

        it('should have correct hard cap', async () => {
            var hardCap = await hyc.hardCap.call();
            assert.equal(
                hardCap.toNumber(),
                web3.toWei(1000000000, "ether"),
                "hardCap incorrect");
        });

        it('should have correct transfer freeze to team token', async () => {
            var teamTransferFreeze = await hyc.teamTransferFreeze.call();
            assert.equal(
                teamTransferFreeze.toNumber(),
                1569801600,
                "teamTransferFreeze incorrect");
        });

        it('should have correct payment contract', async () => {
            var payBal = await hyc.balanceOf.call(Payment.address);
            assert.equal(
                payBal.toNumber(),
                web3.toWei(100000, "ether"),
                "Payment contract balance incorrect");
        });

        it('should have correct founders wallet', async () => {
            var foundersAddr = await hyc.founders.call();
            var foundersBal = await hyc.balanceOf.call(foundersAddr);
            assert.equal(
                foundersBal.toNumber(),
                web3.toWei(500000000, "ether"),
                "Founders balance incorrect");
        });
    });

    describe('Purchase', function(){
        it('should transfer ether between users', async () => {
            var foundersAddr = await hyc.founders.call();
            var tx = await hyc.transfer(accounts[5], 1000, {from: foundersAddr});

            var a5Bal = await hyc.balanceOf.call(accounts[5]);
            assert.equal(a5Bal.toNumber(), 1000, "accounts[5] token balance incorrect");
        });

        it('should allow to mint only owners', async () => {
            var tx = await hyc.mint(accounts[6], 10000, {from: accounts[0]});
            var bal = await hyc.balanceOf.call(accounts[6]);
            assert.equal(bal.toNumber(), 10000, "Balance of accounts[6] incorrect");
        });
    });

    describe('Fails', function(){
        it('should not allow to transfer 100m of funders token', async () => {
            var foundersAddr = await hyc.founders.call();
            var bal = await hyc.balanceOf.call(foundersAddr);
            var balToTransfer = bal.sub(web3.toWei(100000000, "ether"));

            var tx = await hyc.transfer(accounts[1], balToTransfer, {from: foundersAddr});
            try {
                var tx = await hyc.transfer(accounts[1], 1, {from: foundersAddr});
            } catch(e) {
                assert(true, "Revert expected");
            }
        });

        it('should not allow to mint non-owners', async () => {
            try {
                tx = await hyc.mint(accounts[1], 10000, {from: accounts[1]});
            } catch (e) {
                assert(true, "Revert expected");
            }
        });
    });
});
