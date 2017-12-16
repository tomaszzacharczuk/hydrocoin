var HYCCrowdsaleICO = artifacts.require("./HYCCrowdsaleICO.sol");
var HYCCrowdsalePreICO = artifacts.require("./HYCCrowdsalePreICO.sol");
var Hydrocoin = artifacts.require("./Hydrocoin.sol");
var Payment = artifacts.require("./Payment.sol");


contract('Crowdsale', function(accounts) {
    let preICO, hyc;

    before(async function(){
        preICO = await HYCCrowdsalePreICO.deployed();
        // console.log('HYCCrowdsalePreICO: ', preICO.address);
        hyc = await Hydrocoin.deployed();
        // console.log('Hydrocoin: ', hyc.address);
    });

    describe('Setup', function(){
        it('should have token address setup', async () => {
            var token = await preICO.token.call();
            assert.equal(token, Hydrocoin.address, "Token address incorrect");
        });

        it('should have endtime greater by 3600 sec than starttime', async () => {
            var startTime = await preICO.startTime.call();
            var endTime = await preICO.endTime.call();
            assert.equal(startTime.plus(3600).toNumber(), endTime.toNumber(), "start time and end time set incorrectly");
        });

        it('should have rate of 1100', async () => {
            var rate = await preICO.rate.call();
            assert.equal(rate.toNumber(), 1100, "Rate incorrect");
        });

        it('should have wallet set to accounts[1]', async () => {
            var wallet = await preICO.wallet.call();
            assert.equal(wallet, accounts[1], "Wallet incorrect");
        });

        it('should have hard cap set to 49.9m + token supply', async () => {
            var cap = await preICO.hardCap.call();
            var totalSupply = await hyc.totalSupply.call()
            assert.equal(
                cap.toNumber(),
                totalSupply.add(web3.toWei(49900000, "ether")).toNumber(),
                "Hard cap incorrect");
        });
    });

    describe('Purchase', function(){
        it('should allow to buy tokens and transfer ether to wallet', async () => {
            var preICOwallet = await preICO.wallet.call();
            var walletBal = await web3.eth.getBalance(preICOwallet);
            var tx = await web3.eth.sendTransaction({
                from: accounts[4],
                to: preICO.address,
                value: web3.toWei(10, "ether"),
                gas: 150000,
            });

            var walletBal2 = await web3.eth.getBalance(preICOwallet);
            assert.equal(
                walletBal.plus(web3.toWei(10, "ether")).toNumber(), 
                walletBal2.toNumber(), 
                "Wallet balance incorrect");
            
            var acc4Bal = await hyc.balanceOf.call(accounts[4]);
            assert.equal(
                acc4Bal.toNumber(),
                web3.toWei(10, "ether")*1100,
                "accounts[4] token balance incorrect");
        });
    });

    describe('Fails', function(){
        let newPreICO, newHyc;

        before('new preICO', async () => {
            var _preStartTime = Math.floor(Date.now() / 1000);
            var _perEndTime = Math.floor(Date.now() / 1000) + 3600;
            var _preRate = 1000000;
            var _preWallet = accounts[1];
            var _preHardCap = web3.toWei(49900000, "ether");
            newPreICO = await HYCCrowdsalePreICO.new(_preStartTime, _perEndTime, _preRate, _preWallet, _preHardCap, {from: accounts[0]});
            newHyc = await Hydrocoin.new(Payment.address, {from: accounts[0]});
            await newHyc.addOwner(newPreICO.address);
            await newPreICO.assignTokenContract(newHyc.address);
        });

        // beforeEach('fresh preICO', async () => {
        //     var _preStartTime = Math.floor(Date.now() / 1000);
        //     var _perEndTime = Math.floor(Date.now() / 1000) + 3600;
        //     var _preRate = 1000000;
        //     var _preWallet = accounts[1];
        //     var _preHardCap = web3.toWei(50000000, "ether");
        //     newPreICOFresh = await HYCCrowdsalePreICO.new(_preStartTime, _perEndTime, _preRate, _preWallet, _preHardCap, {from: accounts[0]});
        //     newHycFresh = await Hydrocoin.new(Payment.address, {from: accounts[0]});
        //     await newHycFresh.addOwner(newPreICOFresh.address);
        //     await newPreICOFresh.assignTokenContract(newHycFresh.address);
        // });

        it('should have token address setup', async () => {
            var token = await newPreICO.token.call();
            assert.equal(token, newHyc.address, "Token address incorrect");
        });

        it('should have endtime greater by 3600 sec than starttime', async () => {
            var startTime = await newPreICO.startTime.call();
            var endTime = await newPreICO.endTime.call();
            assert.equal(startTime.plus(3600).toNumber(), endTime.toNumber(), "start time and end time set incorrectly");
        });

        it('should have rate of 1000000', async () => {
            var rate = await newPreICO.rate.call();
            assert.equal(rate.toNumber(), 1000000, "Rate incorrect");
        });

        it('should have wallet set to accounts[1]', async () => {
            var wallet = await newPreICO.wallet.call();
            assert.equal(wallet, accounts[1], "Wallet incorrect");
        });

        it('should have hard cap set to 49.9m + token supply', async () => {
            var cap = await newPreICO.hardCap.call();
            var totalSupply = await hyc.totalSupply.call()
            assert.equal(
                cap.toNumber(),
                totalSupply.add(web3.toWei(49900000, "ether")).toNumber(),
                "Hard cap incorrect");
        });

        it('should not allow to set token again', async () => {
            try {
                var tokenAddr1 = await newPreICO.token.call();
                var tx = await newPreICO.assignTokenContract(accounts[1]);
            } catch(e) {
                var tokenAddr2 = await newPreICO.token.call();
                assert(tokenAddr2, tokenAddr1, "Revert expected. Should not add token again");
            }
        });

        it('should not allow to buy token after sale ended', async () => {
            var _preStartTime = Math.floor(Date.now() / 1000);
            var _perEndTime = Math.floor(Date.now() / 1000) + 3600;
            var _preRate = 1000000;
            var _preWallet = accounts[1];
            var _preHardCap = web3.toWei(50000000, "ether");
            var newPreICOFreshDate = await HYCCrowdsalePreICO.new(_preStartTime, _perEndTime, _preRate, _preWallet, _preHardCap, {from: accounts[0]});
            var newHycFresh = await Hydrocoin.new(Payment.address, {from: accounts[0]});
            await newHycFresh.addOwner(newPreICOFreshDate.address);
            await newPreICOFreshDate.assignTokenContract(newHycFresh.address);

            var tx = await newHycFresh.finishMinting({from: accounts[0]});
            var mintingFinished = await newHycFresh.mintingFinished.call();
            assert.equal(mintingFinished, true, "Minting should finish");

            try {
                var tx = await web3.eth.sendTransaction({
                    from: accounts[4],
                    to: newPreICOFresh.address,
                    value: web3.toWei(1, "ether"),
                    gas: 150000,
                });
            } catch(e) {

            }
        });

        it('should not allow to exceed hard cap', async () => {
            
            var tx = await web3.eth.sendTransaction({
                from: accounts[1],
                to: newPreICO.address,
                value: web3.toWei(50, "ether"),
                gas: 150000,
            });

            try {
                var tx = await web3.eth.sendTransaction({
                    from: accounts[2],
                    to: newPreICO.address,
                    value: 1,
                    gas: 150000,
                });
                var acc1Bal = await hyc.balanceOf.call(accounts[2]);
                assert.equal(acc1Bal.toNumber(), 0, "Account[2] should have balance 0");
            } catch(e) {
                var acc1Bal = await hyc.balanceOf.call(accounts[2]);
                assert.equal(acc1Bal.toNumber(), 0, "Account[2] should have balance 0");
            }
        });

        it('should not allow to buy token before start date', async () => {
            var _preStartTime = Math.floor(Date.now() / 1000) + 360;
            var _perEndTime = Math.floor(Date.now() / 1000) + 3600;
            var _preRate = 1000000;
            var _preWallet = accounts[1];
            var _preHardCap = web3.toWei(50000000, "ether");
            var newPreICOFreshDate = await HYCCrowdsalePreICO.new(_preStartTime, _perEndTime, _preRate, _preWallet, _preHardCap, {from: accounts[0]});
            var newHycFreshDate = await Hydrocoin.new(Payment.address, {from: accounts[0]});
            await newHycFreshDate.addOwner(newPreICOFreshDate.address);
            await newPreICOFreshDate.assignTokenContract(newHycFreshDate.address);

            try {
                var tx = await web3.eth.sendTransaction({
                    from: accounts[1],
                    to: newPreICO.address,
                    value: 1,
                    gas: 150000,
                });
                var acc1Bal = await hyc.balanceOf.call(accounts[1]);
                assert.equal(acc1Bal.toNumber(), 0, "Account[1] should have balance 0");
            } catch(e) {
                var acc1Bal = await hyc.balanceOf.call(accounts[1]);
                assert.equal(acc1Bal.toNumber(), 0, "Account[1] should have balance 0");
            }
        });

        it('should not allow to buy token after end date', async () => {
            var _preStartTime = Math.floor(Date.now() / 1000);
            var _perEndTime = Math.floor(Date.now() / 1000);
            var _preRate = 1000000;
            var _preWallet = accounts[1];
            var _preHardCap = web3.toWei(50000000, "ether");
            var newPreICOFreshDate = await HYCCrowdsalePreICO.new(_preStartTime, _perEndTime, _preRate, _preWallet, _preHardCap, {from: accounts[0]});
            var newHycFreshDate = await Hydrocoin.new(Payment.address, {from: accounts[0]});
            await newHycFreshDate.addOwner(newPreICOFreshDate.address);
            await newPreICOFreshDate.assignTokenContract(newHycFreshDate.address);

            try {
                var tx = await web3.eth.sendTransaction({
                    from: accounts[1],
                    to: newPreICO.address,
                    value: 1,
                    gas: 150000,
                });
                var acc1Bal = await hyc.balanceOf.call(accounts[1]);
                assert.equal(acc1Bal.toNumber(), 0, "Account[1] should have balance 0");
            } catch(e) {
                var acc1Bal = await hyc.balanceOf.call(accounts[1]);
                assert.equal(acc1Bal.toNumber(), 0, "Account[1] should have balance 0");
            }
        });

        
    });

    describe('ICO', function(){
        let newICO, icoHyc;

        before('new preICO', async () => {
            var _StartTime = Math.floor(Date.now() / 1000);
            var _EndTime = Math.floor(Date.now() / 1000) + 3600;
            var _Rate = 1000000;
            var _Wallet = accounts[1];
            var _HardCap = web3.toWei(500000000, "ether");
            newICO = await HYCCrowdsaleICO.new(_StartTime, _EndTime, _Rate, _Wallet, _HardCap, {from: accounts[0]});
            icoHyc = await Hydrocoin.new(Payment.address, {from: accounts[0]});
            await icoHyc.addOwner(newICO.address);
            await newICO.assignTokenContract(icoHyc.address);
        });

        it('should have token address setup', async () => {
            var token = await newICO.token.call();
            assert.equal(token, icoHyc.address, "Token address incorrect");
        });

        it('should have endtime greater by 3600 sec than starttime', async () => {
            var startTime = await newICO.startTime.call();
            var endTime = await newICO.endTime.call();
            assert.equal(startTime.plus(3600).toNumber(), endTime.toNumber(), "start time and end time set incorrectly");
        });

        it('should have rate of 1000000', async () => {
            var rate = await newICO.rate.call();
            assert.equal(rate.toNumber(), 1000000, "Rate incorrect");
        });

        it('should have wallet set to accounts[1]', async () => {
            var wallet = await newICO.wallet.call();
            assert.equal(wallet, accounts[1], "Wallet incorrect");
        });

        it('should be able to continue ICO sale right after pre-ICO', async () => {
            var newICOwallet = await newICO.wallet.call();
            var walletBal = await web3.eth.getBalance(newICOwallet);
            var tx = await web3.eth.sendTransaction({
                from: accounts[4],
                to: newICO.address,
                value: web3.toWei(10, "ether"),
                gas: 150000,
            });

            var walletBal2 = await web3.eth.getBalance(newICOwallet);
            assert.equal(
                walletBal.plus(web3.toWei(10, "ether")).toNumber(), 
                walletBal2.toNumber(), 
                "Wallet balance incorrect");
            
            var acc4Bal = await icoHyc.balanceOf.call(accounts[4]);
            assert.equal(
                acc4Bal.toNumber(),
                web3.toWei(10, "ether")*1000000,
                "accounts[4] token balance incorrect");
        });
    });
});
