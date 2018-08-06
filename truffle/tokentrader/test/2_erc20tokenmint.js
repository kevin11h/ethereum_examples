const privateKeys = require('./truffle-keys').private;
const publicKeys = require('./truffle-keys').public;
const EthereumTx = require('ethereumjs-tx');
var erc20Tok = artifacts.require("./ERC20TokenMint.sol");

var tokenSymbol = "T02";
var contractName = "Test02Tok";
var defaultTotalSupply = 1000000000000000000000000000; // 1billion * 10**18
var initAllocationForEscrow = 500000000000000000000000000; // 500m * 10**18
var contractCreatorRemainBalance = initAllocationForEscrow; // account[0]

/***********************
 * FUNCTION DEFINITION *
 ***********************/
function logging(msg) {
  // Define a CSS to format the text
  console.log('\x1b[47m\x1b[30m[E20M]>>> ' + msg + '\x1b[0m');
}

function printData(data) {
  var str = '';
  for (var k in data) {
      if (typeof data[k] == 'object') str += k + printData(data[k]) + ' ';
      else str += k + ' => ' + data[k] + '\n';
  }
  return str;
}

function rawTransaction(
  senderPublicKey,
  senderPrivateKey,
  contractAddress,
  data,
  value
) {
  return new Promise((resolve, reject) => {

    let key = new Buffer(senderPrivateKey, 'hex');
    // required to keep track of tx#
    let nonce = web3.toHex(web3.eth.getTransactionCount(senderPublicKey));

    let gasPrice = web3.eth.gasPrice;
    let gasPriceHex = web3.toHex(web3.eth.estimateGas({
      from: contractAddress
    }));
    let gasLimitHex = web3.toHex(5500000);

    let rawTx = {
        nonce: nonce,
        gasPrice: gasPriceHex,
        gasLimit: gasLimitHex,
        data: data,
        to: contractAddress,
        value: web3.toHex(value)
    };
    logging('tx data includes: ' + printData(rawTx));
    let tx = new EthereumTx(rawTx);
    tx.sign(key);

    let stx = '0x' + tx.serialize().toString('hex');

    web3.eth.sendRawTransaction(stx, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
} // end function
/***************************
 * END FUNCTION DEFINITION *
 ***************************/

contract('ERC20TokenMint', function(accounts) {
  describe("ERC20TokenMint contract and account inspection before testing", function() {
    it('should have 10 accounts', function() {
      let i;
      for (i = 0; i < accounts.length; i++) { 
        logging('accounts[' + i + '] = ' + accounts[i]);
      }
      assert.equal(accounts.length, 10, 'there should be 10 accounts by default');
    });
  });

  describe("ERC20TokenMint token test cases", function() {
    it("should put " + initAllocationForEscrow + " T02 token in the first account by default as escrow", function() {
      let erc20_instance = null;

      return erc20Tok.deployed(contractName, tokenSymbol).then(function(instance) {
        erc20_instance = instance;
        return erc20_instance.balanceOf.call(accounts[0]);
      }).then(function(balance) {
        assert.equal(balance.valueOf(),
          initAllocationForEscrow,
          initAllocationForEscrow + " wasn't in the first account " + accounts[0]);
      });
    });

    it("should have the contract name " + contractName + " and symbol " + tokenSymbol, function() {
      let tname;
      return erc20Tok.deployed(contractName, tokenSymbol).then(function(instance) {
        erc20deployer = instance;
        return erc20deployer.name.call();
      }).then(function(name) {
        tname = name;
        return erc20deployer.symbol.call();
      }).then(function(symbol) {
        assert.equal(symbol,"T02", "symbol is not T02");
        assert.equal(tname,"Test02Tok", "Contract name is not Test02Tok");
      });
    });

    it("should have total supply cap at " + defaultTotalSupply, function() {
      return erc20Tok.deployed(contractName, tokenSymbol).then(function(instance) {
        return instance.totalSupply.call();
      }).then(function(supply) {
        assert.equal(supply, defaultTotalSupply, "should have total supply " + defaultTotalSupply);
      });
    });

    /**
     * transfer()
     */
    it("should transfer() and send coin without approval correctly", function() {
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
        logging(account_one + " has starting balance " + account_one_starting_balance);
        return erc20deployer.balanceOf.call(account_two);
      }).then(function(balance) {
        account_two_starting_balance = balance.toNumber();
        logging(account_two + " has starting balance " + account_two_starting_balance);
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
    it("should transferFrom() coin with approval correctly", function() {
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
        logging(account_one + " has starting balance " + account_one_starting_balance);
        return erc20deployer.balanceOf.call(account_two);
      }).then(function(balance) {
        account_two_starting_balance = balance.toNumber();
        logging(account_two + " has starting balance " + account_two_starting_balance);
      }).then(function() {
        return erc20deployer.approve(account_one, contractCreatorRemainBalance);
      }).then(function(isapproved) {
        logging(isapproved);
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
        logging(account_one + " has ending balance " + account_one_ending_balance);
        logging(account_two + " has ending balance " + account_two_ending_balance);
        assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
        assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
      });
    });
  }); // end describe

  /**
   * Minting new tokens via Ether
   */
  describe("ERC20TokenMint exchanging token with Ether test cases", function() {
    let web3Contract = null;
    let eventCounter = {}; // to track all events fired
    let contract = null;

    /* jshint ignore:start */
    before(async () => {
      contract = await erc20Tok.deployed(contractName, tokenSymbol, {from: accounts[0]});
      web3Contract = web3.eth.contract(contract.abi).at(contract.address);
      owner = web3Contract._eth.coinbase;
      logging('accounts[0]=' + accounts[0]);
      logging('owner=' + owner + ' publicKeys[0]=' + publicKeys[0]);
      logging('other=' + accounts[1] + ' publicKeys[1]=' + publicKeys[1]);
      let other = publicKeys[1];
  
      // Verifying that you have specified the right key for testing in ganache-cli
      if (publicKeys[0] !== owner || publicKeys[1] !== other) {
        throw new Error('Use `truffle develop` and store the keys in ./test/truffle-keys.js' +
        ', and make sure you specify these keys in ganache-cli');
      }
  
      // Tracks all events for later verification, count may be sufficient?
      contract.allEvents({}, (error, details) => {
        if (error) {
          console.error(error);
        } else {
          let count = eventCounter[details.event];
          eventCounter[details.event] = count ? count + 1 : 1;
        }
      });
    });
  
    it("should be activate to exchange T02 tokens with ether", async function() {
      let is_sale_activated = (await contract.allowTokenSale.call()); // returns boolean type already
      logging('contract ' + contract.address + ' sales event is ' + is_sale_activated);
      assert.equal(is_sale_activated, true, 'contract ' + contract.address + ' allowTokenSale shoud be true')
    });

    it('should exchangeToken for non-owner', async function() {
      let notOwner = publicKeys[5];
      let notOwnerPrivateKey = privateKeys[5];
      let notOwnerBalanceBefore = (await contract.balanceOf.call(notOwner)).toNumber();
      logging('Contract address ' + contract.address + ' has init Ether balance ' + web3.eth.getBalance(contract.address));
      logging(notOwner + ' has start token balance ' + notOwnerBalanceBefore);
      let value = 0.5 * 10 ** 18; // 3 eth = 3 * 10 ** 18 wei (wei is the unit)
  
      let data = web3Contract.exchangeToken.getData();
  
      let result = await rawTransaction(
        notOwner,
        notOwnerPrivateKey,
        contract.address,
        data,
        value
      );
  
      let notOwnerBalanceAfter = (await contract.balanceOf.call(notOwner)).toNumber();
      logging(notOwner + ' has new token balance ' + notOwnerBalanceAfter);
      logging('Contract address ' + contract.address + ' has new Ether balance ' + web3.eth.getBalance(contract.address));

      //assert.strictEqual(notOwnerBalance, notOwnerBalanceAfter);
      //assert.strictEqual(beneficiaryBalance, '0');
      //assert.strictEqual(beneficiaryBalanceAfter, '2500');
      //assert.strictEqual(csTokenBalance, '47500');
      //assert.strictEqual(csTokenBalanceAfter, '45000');
      assert.strictEqual(0, result.indexOf('0x'));
    });
    /* jshint ignore:end */

  }); // end describe

}); // end of contract
