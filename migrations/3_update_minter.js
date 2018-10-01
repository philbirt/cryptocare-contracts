const CryptoCare = artifacts.require("./CryptoCare.sol");

module.exports = async function(deployer) {
  const instance = await CryptoCare.deployed();
  await instance.updateMinter('0x8a9df80fa754ea6cf7241af654685c21a87af22e');
};
