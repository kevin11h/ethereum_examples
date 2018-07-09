var PzooToken = artifacts.require("PzooToken");

module.exports = function(deployer) {
  deployer.deploy(PzooToken, 'PzooToken', 'PZO');
};
