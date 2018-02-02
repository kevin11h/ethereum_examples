pragma solidity ^0.4.0;

contract Coin {
    
    address public minter;

    mapping (address => unit) public balances;

    event Sent(address from, address to, unit amount);

    function Coin() public {
        minter = msg.sender;
    }

    function mint(address receiver, uint amount) public {
        if (msg.sender != minter) {
            return;
        }
        balances[receiver] += amount;
    }

    function send(address receiver, unit amount) public {
        if (balances[msg.sender] < amount) {
            return;
        }
        balances[msg.sender] -= amount;
        balances[receiver] += amount;
        Sent(msg.sender, receiver, amount);

    }
}