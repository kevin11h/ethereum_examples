pragma solidity ^0.4.20;

/**
 * This contract allows tokens minted on-the-fly when it is funded by
 * more Ether. However, a cap is set on total supply, and any ether rcv
 * will be refunded after cap is hit.
 */

// ERC20 standard interface with SafeMath
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md

// Use SafeMath.sol to perform safe arithmetic. Static linking here.
contract SafeMath {
    function safeAdd(uint256 a, uint256 b) public pure returns (uint256 c) {
        c = a + b;
        require(c >= a);
    }
    function safeSub(uint256 a, uint256 b) public pure returns (uint256 c) {
        require(b <= a);
        c = a - b;
    }
    function safeMul(uint256 a, uint256 b) public pure returns (uint256 c) {
        c = a * b;
        require(a == 0 || c / a == b);
    }
    function safeDiv(uint256 a, uint256 b) public pure returns (uint256 c) {
        require(b > 0);
        c = a / b;
    }
}

interface InterfaceERC20 {

    // Get the total token supply
    function totalSupply() external view returns (uint256 _totalSupply);
    // Get the account balance of another account with address _owner
    function balanceOf(address _tokenOwner) external view returns (uint256 _balance);
    // Send _value amount of tokens to address _to
    function transfer(address _toAddr, uint256 _tokenAmount) external returns (bool success);
    // Send _value amount of tokens from address _from to address _to
    // The transferFrom method is used for a withdraw workflow, allowing contracts to send
    // tokens on your behalf, for example to "deposit" to a contract address and/or to charge
    // fees in sub-currencies; the command should fail unless the _from account has
    // deliberately authorized the sender of the message via some mechanism; we propose
    // these standardized APIs for approval:
    function transferFrom(address _from, address _to, uint256 _tokenAmount) external returns (bool success);
    // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
    // If this function is called again it overwrites the current allowance with _tokenAmount.
    function approve(address _spender, uint256 _tokenAmount) external returns (bool success);
    // Returns the amount which _spender is still allowed to withdraw from _owner
    function allowance(address _owner, address _spender) external view returns (uint256 remaining);
    // Triggered when tokens are transferred.
    event Transfer(address indexed _from, address indexed _to, uint256 _tokenAmount);
    // Triggered whenever approve(address _spender, uint256 _value) is called.
    event Approval(address indexed _owner, address indexed _spender, uint256 _tokenAmount);
}

// TODO: add ERC223 support https://github.com/ethereum/EIPs/issues/223
// Play nice with other contracts so their tokens doesn't get stuck here.
// Hopefully that contract has implemented this for us to call
// interface ERC223Receiver {
//     function tokenFallback(address _from, uint _value, bytes _data) external;
// }

contract ERC20TokenMint is SafeMath, InterfaceERC20 {
    
    // contract owner
    address public owner;

    mapping (address => uint256) _balances;
    mapping (address => mapping (address => uint256)) public allowed;

    string public name;
    string public symbol;
    uint256 public constant TOTALSUPPLY = 10 ** 18 * 1000000000; // 1 billion token
    uint256 public minted = 0;
    uint8 public constant decimals = 18;
    uint256 exchangeRate = 10 ** 14; // 1 eth = 10000 tokens
    // activate token sale
    bool public allowTokenSale = true;
    // fund allocation
    uint256 public constant escrowToken = 10 ** 18 * 500000000;
    uint256 remainTotalSupply = TOTALSUPPLY - escrowToken;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    event ActivateSaleEvent(bool allowTokenEx);
    event ExchangeTokens(address indexed buyer, uint256 ethersSent, uint256 tokensBought);


    modifier restricted() {
        if (msg.sender != owner) {
            revert();
        }
        _;
    }

    constructor(string tokenName, string tokenSymbol) public {
        name = tokenName; // [optional] assign a name for this new token
        symbol = tokenSymbol; // [optional] as well
        owner = msg.sender;
        // creator gets 50% of token, contract reserve 50% token for minting
        _balances[msg.sender] = escrowToken;
        _balances[address(this)] = TOTALSUPPLY - escrowToken;
        emit Transfer(address(0), msg.sender, escrowToken);
        emit Transfer(address(0), address(this), (TOTALSUPPLY - escrowToken));
    }

    function name() public view returns (string) {
        return name;
    }

    function symbol() public view returns (string) {
        return symbol;
    }

    // remaining total supply
    function totalSupply() public view returns (uint256) {
        return TOTALSUPPLY;
    }

    function currentSupply() public view returns (uint256) {
        return safeAdd(escrowToken, minted);
    }
    
    function balanceOf(address _tokenOwner) public view returns (uint256) {
        return _balances[_tokenOwner];
    }

    // tokenAmount is by token
    function transfer(address toAddr, uint256 tokenAmount) public returns (bool) {
        if (tokenAmount == 0) {
            emit Transfer(msg.sender, toAddr, tokenAmount);    // Follow the spec to fire the event when transfer 0
            return;
        }

        if (_balances[msg.sender] < tokenAmount) {
            revert();
            return false;
        }
        
        // This overflow rarely happens or should never happen
        if (safeAdd(_balances[toAddr], tokenAmount) < _balances[toAddr]) {
            revert();
            return false;
        }
        
        _balances[msg.sender] = safeSub(_balances[msg.sender], tokenAmount);
        _balances[toAddr] = safeAdd(_balances[toAddr], tokenAmount);
        emit Transfer(msg.sender, toAddr, tokenAmount);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        uint256 allowance = allowed[_from][msg.sender];
        require(_balances[_from] >= _value && allowance >= _value);
        _balances[_to] = safeAdd(_balances[_to], _value);
        _balances[_from] = safeSub(_balances[_from], _value);
        // protect overflow
        allowed[_from][msg.sender] = safeSub(allowed[_from][msg.sender], _value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowed[_owner][_spender];
    }

    function activate (bool flipTokenEx) public restricted {
        allowTokenSale = flipTokenEx;
        emit ActivateSaleEvent(allowTokenSale);
    }

    // Contract owner can adjust manual sales by sending ether here even sales is over
    function exchangeToken() payable public {
        if (allowTokenSale || msg.sender == owner) {
            // uint256 order = safeMul(msg.value, 10**18);
            uint256 order = msg.value;
            require(safeAdd(minted, order) < remainTotalSupply);
            // Note that exchangeRate has already been validated as > 0
            uint256 tokens = safeDiv(order, exchangeRate);
            require(tokens > 0);
            minted = safeAdd(minted, tokens);
            _balances[msg.sender] = safeAdd(_balances[msg.sender], tokens);
            emit ExchangeTokens(msg.sender, msg.value, tokens);
            emit Transfer(address(this), msg.sender, tokens);
        }
        // Return user funds if the contract is not selling
        else {
            revert();
        }
    }

}
