const CryptoCareMinter = artifacts.require("./CryptoCareMinter.sol");

module.exports = async function(deployer) {
  const minterInstance = await CryptoCareMinter.deployed();

  await minterInstance.addBeneficiary(12, '0xc172211ff8531a34123207efbb2da922d7422bf1');
};
