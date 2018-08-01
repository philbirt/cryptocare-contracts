var CryptoCare = artifacts.require("./CryptoCare.sol");

module.exports = function(deployer) {
  deployer.deploy(CryptoCare);
};
