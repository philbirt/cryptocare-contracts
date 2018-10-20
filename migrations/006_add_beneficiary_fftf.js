const CryptoCareMinter = artifacts.require("./CryptoCareMinter.sol");

module.exports = async function(deployer) {
  const minterInstance = await CryptoCareMinter.deployed();

  await minterInstance.addBeneficiary(11, '0xC172211ff8531a34123207efBb2DA922D7422Bf1');
};
