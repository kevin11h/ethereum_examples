var erc20Tok = artifacts.require("./ERC20Token.sol");
var tk_trader = artifacts.require("./TokenTrader.sol");

var tokenSymbol = "T04";
var contractName = "Test04Tok";
var defaultTotalSupply = 1000000000000000000000000000; // 1billion * 10**18
// var initAllocationForContractCreator = 500000000000000000000000000; // 500m * 10**18
var initAllocationForContractCreator = defaultTotalSupply; // creator gets all token
var contractCreatorRemainBalance = initAllocationForContractCreator; // account[0]

contract('ERC20Token', function(accounts) {
  it("should put " + initAllocationForContractCreator + " T04 in the first account by default", function() {
    let erc20_instance = null;
    let trader_instance = null;
    return erc20Tok.deployed(contractName,tokenSymbol).then(function(instance) {
      erc20_instance = instance;
      return erc20_instance.balanceOf.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(),
        initAllocationForContractCreator,
        initAllocationForContractCreator + " wasn't in the first account " + accounts[0]);
      return tk_trader.deployed(erc20_instance.address, true, {from: accounts[1]});
    }).then(function(ttinstance) {
      trader_instance = ttinstance;
      console.log('TokenTrader deployed with address ' +
        trader_instance.address +
        ' trading erc20 token address ' +
        erc20_instance.address);
        return trader_instance.currentTokenContract.call();
    }).then(function(erc20_addr) {
      assert.equal(erc20_addr,
                   erc20_instance.address,
                   'TokenTrader contract should hold ERC20 contract address ' + erc20_instance.address);
    });
  });

  it("should have the contract name Test04Tok and symbol T04", function() {
    let tname;
    return erc20Tok.deployed(contractName,tokenSymbol).then(function(instance) {
      erc20deployer = instance;
      return erc20deployer.name.call();
    }).then(function(name) {
      tname = name;
      return erc20deployer.symbol.call();
    }).then(function(symbol) {
      assert.equal(symbol,"T04", "symbol is not T04");
      assert.equal(tname,"Test04Tok", "Contract name is not Test04Tok");
    });
  });

  it("should have total supply " + defaultTotalSupply + " as the first account", function() {
    return erc20Tok.deployed(contractName,tokenSymbol).then(function(instance) {
      return instance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(supply, defaultTotalSupply, "should have total supply " + defaultTotalSupply);
    });
  });

  /**
   * transfer()
   */
  it("transfer() should send coin without approval correctly", function() {
    let erc20deployer;

    //    Get initial balances of first and second account.
    let account_one = accounts[0];
    let account_two = accounts[1];

    let account_one_starting_balance;
    let account_two_starting_balance;
    let account_one_ending_balance;
    let account_two_ending_balance;

    let amount = 543;

    return erc20Tok.deployed(contractName,tokenSymbol).then(function(instance) {
      erc20deployer = instance;
      return erc20deployer.balanceOf.call(account_one);
    }).then(function(balance) {
      account_one_starting_balance = balance.toNumber();
      console.log(account_one + " has starting balance " + account_one_starting_balance);
      return erc20deployer.balanceOf.call(account_two);
    }).then(function(balance) {
      account_two_starting_balance = balance.toNumber();
      console.log(account_two + " has starting balance " + account_two_starting_balance);
      return erc20deployer.transfer(account_two, amount);
    }).then(function() {
      return erc20deployer.balanceOf.call(account_one);
    }).then(function(balance) {
      account_one_ending_balance = balance.toNumber();
      contractCreatorRemainBalance -= amount;
      assert.equal(contractCreatorRemainBalance,
                   account_one_ending_balance,
                   "Amount wasn't correct for " + account_one);
      return erc20deployer.balanceOf.call(account_two);
    }).then(function(balance) {
      account_two_ending_balance = balance.toNumber();
      assert.equal(account_one_ending_balance,
                   account_one_starting_balance - amount,
                   "Amount wasn't correctly taken from the sender " + account_one);
      assert.equal(account_two_ending_balance,
                  account_two_starting_balance + amount,
                  "Amount wasn't correctly sent to the receiver " + account_two);
    });
  });

  /**
   * transferFrom()
   */
  it("transferFrom() should transfer coin with approval correctly", function() {
    let erc20deployer;

    // Get initial balances of first and second account.
    let account_one = accounts[0];
    let account_two = accounts[1];

    let account_one_starting_balance;
    let account_two_starting_balance;
    let account_one_ending_balance;
    let account_two_ending_balance;

    let amount = 6789;

    return erc20Tok.deployed(contractName,tokenSymbol).then(function(instance) {
      erc20deployer = instance;
      return erc20deployer.balanceOf.call(account_one);
    }).then(function(balance) {
      account_one_starting_balance = balance.toNumber();
      assert.equal(account_one_starting_balance,
                   contractCreatorRemainBalance,
                   "first account should have remaining balance " + contractCreatorRemainBalance);
      console.log(account_one + " has starting balance " + account_one_starting_balance);
      return erc20deployer.balanceOf.call(account_two);
    }).then(function(balance) {
      account_two_starting_balance = balance.toNumber();
      console.log(account_two + " has starting balance " + account_two_starting_balance);
    }).then(function() {
      return erc20deployer.approve(account_one, contractCreatorRemainBalance);
    }).then(function(isapproved) {
      console.log(isapproved);
      //assert.equal(isapproved, true, 
      //             account_one + " has been approved with spending balance " + contractOwnerBalance);
      return erc20deployer.transferFrom(account_one, account_two, amount);
    }).then(function() {
      return erc20deployer.balanceOf.call(account_one);
    }).then(function(balance) {
      contractCreatorRemainBalance -= amount;
      account_one_ending_balance = balance.toNumber();
      assert.equal(contractCreatorRemainBalance,
                   account_one_ending_balance,
                   account_one + " should have remaining balance " + contractCreatorRemainBalance);
      return erc20deployer.balanceOf.call(account_two);
    }).then(function(balance) {
      account_two_ending_balance = balance.toNumber();
      console.log(account_one + " has ending balance " + account_one_ending_balance);
      console.log(account_two + " has ending balance " + account_two_ending_balance);
      assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
    });
  });

}); // end of contract
