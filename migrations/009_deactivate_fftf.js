const CryptoCareMinter = artifacts.require("./CryptoCareMinter.sol");

module.exports = async function(deployer) {
  const minterInstance = await CryptoCareMinter.deployed();

  await minterInstance.deactivateBeneficiary(5);
  await minterInstance.deactivateBeneficiary(11);
  await minterInstance.deactivateBeneficiary(12);
};
