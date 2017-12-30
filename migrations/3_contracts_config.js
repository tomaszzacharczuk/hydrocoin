var HYCCrowdsalePreICO = artifacts.require("./HYCCrowdsalePreICO.sol");
var HYCCrowdsaleICO = artifacts.require("./HYCCrowdsaleICO.sol");
var Hydrocoin = artifacts.require("./Hydrocoin.sol");
var Payment = artifacts.require("./Payment.sol");


module.exports = function(deployer, network, accounts) {
    let hyc, pay;
    deployer.then(() => {
        return deployer.deploy(Payment, HYCCrowdsalePreICO.address, {gas: 3000000});
    }).then((result) => {
        return Payment.deployed();
    }).then((instance) => {
        pay = instance;
        return deployer.deploy(Hydrocoin, pay.address, {gas: 3000000});
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
        return instance.assignTokenContract(hyc.address);
    }).then((result) => {
        return pay.setRate(1500);
    }).then((result) => {
        return pay.setToken(hyc.address);
    });
};
