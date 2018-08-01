var IpfsStorage = artifacts.require("./IpfsStorage.sol");

module.exports = function(deployer) {
  deployer.deploy(IpfsStorage);
};
