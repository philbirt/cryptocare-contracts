const CryptoCareMinter = artifacts.require("./CryptoCareMinter.sol");

module.exports = async function(deployer) {
  const minterInstance = await CryptoCareMinter.deployed();

  await minterInstance.addBeneficiary(14, '0xC850388EDEeaAfCb63D92F67C6B8EAB8083FE41A');
};
