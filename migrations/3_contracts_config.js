var HYCCrowdsalePreICO = artifacts.require("./HYCCrowdsalePreICO.sol");
var HYCCrowdsaleICO = artifacts.require("./HYCCrowdsaleICO.sol");
var Hydrocoin = artifacts.require("./Hydrocoin.sol");
var Payment = artifacts.require("./Payment.sol");


module.exports = function(deployer, network, accounts) {
    let hyc, pay, teamTransferFreeze, founders, preemption;

    if (network == "develop" || network == "development") {
        teamTransferFreeze = 1569794400;
        founders = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
    } else if (network == "rinkeby") {
        teamTransferFreeze = 1569794400;
        founders = "0xa8836881DCACE8bF1DaAC141A3dAbD9A4884dBFB";
    } else if (network == "mainnet") {
        teamTransferFreeze = 1569794400;
        founders = "0x9C4863A5674FBfC07Ca6809d962966da07077217";
    }

    deployer.then(() => {
        return deployer.deploy(Payment, HYCCrowdsalePreICO.address, founders, {gas: 3000000});
    }).then((result) => {
        return Payment.deployed();
    }).then((instance) => {
        pay = instance;
        return deployer.deploy(Hydrocoin, pay.address, teamTransferFreeze, founders, {gas: 3000000});
    }).then((result) => {
        return Hydrocoin.deployed();
    }).then((instance) => {
        hyc = instance;
        return hyc.addOwner(HYCCrowdsalePreICO.address);
    }).then((result) => {
        return hyc.addOwner(HYCCrowdsaleICO.address);
    }).then((result) => {
        return HYCCrowdsalePreICO.deployed();
    }).then((instance) => {
        instance.assignTokenContract(hyc.address);
        return HYCCrowdsaleICO.deployed();
    }).then((instance) => {
        return instance.assignTokenContract(hyc.address);
    }).then((result) => {
        return pay.setRate(1500);
    }).then((result) => {
        return pay.setToken(hyc.address);
    });
};
