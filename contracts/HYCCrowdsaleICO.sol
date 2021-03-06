pragma solidity ^0.4.18;

import './Crowdsale.sol';

// because of truffle limitation of deploying 
// multiple instances of the same contract
contract HYCCrowdsaleICO is Crowdsale {
  function HYCCrowdsaleICO(
    uint256 _startTime,
    uint256 _endTime,
    uint256 _rate,
    address _wallet,
    uint256 _hardCap
  )
    public 
    Crowdsale(_startTime, _endTime, _rate, _wallet, _hardCap)
  {

  }
}
