const CryptoCareMinter = artifacts.require("./CryptoCareMinter.sol");

module.exports = async function(deployer) {
  const minterInstance = await CryptoCareMinter.deployed();

  await minterInstance.addBeneficiary(13, '0xEF0050248aE8E5559Bdc6357cc2574fcDF434837');
};
