const CryptoCareMinter = artifacts.require("./CryptoCareMinter.sol");

module.exports = async function(deployer) {
  const minterInstance = await CryptoCareMinter.deployed();
  await minterInstance.updateMinter('0x8a9df80fa754ea6cf7241af654685c21a87af22e');
};
