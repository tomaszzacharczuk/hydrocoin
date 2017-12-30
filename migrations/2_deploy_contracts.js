var HYCCrowdsalePreICO = artifacts.require("./HYCCrowdsalePreICO.sol");
var HYCCrowdsaleICO = artifacts.require("./HYCCrowdsaleICO.sol");
var Hydrocoin = artifacts.require("./Hydrocoin.sol");


module.exports = function(deployer, network, accounts) {
    if (network == "develop" || network == "development") {
        var _preStartTime = Math.floor(Date.now() / 1000);
        var _startTime = Math.floor(Date.now() / 1000) + 3600;
        var _perEndTime = Math.floor(Date.now() / 1000) + 3600;
        var _endTime = Math.floor(Date.now() / 1000) + 3600*2;
        var _preRate = 1111;
        var _rate = 1000;
        var _preWallet = accounts[1];
        var _wallet = accounts[2];
        var _preHardCap = web3.toWei(49900000, "ether");
        var _hardCap = web3.toWei(499900000, "ether");
    } else if (network == "rinkeby") {
        var _preStartTime = Math.floor(Date.now() / 1000) - 7*24*60*60;
        var _perEndTime = Math.floor(Date.now() / 1000) + 1*3600;
        var _preRate = 1111;
        var _preWallet = "0x3b2f56aDFc330294526034815fa192C7ed6Df606";
        var _preHardCap = web3.toWei(49900000, "ether");

        var _startTime = Math.floor(Date.now() / 1000) + 1*3600;
        var _endTime = Math.floor(Date.now() / 1000) + 2*3600;
        var _rate = 1000;
        var _wallet = "0x3b2f56aDFc330294526034815fa192C7ed6Df606";
        var _hardCap = web3.toWei(499900000, "ether");
    } else if (network == "live") {
        // Monday, January 1, 2018 12:00:00 AM GMT+01:00
        var _preStartTime = 1514761200;

        // Saturday, March 31, 2018 11:59:59 PM GMT+02:00 DST
        var _perEndTime = 1522533599;
        
        var _preRate = 1111;
        var _preWallet = "0x151D973b796D92A07Da3eb9Aa736F2D77d89Ea2E";
        var _preHardCap = web3.toWei(49900000, "ether");


        // Sunday, April 1, 2018 12:00:00 AM GMT+02:00 DST
        var _startTime = 1522533600;

        // Sunday, September 30, 2018 11:59:59 PM GMT+02:00 DST
        var _endTime = 1538344799;
        
        var _rate = 1000;
        var _wallet = "0x151D973b796D92A07Da3eb9Aa736F2D77d89Ea2E";
        var _hardCap = web3.toWei(500000000, "ether");
    }

    // pre ICO
    deployer.deploy(HYCCrowdsalePreICO, _preStartTime, _perEndTime, _preRate, _preWallet, _preHardCap, {gas: 3000000});
    // ICO
    deployer.deploy(HYCCrowdsaleICO, _startTime, _endTime, _rate, _wallet, _hardCap, {gas: 3000000});
};
