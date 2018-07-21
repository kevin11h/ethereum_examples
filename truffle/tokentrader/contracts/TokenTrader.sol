pragma solidity ^0.4.20;

import "./ERC20Token.sol";

/**
 * This contract takes ether in, and give out tokens based on the contract you
 * specify. The token used here is purely utility tokens to power some other applications
 * that need the token to operate.
 */
contract TokenTrader is SafeMath {
    
    // Trading Contract creator
    address public owner;
    // The token contract is dealing with
    address public exchanging_token_addr;
    // activate token exchange, we can shut this down anytime by 'owner'
    bool public allowTokenEx = true;
    uint256 public exchangeRate = 10**14;
    uint256 decimals = 18;

    event ActivateSaleEvent(bool allowTokenEx);
    event ExchangeTokens(address indexed buyer, uint256 ethersSent, uint256 tokensBought);

    modifier restricted() {
        if (msg.sender != owner) {
            revert();
        }
        _;
    }

    /**
    * 
    */
    constructor(address _ex_tok_addr, bool enableTokenEx) public {
        if (_ex_tok_addr == 0x0) revert();
        owner = msg.sender;
        exchanging_token_addr = _ex_tok_addr;
        allowTokenEx = enableTokenEx;
        if(exchangeRate < 0) revert();
        emit ActivateSaleEvent(enableTokenEx);
    }

    function currentTokenContract() public view returns (address tok_addr) {
        return exchanging_token_addr;
    }

    function activate (bool flipTokenEx) public restricted {
        allowTokenEx = flipTokenEx;
        emit ActivateSaleEvent(flipTokenEx);
    }

    function takerBuyAsset() payable public {
        if (allowTokenEx || msg.sender == owner) {
            // Note that exchangeRate has already been validated as > 0
            uint256 tokens = safeDiv(safeMul(msg.value, 10**decimals), exchangeRate);
            require(tokens > 0);
            // ERC20Token contract will see the msg.sender as the 'TokenTrader contract' address
            // This means, you will need Token balance under THIS CONTRACT!!!!!!!!!!!!!!!!!!!!!!
            if (InterfaceERC20(exchanging_token_addr).transfer(msg.sender, tokens)) {
                emit ExchangeTokens(msg.sender, msg.value, tokens);
            }
        }
        else
        {
            revert();
        }
    }

    function () payable public {
        takerBuyAsset();
    }

    function ownerKill() public restricted {
        selfdestruct(owner);
    }
}
