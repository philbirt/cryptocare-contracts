const Web3 = require('web3');
const Web3Utils = require('web3-utils');

require('chai')
  .use(require('chai-as-promised'))
  .should();
const truffleAssert = require('truffle-assertions');

const CryptoCareToken = artifacts.require('./CryptoCareToken.sol');

contract('CryptoCareToken', (accounts) => {
  beforeEach(async function () {
    this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));

    this.contract = await CryptoCareToken.deployed();
    this.oldMinterAddress = await this.contract.minterAddress();

    this.contract.updateMinter(accounts[5]);
    this.minterAddress = await this.contract.minterAddress();
  });

  afterEach(async function() {
    this.contract.updateMinter(this.oldMinterAddress);
  })

  describe('mintToken', () => {
    it('mints a token from the minter address and emits event', async function() {
      await this.contract.mintToken(
        accounts[0], "testURI", { from: this.minterAddress }
      ).then(async (result) => {
        const tokenId = await this.contract.tokenOfOwnerByIndex(accounts[0], 0);
        const tokenUri = await this.contract.tokenURI(tokenId);

        assert.equal(tokenId.toNumber(), 1);
        assert.equal(tokenUri, "testURI");

        truffleAssert.eventEmitted(result, 'Transfer', (ev) => {
          return ev._to === accounts[0] && ev._tokenId.toNumber() === tokenId.toNumber();
        });
      });
    });

    it('rejects when paused', async function() {
      await this.contract.pause();

      await this.contract.mintToken.call(
        accounts[0], "testURI", { from: this.minterAddress }
      ).should.be.rejectedWith('revert');

      await this.contract.unpause();
    });

    it('rejects when called from non-minter address', async function() {
      await this.contract.mintToken.call(
        accounts[0], "testURI", { from: accounts[0] }
      ).should.be.rejectedWith('revert');
    });
  });

  describe('updateTokenURI', () => {
    beforeEach(async function () {
      this.tokenID = 1;
      this.tokenURI = 'test URI';
    });

    it('updates token URI for a given token ID and emits event', async function() {
      await this.contract.updateTokenURI(
        this.tokenID, this.tokenURI, { from: this.minterAddress }
      ).then(async (result) => {
        const tokenUri = await this.contract.tokenURI(this.tokenID);
        assert.equal(tokenUri, this.tokenURI);

        truffleAssert.eventEmitted(result, 'TokenURIUpdated', (ev) => {
          return ev._tokenID.toNumber() === this.tokenID && ev._tokenURI === this.tokenURI
        });
      });
    });

    it('rejects when paused', async function() {
      await this.contract.pause();

      await this.contract.updateTokenURI.call(
        this.tokenID, this.tokenURI, { from: this.minterAddress }
      ).should.be.rejectedWith('revert');

      await this.contract.unpause();
    });

    it('rejects when called from non-minter address', async function() {
      await this.contract.updateTokenURI.call(
        this.tokenID, this.tokenURI, { from: accounts[0] }
      ).should.be.rejectedWith('revert');
    });
  });

  describe('updateMinter', () => {
    it('updates the minter address', async function() {
      await this.contract.updateMinter(accounts[0]);
      const newMinterAddress = await this.contract.minterAddress();
      assert.equal(newMinterAddress, accounts[0]);

      await this.contract.updateMinter(this.minterAddress);
    });

    it('rejects and does not update when paused', async function() {
      await this.contract.pause();

      await this.contract.updateMinter.call(
        this.minterAddress, { from: accounts[0] }
      ).should.be.rejectedWith('revert');

      const newMinterAddress = await this.contract.minterAddress();
      assert.equal(newMinterAddress, this.minterAddress);
    
      await this.contract.unpause();
    });

    it('rejects and does not update when attempting to call from non-owner address', async function() {
      await this.contract.updateMinter.call(
        this.minterAddress, { from: accounts[1] }
      ).should.be.rejectedWith('revert');

      const newMinterAddress = await this.contract.minterAddress();
      assert.equal(newMinterAddress, this.minterAddress);
    });
  });
});
