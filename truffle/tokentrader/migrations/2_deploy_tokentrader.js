var erc20 = artifacts.require("ERC20Token");
var trader = artifacts.require("TokenTrader");

module.exports = function(deployer) {
  deployer.deploy(erc20, 'Test01Tok', 'T01').then(function() {
    console.log("ERC20Token address is created on " + erc20.address);
    return deployer.deploy(trader, erc20.address, true);
  }).then(function() {
    console.log("Trader address is created on " + trader.address);
    console.log("Don't forget to fund Trader contract " + trader.address + " 500000000 tokens to start from accounts[0]");
  });
};
