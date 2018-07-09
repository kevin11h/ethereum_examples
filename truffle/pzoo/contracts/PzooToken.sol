pragma solidity ^0.4.20;

// ERC20 standard
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md


// Use SafeMath.sol to perform safe arithmetic
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

contract PzooToken is SafeMath {
    
    // contract owner
    address public owner;

    mapping (address => uint256) _balances;
    mapping (address => mapping (address => uint256)) public allowed;

    string public name;
    string public symbol;
    uint256 public constant TOTALSUPPLY = 100000000000000000000000000;
    uint8 public decimals;
    uint256 exchangeRate = 10000000000000000; // 1 eth = 1000 tokens, 1 token = 10000000000000000 wei
    // activate token sale
    bool public allowTokenSale = true;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    event ActivateSaleEvent(bool allowSale);
    modifier restricted() {
        if (msg.sender != owner) {
            revert();
        }
        _;
    }

    constructor(string tokenName, string tokenSymbol) public {
        name = tokenName; // [optional] assign a name for this new token
        symbol = tokenSymbol; // [optional] as well
        decimals = 18;
        // creator gets 50% of token, contract keeps 50% token for trading
        _balances[msg.sender] = 30000000000000000000000000;
        emit Transfer(address(0), msg.sender, 30000000000000000000000000);
    }

    function name() public view returns (string) {
        return name;
    }

    function symbol() public view returns (string) {
        return symbol;
    }

    // remaining total supply
    function totalSupply() public pure returns (uint256) {
        return TOTALSUPPLY;
    }
    
    function balanceOf(address _tokenOwner) public view returns (uint256) {
        return _balances[_tokenOwner];
    }

    // tokenAmount is by token, 1 token = 10^18
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

    /**
     * Prevent eth coming in by accident
     */
    function () public payable {
        revert();
    }
}
