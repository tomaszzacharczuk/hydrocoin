var HYCCrowdsalePreICO = artifacts.require("./HYCCrowdsalePreICO.sol");
var HYCCrowdsaleICO = artifacts.require("./HYCCrowdsaleICO.sol");
var Hydrocoin = artifacts.require("./Hydrocoin.sol");


// An async function
const setOwners = async function setOwners(HydrocoinInstance) {
    var H1 = await HYCCrowdsalePreICO.deployed();
    var H2 = await HYCCrowdsaleICO.deployed();
    await HydrocoinInstance.addOwner(H1.address);
    await HydrocoinInstance.transferOwnership(H2.address);
};

module.exports = function(deployer, network, accounts) {
    if (network == "develop" || network == "development") {
        var _startTime = Math.floor(Date.now() / 1000) + 5;
        var _endTime = Math.floor(Date.now() / 1000) + 3600;
        var _wallet = accounts[1];

        // pre ICO
        deployer.deploy(HYCCrowdsalePreICO, _startTime, _endTime, _rate, _wallet, _hardCap);

        // ICO
        deployer.deploy(HYCCrowdsaleICO, _startTime, _endTime, _rate, _wallet, _hardCap);
            
        // token
        deployer.deploy(Hydrocoin).then((instance) => await setOwners());

    } else if (network == "rinkeby") {
    } else if (network == "live") {
    }

};
