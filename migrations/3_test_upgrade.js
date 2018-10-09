const CryptoCareToken = artifacts.require("./CryptoCareToken.sol");
const CryptoCareMinterV2 = artifacts.require("./CryptoCareMinterV2.sol");

module.exports = async function(deployer) {
  await deployer.deploy(CryptoCareMinterV2);

  const tokenInstance = await CryptoCareToken.deployed();
  const minterInstance = await CryptoCareMinterV2.deployed();

  await tokenInstance.updateMinter(minterInstance.address);

  await minterInstance.updateTokenContract(tokenInstance.address);
  await minterInstance.updateMinter('0x8a9df80fa754ea6cf7241af654685c21a87af22e');

  await minterInstance.addBeneficiary(1, '0x5d41f2e86FeCD1205717B099a8546c5cF6F97e57');
  await minterInstance.addBeneficiary(2, '0x50990F09d4f0cb864b8e046e7edC749dE410916b');
  await minterInstance.addBeneficiary(3, '0xD3F81260a44A1df7A7269CF66Abd9c7e4f8CdcD1');
  await minterInstance.addBeneficiary(4, '0xb189f76323678E094D4996d182A792E52369c005');
  await minterInstance.addBeneficiary(5, '0xC172211ff8531a34123207efBb2DA922D7422Bf1');
  await minterInstance.addBeneficiary(6, '0x998F25Be40241CA5D8F5fCaF3591B5ED06EF3Be7');
  await minterInstance.addBeneficiary(7, '0xc7464dbcA260A8faF033460622B23467Df5AEA42');
  await minterInstance.addBeneficiary(8, '0x236dAA98f115caa9991A3894ae387CDc13eaaD1B');
  await minterInstance.addBeneficiary(9, '0xF29f26a1f5AF03c37bc5Bee665417deE891C8695');
  await minterInstance.addBeneficiary(10, '0x0033e09340eB452f1DE62Ba53bc98c1D8D6B544D');
};
