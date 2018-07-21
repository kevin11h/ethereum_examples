var erc20mint = artifacts.require("ERC20TokenMint");

module.exports = function(deployer) {
  deployer.deploy(erc20mint, 'Test02Tok', 'T02').then(function() {
    console.log("ERC20TokenMint address is created on " + erc20mint.address);
  });
};