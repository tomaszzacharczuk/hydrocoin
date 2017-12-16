pragma solidity ^0.4.18;


import 'zeppelin-solidity/contracts/lifecycle/Destructible.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Crowdsale.sol';
import './Hydrocoin.sol';


contract Payment is Destructible {
    using SafeMath for uint256;

    Hydrocoin public token;

    address public preemption = 0x627306090abaB3A6e1400e9345bC60c78a8BEf57;
    Crowdsale public preIco;

    uint256 public rate = 1000;
    uint256 public lock;

    function Payment(address _preIco) public {
        preIco = Crowdsale(_preIco);
        lock = preIco.startTime().add(7 days);
    }

    function validateLock() public {
        uint256 weiRaised = preIco.weiRaised();
        if (weiRaised >= 15 ether && now + 6 hours < lock) {
            lock = now + 6 hours;
        }
    }

    function setToken(address _tokenAddr) public onlyOwner {
        token = Hydrocoin(_tokenAddr);
    }

    function setRate(uint256 _rate) public onlyOwner {
        rate = _rate;
    }

    function () public payable {
        require(token != address(0));
        require(msg.value > 0);

        if (lock > now) {
            require(msg.sender == preemption && msg.value >= 15 ether);
            owner.transfer(msg.value);
            uint256 amount = 100000 ether;
            token.transfer(msg.sender, amount);
        } else {
            amount = msg.value.mul(rate);
            uint256 currentBal = token.balanceOf(this);
            if (currentBal >= amount) {
                owner.transfer(msg.value);
                token.transfer(msg.sender, amount);
            } else {
                amount = currentBal;
                uint256 value = amount.div(rate);
                owner.transfer(value);
                token.transfer(msg.sender, amount);
                msg.sender.transfer(msg.value.sub(value));
            }
        }
    }
}