var HYCCrowdsalePreICO = artifacts.require("./HYCCrowdsalePreICO.sol");
var HYCCrowdsaleICO = artifacts.require("./HYCCrowdsaleICO.sol");
var Hydrocoin = artifacts.require("./Hydrocoin.sol");


module.exports = function(deployer, network, accounts) {
    if (network == "develop" || network == "development") {
        var _preStartTime = Math.floor(Date.now() / 1000);
        var _startTime = Math.floor(Date.now() / 1000) + 3600;
        var _perEndTime = Math.floor(Date.now() / 1000) + 3600;
        var _endTime = Math.floor(Date.now() / 1000) + 3600*2;
        var _preRate = 1100;
        var _rate = 1000;
        var _preWallet = accounts[1];
        var _wallet = accounts[2];
        var _preHardCap = web3.toWei(49900000, "ether");
        var _hardCap = web3.toWei(450000000, "ether");
    } else if (network == "rinkeby") {
    } else if (network == "live") {
    }

    // pre ICO
    deployer.deploy(HYCCrowdsalePreICO, _preStartTime, _perEndTime, _preRate, _preWallet, _preHardCap);
    // ICO
    deployer.deploy(HYCCrowdsaleICO, _startTime, _endTime, _rate, _wallet, _hardCap);
};
