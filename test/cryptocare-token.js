const Web3 = require('web3');
const Web3Utils = require('web3-utils');

require('chai')
  .use(require('chai-as-promised'))
  .should();
const truffleAssert = require('truffle-assertions');

const CryptoCare = artifacts.require('./CryptoCare.sol');
const CryptoCareToken = artifacts.require('./CryptoCareToken.sol');

contract('CryptoCareToken', (accounts) => {
  beforeEach(async function () {
    this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));

    this.contract = await CryptoCareToken.deployed();
    this.minterAddress = await this.contract.minterAddress();
  });

  describe('mintToken', () => {
    it('mints a token from the minter address', async function() {
      await this.contract.mintToken.call(
        accounts[0], "testURI", { from: this.minterAddress }
      );
    });

    it('rejects when paused', async function() {
      await this.contract.pause();

      await this.contract.mintToken.call(
        accounts[0], "testURI"
      ).should.be.rejectedWith('revert');

      await this.contract.unpause();
    });

    it('rejects when called from non-minter address', async function() {
      await this.contract.mintToken.call(
        accounts[0], "testURI", { from: accounts[0] }
      ).should.be.rejectedWith('revert');
    });
  });

  describe('updateMinter', () => {
    it('updates the minter address', async function() {
      let oldMinterAddress = await this.contract.minterAddress();

      await this.contract.updateMinter(accounts[0]);
      const newMinterAddress = await this.contract.minterAddress();
      assert.equal(newMinterAddress, accounts[0]);

      await this.contract.updateMinter(oldMinterAddress);
    });

    it('rejects when paused', async function() {
      await this.contract.pause();

      await this.contract.updateMinter.call(
        this.minterAddress, { from: accounts[0] }
      ).should.be.rejectedWith('revert');
    
      await this.contract.unpause();
    });

    it('rejects when attempting to call from non-owner address', async function() {
      await this.contract.updateMinter.call(
        this.minterAddress, { from: accounts[1] }
      ).should.be.rejectedWith('revert');
    });
  });
});
