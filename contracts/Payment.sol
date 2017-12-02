pragma solidity ^0.4.18;


import 'zeppelin-solidity/contracts/lifecycle/Destructible.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Crowdsale.sol';
import './Hydrocoin.sol';


contract Payment is Destructible {
    using SafeMath for uint256;

    Hydrocoin public token;

    address public preemption = 0x0;
    Crowdsale private preIco;
    Crowdsale private ico;

    uint256 public rate;
    uint256 public lock;

    function Payment(address _preIco, address _ico, address _tokenAddr) public {
        preIco = Crowdsale(_preIco);
        ico = Crowdsale(_ico);
        lock = Crowdsale(_preIco).startTime().add(3*24*60*60);
        token = Hydrocoin(_tokenAddr);
    }

    modifier validateLock() {
        uint256 weiRaised = preIco.weiRaised().add(preIco.weiRaised());
        if (weiRaised >= 15 ether && now + 6*60*60 < lock) {
            lock = now + 6*60*60;
        }
        _;
    }

    function setLock(address _ico) public onlyOwner {
        require(address(_ico) == address(ico) || address(_ico) == address(preIco));
        lock = Crowdsale(_ico).startTime().add(3*24*60*60);
    }

    function setPreIco(address _preIco) public onlyOwner {
        preIco = Crowdsale(_preIco);
    }

    function setIco(address _ico) public onlyOwner {
        ico = Crowdsale(_ico);
    }

    function () public payable validateLock {
        if (msg.sender == preemption && lock > now) {
            owner.transfer(msg.value);
            uint256 amount = 100000*(10 ** uint(token.decimals()));
            token.transfer(msg.sender, amount);
        } else if (lock <= now) {
            amount = msg.value.mul(rate);
            uint256 currentBal = token.balanceOf(this);
            if (currentBal < amount) {
                // calculate leftover value
                uint256 value = amount.div(rate);
                amount = currentBal;
                owner.transfer(value);
                token.transfer(msg.sender, amount);
                // give back change to the buyer, used send() to avoid attack
                msg.sender.send(msg.value.sub(value));
            } else {
                owner.transfer(msg.value);
                token.transfer(msg.sender, amount);
            }
        }
    }
}