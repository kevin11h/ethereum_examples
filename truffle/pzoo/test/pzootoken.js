var PzooToken = artifacts.require("./PzooToken.sol");
var tokenSymbol = "PZO";
var contractName = "PzooToken";
var defaultTotalSupply = 100000000000000000000000000;
var initAllocationForContractCreator = 30000000000000000000000000;
var contractCreatorRemainBalance = initAllocationForContractCreator; // account[0]

contract('PzooToken', function(accounts) {
  it("should put 30000000000000000000000000 PzooToken in the first account by default", function() {
    return PzooToken.deployed(contractName,tokenSymbol).then(function(instance) {
      return instance.balanceOf.call(accounts[0]);
    }).then(function(balance) {
      assert.equal(balance.valueOf(),
        initAllocationForContractCreator,
        initAllocationForContractCreator + " wasn't in the first account " + accounts[0]);
    });
  });

  it("should have the contract name PzooToken and symbol PZO", function() {
    var tname;
    return PzooToken.deployed(contractName,tokenSymbol).then(function(instance) {
      pzoo = instance;
      return pzoo.name.call();
    }).then(function(name) {
      tname = name;
      return pzoo.symbol.call();
    }).then(function(symbol) {
      assert.equal(symbol,"PZO", "symbol is not PZO");
      assert.equal(tname,"PzooToken", "Contract name is not PzooToken");
    });
  });

  it("should have total supply 100000000000000000000000000 as the first account", function() {
    return PzooToken.deployed(contractName,tokenSymbol).then(function(instance) {
      return instance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(supply, defaultTotalSupply, "should have total supply " + defaultTotalSupply);
    });
  });

  /**
   * transfer()
   */
  it("transfer() should send coin without approval correctly", function() {
    let pzoo;

    //    Get initial balances of first and second account.
    let account_one = accounts[0];
    let account_two = accounts[1];

    let account_one_starting_balance;
    let account_two_starting_balance;
    let account_one_ending_balance;
    let account_two_ending_balance;

    let amount = 543;

    return PzooToken.deployed(contractName,tokenSymbol).then(function(instance) {
      pzoo = instance;
      return pzoo.balanceOf.call(account_one);
    }).then(function(balance) {
      account_one_starting_balance = balance.toNumber();
      console.log(account_one + " has starting balance " + account_one_starting_balance);
      return pzoo.balanceOf.call(account_two);
    }).then(function(balance) {
      account_two_starting_balance = balance.toNumber();
      console.log(account_two + " has starting balance " + account_two_starting_balance);
      return pzoo.transfer(account_two, amount);
    }).then(function() {
      return pzoo.balanceOf.call(account_one);
    }).then(function(balance) {
      account_one_ending_balance = balance.toNumber();
      contractCreatorRemainBalance -= amount;
      assert.equal(contractCreatorRemainBalance,
                   account_one_ending_balance,
                   "Amount wasn't correct for " + account_one);
      return pzoo.balanceOf.call(account_two);
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
    let pzoo;

    // Get initial balances of first and second account.
    let account_one = accounts[0];
    let account_two = accounts[1];

    let account_one_starting_balance;
    let account_two_starting_balance;
    let account_one_ending_balance;
    let account_two_ending_balance;

    let amount = 6789;

    return PzooToken.deployed(contractName,tokenSymbol).then(function(instance) {
      pzoo = instance;
      return pzoo.balanceOf.call(account_one);
    }).then(function(balance) {
      account_one_starting_balance = balance.toNumber();
      assert.equal(account_one_starting_balance,
                   contractCreatorRemainBalance,
                   "first account should have remaining balance " + contractCreatorRemainBalance);
      console.log(account_one + " has starting balance " + account_one_starting_balance);
      return pzoo.balanceOf.call(account_two);
    }).then(function(balance) {
      account_two_starting_balance = balance.toNumber();
      console.log(account_two + " has starting balance " + account_two_starting_balance);
    }).then(function() {
      return pzoo.approve(account_one, contractCreatorRemainBalance);
    }).then(function(isapproved) {
      console.log(isapproved);
      //assert.equal(isapproved, true, 
      //             account_one + " has been approved with spending balance " + contractOwnerBalance);
      return pzoo.transferFrom(account_one, account_two, amount);
    }).then(function() {
      return pzoo.balanceOf.call(account_one);
    }).then(function(balance) {
      contractCreatorRemainBalance -= amount;
      account_one_ending_balance = balance.toNumber();
      assert.equal(contractCreatorRemainBalance,
                   account_one_ending_balance,
                   account_one + " should have remaining balance " + contractCreatorRemainBalance);
      return pzoo.balanceOf.call(account_two);
    }).then(function(balance) {
      account_two_ending_balance = balance.toNumber();
      console.log(account_one + " has ending balance " + account_one_ending_balance);
      console.log(account_two + " has ending balance " + account_two_ending_balance);
      assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
    });
  });

  /**
   * takerBuyAsset()
   */
  /**
  it("takerBuyAsset() should take ether and give tokens to sender address ", function() {
    let pzoo;

    let contract_addr = "xxxxxxxxxxxxxxxxxxxx";
    //    Get initial balances of first and second account.
    let account_one = accounts[0];
    let customer_acct = accounts[5];

    let amount = 9;

    return PzooToken.deployed(contractName,tokenSymbol).then(function(instance) {
      pzoo = instance;
      contract_addr = pzoo.address;
      console.log("contract address is " + contract_addr); 
      pzoo.sendTransaction({
        from: customer_acct,
        to: contract_addr,
        gas: 6000000,
        value: amount
      }).then(function() {
        return pzoo.balanceOf.call(customer_acct);
      }).then(function(balance) {
        let customer_balance = balance.toNumber();
        console.log("customer rcv token " + customer_balance + " for " + amount + " eth");
      });
    });
  });
  */

}); // end of contract