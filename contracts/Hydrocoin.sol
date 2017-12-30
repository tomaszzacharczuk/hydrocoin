pragma solidity ^0.4.18;


import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import './MultipleOwners.sol';


contract Hydrocoin is MintableToken, MultipleOwners {
    string public name = "HydroCoin";
    string public symbol = "HYC";
    uint8 public decimals = 18;

    // current total supply
    uint256 public totalSupply = 500100000 ether;
    // maximum supply
    uint256 public hardCap = 1000000000 ether;

    // transfer freeze for team token until September 30th, 2019
    uint256 public teamTransferFreeze = 1569801600;
    address public founders = 0x627306090abaB3A6e1400e9345bC60c78a8BEf57;

    function Hydrocoin(address _paymentContract) public {
        // fundation address, gas station reserve,team
        balances[founders] = balances[founders].add(500000000 ether);
        Transfer(0x0, founders, 500000000 ether);

        // payment contract
        balances[_paymentContract] = balances[_paymentContract].add(100000 ether);
        Transfer(0x0, _paymentContract, 100000 ether);
    }

    modifier canMint() {
        require(!mintingFinished);
        _;
        assert(totalSupply <= hardCap);
    }

    modifier validateTrasfer() {
        _;
        assert(balances[founders] >= 100000000 ether || teamTransferFreeze < now);
    }

    function transfer(address _to, uint256 _value) public validateTrasfer returns (bool) {
        super.transfer(_to, _value);
    }

}
