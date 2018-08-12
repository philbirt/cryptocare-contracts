const Web3 = require('web3');
require('chai')
  .use(require('chai-as-promised'))
  .should();
const truffleAssert = require('truffle-assertions');

const CryptoCare = artifacts.require('./CryptoCare.sol');

function generateSignature(message, address) {
  const h = this.web3.sha3(this.tokenUri);
  const sig = this.web3.eth.sign(address, h).slice(2);
  const r = `0x${sig.slice(0, 64)}`;
  const s = `0x${sig.slice(64, 128)}`;
  const v = this.web3.toDecimal(sig.slice(128, 130)) + 27;
  return { h, v, r, s };
}

contract('CryptoCare', (accounts) => {
  beforeEach(async function () {
    this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));
    this.minterAddress = accounts[0];
    this.contract = await CryptoCare.deployed();
  });

  describe('verifyMessage', () => {
    beforeEach(async function () {
      this.tokenUri = 'QmZ8T3ZEr8UDgBpD9yXMcYASmgoZr9jytmozCNMdA3afWM';
    });

    it('returns true when ecrecover result matches address', async function() {
      const { h, v, r, s } = generateSignature(this.tokenUri, this.minterAddress);
      const result = await this.contract.verifyMessage.call(h, v, r, s);
      assert.equal(result, true);
    });

    it('returns false when a different address signed the token uri', async function() {
      const { h, v, r, s } = generateSignature(this.tokenUri, accounts[1]);
      const result = await this.contract.verifyMessage.call(h, v, r, s);
      assert.equal(result, false);
    });

    it('returns false when the hashed message does not match the ECDSA signature', async function() {
      const { v, r, s } = generateSignature(this.tokenUri, this.minterAddress);
      const h = this.web3.sha3('QmSdwSq5hf2iLweoijSqKHPod5J7REcn3WErAnTxcYVXU3');
      const result = await this.contract.verifyMessage.call(h, v, r, s);
      assert.equal(result, false);
    });

    it('emits an verified event when the ECDSA signature is correct', async function() {
      const { h, v, r, s } = generateSignature(this.tokenUri, this.minterAddress);
      this.contract.verifyMessage(h, v, r, s).then((result) => {
        truffleAssert.eventEmitted(result, 'MessageVerified', (ev) => {
          return ev.addr === this.minterAddress && ev.verified === true
        });
      });
    });

    it('emits an unverified event when the ECDSA signature is incorrect', async function() {
      const { h, v, r, s } = generateSignature(this.tokenUri, accounts[1]);
      this.contract.verifyMessage(h, v, r, s).then((result) => {
        truffleAssert.eventEmitted(result, 'MessageVerified', (ev) => {
          return ev.addr === accounts[1] && ev.verified === false
        });
      });
    });
  });
});
