pragma solidity ^0.4.18;


import './Crowdsale.sol';


contract HYCCrowdsalePreICO is Crowdsale {

  // bool public isAllocFinished;

  // /**
  //  * Allocate token for funcation, gas station reserve and team
  //  * @param  address beneficiary
  //  * @param  uint256 tokens
  //  */
  // function allocToken(address beneficiary, uint256 tokens) public onlyOwner {
  //   require(!isAllocFinished);
  //   token.mint(beneficiary, tokens);
  //   TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);
  // }

  // /**
  //  * Finish allocation and lock contract
  //  * @return bool
  //  */
  // function finishAlloc() public onlyOwner returns (bool) {
  //   require(token != address(0));
  //   isAllocFinished = true;
  //   return isAllocFinished;
  // }
}

