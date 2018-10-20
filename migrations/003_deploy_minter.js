const CryptoCareToken = artifacts.require("./CryptoCareToken.sol");
const CryptoCareMinter = artifacts.require("./CryptoCareMinter.sol");

module.exports = async function(deployer) {
  await deployer.deploy(CryptoCareMinter);

  const tokenInstance = await CryptoCareToken.deployed();
  const minterInstance = await CryptoCareMinter.deployed();

  await tokenInstance.updateMinter(minterInstance.address);
  await minterInstance.updateTokenContract(tokenInstance.address);
};
