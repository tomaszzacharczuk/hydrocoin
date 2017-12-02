pragma solidity ^0.4.18;


import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import './MultipleOwners.sol';


contract Hydrocoin is MintableToken, MultipleOwners {
    string public name = "HydroCoin";
    string public symbol = "HYC";
    uint8 public decimals = 18;

    uint256 public transferFreeze = 123432123;
    mapping(address => bool) public whitelist;

    function Hydrocoin() public {
        totalSupply = 500000000 * (10 ** uint(decimals));
        // fundation address
        balances[msg.sender] = 250000000 * (10 ** uint(decimals));
        // gas station reserve
        balances[msg.sender] = 150000000 * (10 ** uint(decimals));
        // team
        balances[msg.sender] = 100000000 * (10 ** uint(decimals));

        // payment contract
        balances[msg.sender] = 100000 * (10 ** uint(decimals));
        // whitelist payment contract
        whitelist[msg.sender] = true;
    }

    modifier validateTrasfer() {
        require(
            transferFreeze <= now
            || whitelist[msg.sender]
            || owners[msg.sender].isOwner
            || owner == msg.sender);
        _;
    }

    function transfer(address _to, uint256 _value) public validateTrasfer returns (bool) {
        super.transfer(_to, _value);
    }

}