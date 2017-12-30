var Payment = artifacts.require("./Payment.sol");
var Hydrocoin = artifacts.require("./Hydrocoin.sol");
var HYCCrowdsalePreICO = artifacts.require("./HYCCrowdsalePreICO.sol");


contract('Payment', function(accounts) {
    let pay, hyc, preICO;
    let newpay, newhyc, newpreICO;

    before('new preICO', async () => {
        var _StartTime = Math.floor(Date.now() / 1000);
        var _EndTime = Math.floor(Date.now() / 1000) + 3600;
        var _Rate = 1000;
        var _Wallet = accounts[1];
        var _HardCap = web3.toWei(500000000, "ether");
        var _teamTransferFreeze = 1569794400;
        var _founders = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
        preICO = await HYCCrowdsalePreICO.new(_StartTime, _EndTime, _Rate, _Wallet, _HardCap, {from: accounts[0]});
        pay = await Payment.new(preICO.address, {from: accounts[8]});
        hyc = await Hydrocoin.new(pay.address, _teamTransferFreeze, _founders, {from: accounts[0]});
        await hyc.addOwner(preICO.address);
        await preICO.assignTokenContract(hyc.address);
        await pay.setToken(hyc.address, {from: accounts[8]});
        
        _StartTime = Math.floor(Date.now() / 1000) - 7*24*60*60;
        _EndTime = Math.floor(Date.now() / 1000) + 3600;
        _Rate = 1000;
        _Wallet = accounts[1];
        _HardCap = web3.toWei(500000000, "ether");
        newpreICO = await HYCCrowdsalePreICO.new(_StartTime, _EndTime, _Rate, _Wallet, _HardCap, {from: accounts[0]});
        newpay = await Payment.new(newpreICO.address, {from: accounts[8]});
        newhyc = await Hydrocoin.new(newpay.address, _teamTransferFreeze, _founders, {from: accounts[0]});
        await newhyc.addOwner(newpreICO.address);
        await newpreICO.assignTokenContract(newhyc.address);
        await newpay.setToken(newhyc.address, {from: accounts[8]});
    });

    describe('Setup', function(){
        it('should have token', async () => {
            var bal = await hyc.balanceOf.call(pay.address);
            assert.equal(bal.toNumber(), web3.toWei(100000, "ether"), "Payment contract token balance incorrect");
        });

        it('should have preemption', async () => {
            var pree = await pay.preemption.call();
            assert.equal(pree, accounts[0], "preemption incorrect");
        });

        it('should have rate', async () => {
            var rate = await pay.rate.call();
            assert.equal(rate.toNumber(), 1000, "Rate incorrect");
        });

        it('should have lock', async () => {
            var lock = await pay.lock.call();
            var startTime = await preICO.startTime.call();
            assert.equal(lock.toNumber(), startTime.add(7*24*60*60).toNumber(), "lock incorrect");
        });

        it('should update lock', async () => {
            var lock = await pay.lock.call();
            await pay.validateLock();
            var lock2 = await pay.lock.call();
            assert.equal(lock.toNumber(), lock2.toNumber(), "Lock validated incorrectly");

            var tx = await web3.eth.sendTransaction({
                from: accounts[1],
                to: preICO.address,
                value: web3.toWei(15, "ether"),
                gas: 150000,
            });
            tx = await pay.validateLock();
            var block = await web3.eth.getBlock(tx.receipt.blockNumber);
            var lock3 = await pay.lock.call();
            assert.equal(
                lock3.toNumber(),
                block.timestamp+6*60*60,
                "Lock3 validated incorrectly");

            var tx = await pay.validateLock();
            var lock4 = await pay.lock.call();
            assert.equal(lock3.toNumber(), lock4.toNumber(), "Lock validated incorrectly");
        });
    });

    describe('Purchase', function(){
        it('should sell token to preemption', async () => {
            var ownerWallet = await pay.owner.call();
            var ownerWalletBal = await web3.eth.getBalance(ownerWallet);
            var preemptionWallet = await pay.preemption.call();
            var preemptionTokenBal = await hyc.balanceOf.call(preemptionWallet);

            var tx = await web3.eth.sendTransaction({
                from: preemptionWallet,
                to: pay.address,
                value: web3.toWei(15, "ether"),
                gas: 150000,
            });

            var preemptionTokenBal2 = await hyc.balanceOf.call(preemptionWallet);
            
            assert.equal(
                preemptionTokenBal2.toNumber(),
                preemptionTokenBal.add(web3.toWei(100000, "ether")).toNumber(),
                "preemption token balance incorrect");

            var ownerWalletBal2 = await web3.eth.getBalance(ownerWallet);

            assert.equal(
                ownerWalletBal2.toNumber(),
                ownerWalletBal.add(web3.toWei(15, "ether")).toNumber(),
                "Payment contract owner balance incorrect"
                );
        });

        it('should sell token anyone after lock is off', async () => {
            var ownerWallet = await newpay.owner.call();
            var ownerWalletBal = await web3.eth.getBalance(ownerWallet);
            var acc2Bal = await newhyc.balanceOf.call(accounts[9]);

            var tx = await web3.eth.sendTransaction({
                from: accounts[9],
                to: newpay.address,
                value: web3.toWei(60, "ether"),
                gas: 150000,
            });

            var acc2Bal2 = await newhyc.balanceOf.call(accounts[9]);
            
            assert.equal(
                acc2Bal2.toNumber(),
                acc2Bal.add(web3.toWei(60000, "ether")).toNumber(),
                "accounts[2] token balance incorrect");

            var ownerWalletBal2 = await web3.eth.getBalance(ownerWallet);

            assert.equal(
                ownerWalletBal2.toNumber(),
                ownerWalletBal.add(web3.toWei(60, "ether")).toNumber(),
                "Payment contract owner balance incorrect"
                );
        });

        it('should return oversell to sender', async () => {
            var ownerWallet = await newpay.owner.call();
            var ownerWalletBal = await web3.eth.getBalance(ownerWallet);
            var acc2Bal = await newhyc.balanceOf.call(accounts[2]);

            var tx = await web3.eth.sendTransaction({
                from: accounts[2],
                to: newpay.address,
                value: web3.toWei(50, "ether"),
                gas: 150000,
            });

            var acc2Bal2 = await newhyc.balanceOf.call(accounts[2]);
            assert.equal(
                acc2Bal2.toNumber(),
                acc2Bal.add(web3.toWei(40000, "ether")).toNumber(),
                "accounts[2] token balance incorrect");

            var ownerWalletBal2 = await web3.eth.getBalance(ownerWallet);

            assert.equal(
                ownerWalletBal2.toNumber(),
                ownerWalletBal.add(web3.toWei(40, "ether")).toNumber(),
                "Payment contract owner balance incorrect"
                );
        });
    });

    describe('Transfer Token', function(){
        before('freash pre ICO', async () => {
            _StartTime = Math.floor(Date.now() / 1000) - 7*24*60*60;
            _EndTime = Math.floor(Date.now() / 1000) + 3600;
            _Rate = 1000;
            _Wallet = accounts[1];
            _HardCap = web3.toWei(500000000, "ether");
            var _teamTransferFreeze = 1569794400;
            var _founders = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
            newpreICO = await HYCCrowdsalePreICO.new(_StartTime, _EndTime, _Rate, _Wallet, _HardCap, {from: accounts[0]});
            newpay = await Payment.new(newpreICO.address, {from: accounts[8]});
            newhyc = await Hydrocoin.new(newpay.address, _teamTransferFreeze, _founders, {from: accounts[0]});
            await newhyc.addOwner(newpreICO.address);
            await newpreICO.assignTokenContract(newhyc.address);
            await newpay.setToken(newhyc.address, {from: accounts[8]});
        });

        it('should transfer token to accounts[5]', async () => {
            var bal = await newhyc.balanceOf.call(newpay.address);
            assert.equal(bal.toNumber(), web3.toWei(100000, "ether"), "Payment contract balance incorrect.");
            var bal2 = await newhyc.balanceOf.call(accounts[5]);
            assert.equal(bal2.toNumber(), 0, "Accounts[5] balance incorrect.");

            await newpay.transferToken(accounts[5], bal, {from: accounts[8]});
            var bal2 = await newhyc.balanceOf.call(accounts[5]);
            assert.equal(bal.toNumber(), bal2.toNumber(), "Transfer failed.");
        });
    });

    describe('Fails', function(){
        let pay, hyc, preICO;

        beforeEach('new preICO', async () => {
            var _StartTime = Math.floor(Date.now() / 1000);
            var _EndTime = Math.floor(Date.now() / 1000) + 3600;
            var _Rate = 1000;
            var _Wallet = accounts[1];
            var _HardCap = web3.toWei(500000000, "ether");
            var _teamTransferFreeze = 1569794400;
            var _founders = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
            preICO = await HYCCrowdsalePreICO.new(_StartTime, _EndTime, _Rate, _Wallet, _HardCap, {from: accounts[0]});
            pay = await Payment.new(preICO.address, {from: accounts[8]});
            hyc = await Hydrocoin.new(pay.address, _teamTransferFreeze, _founders, {from: accounts[0]});
            await hyc.addOwner(preICO.address);
            await preICO.assignTokenContract(hyc.address);
            await pay.setToken(hyc.address, {from: accounts[8]});
        });

        it('should not sell to founder under lock if msg.value smaller than 15 eth', async () => {
            var preemptionWallet = await pay.preemption.call();
            var payTokenBal = await hyc.balanceOf.call(pay.address);
            try {
                var tx = await web3.eth.sendTransaction({
                    from: preemptionWallet,
                    to: pay.address,
                    value: web3.toWei(14, "ether"),
                    gas: 150000,
                });
            } catch(e) {
                var payTokenBal = await hyc.balanceOf.call(pay.address);
                assert.equal(
                    payTokenBal.toNumber(),
                    web3.toWei(100000, "ether"),
                    "Payment contract token balance incorrect");
            }
        });

        it('should not sell to non-founder under lock', async () => {
            try {
                var tx = await web3.eth.sendTransaction({
                    from: accounts[2],
                    to: pay.address,
                    value: web3.toWei(16, "ether"),
                    gas: 150000,
                });
            } catch(e) {
                var payTokenBal = await hyc.balanceOf.call(pay.address);
                assert.equal(
                    payTokenBal.toNumber(),
                    web3.toWei(100000, "ether"),
                    "Payment contract token balance incorrect");
            }
        });
    });
});
