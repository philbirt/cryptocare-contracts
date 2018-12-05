const CryptoCareMinter = artifacts.require("./CryptoCareMinter.sol");

module.exports = async function(deployer) {
  const minterInstance = await CryptoCareMinter.deployed();

  await minterInstance.addBeneficiary(15, '0x411a4a89858521864De626F67F880a5a8a52Fc45');
  await minterInstance.addBeneficiary(16, '0xc13117b64de78E7b21248057f3B3F340BD7185dA');
  await minterInstance.addBeneficiary(17, '0x49e17322DeD961BBF87D3bBEc42ebA0de6147668');
};
