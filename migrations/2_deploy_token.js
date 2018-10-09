const CryptoCareToken = artifacts.require("./CryptoCareToken.sol");
const CryptoCareMinter = artifacts.require("./CryptoCareMinter.sol");

module.exports = async function(deployer) {
  await deployer.deploy(CryptoCareToken);

  const tokenInstance = await CryptoCareToken.deployed();
};
