const Web3 = require('web3');
const Web3Utils = require('web3-utils');

require('chai')
  .use(require('chai-as-promised'))
  .should();
const truffleAssert = require('truffle-assertions');

const CryptoCare = artifacts.require('./CryptoCare.sol');

function splitSignature(signature) {
  const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));
  signature = signature.slice(2);

  const r = `0x${signature.slice(0, 64)}`;
  const s = `0x${signature.slice(64, 128)}`;
  const v = web3.utils.toDecimal(signature.slice(128, 130)) + 27;

  return { v, r, s };
}

contract('CryptoCare', (accounts) => {
  beforeEach(async function () {
    this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));
    this.minterAddress = accounts[0];
    this.contract = await CryptoCare.deployed();
  });

  describe('mintTo', () => {
    beforeEach(async function () {
      this.tokenUri = 'QmZ8T3ZEr8UDgBpD9yXMcYASmgoZr9jytmozCNMdA3afWM';
    });

    it('rejects when no payment is provided', async function() {});
    it('rejects when beneficiary is not present', async function() {});
    it('rejects when beneficiary is not active', async function() {});
    it('rejects when the ECDSA signature is invalid', async function() {});

    it('mints a new token', async function() {});
    it('transfer 95% of the payment to the beneficiary', async function() {});
    it('transfer 5% of the payment to the owner', async function() {});
    it('updates the beneficiary total', async function() {});

    // describe('validates input params signed by central authority', () => {
    //   it('is successful when the message is valid', async function() {
    //     const { h, v, r, s } = generateSignature(this.tokenUri);
    //     var result = await this.contract.verifyMessage.call(h, v, r, s)
    //     assert.equal(result, this.minterAddress)
    //   });
    // });
  });

  describe('addBeneficiary', () => {
    beforeEach(async function () {
      this.beneficiaryAddress = accounts[1];
    });

    it('adds a new beneficiary and emits event', async function() {
      const beneficiaryId = 3;

      await this.contract.addBeneficiary(beneficiaryId, this.beneficiaryAddress).then(async (result) => {
        let retrievedBeneficiary = await this.contract.beneficiaries.call(beneficiaryId);
        assert.equal(retrievedBeneficiary[0], this.beneficiaryAddress);

        truffleAssert.eventEmitted(result, 'BeneficiaryAdded', (ev) => {
          return ev.beneficiaryId.toNumber() === beneficiaryId && ev.addr === this.beneficiaryAddress
        });
      });
    });

    it('rejects when attempting to call from non-owner address', async function() {
      await this.contract.addBeneficiary.call(
        100, this.beneficiaryAddress, { from: accounts[1] }
      ).should.be.rejectedWith('revert');
    })

    it('rejects when attempting to override an existing beneficiary at an address', async function() {
      let beneficiaryId = 1; // This ID is set in the constructor, so it already exists
      let retrievedBeneficiary = await this.contract.beneficiaries.call(beneficiaryId);

      await this.contract.addBeneficiary.call(
        beneficiaryId, this.beneficiaryAddress
      ).should.be.rejectedWith('revert');

      let retrievedBeneficiary2 = await this.contract.beneficiaries.call(beneficiaryId);
      assert.equal(retrievedBeneficiary[0], retrievedBeneficiary2[0]);
    });
  });

  describe('deactivateBeneficiary', () => {
    it('deactivates an existing beneficiary and emits event', async function() {
      const beneficiaryId = 10;
      const beneficiaryAddress = 0xafBCC39f474baf9596C1135522810d5f409DDE0F;
      await this.contract.addBeneficiary(beneficiaryId, beneficiaryAddress);

      await this.contract.deactivateBeneficiary(beneficiaryId).then(async (result) => {
        let retrievedBeneficiary = await this.contract.beneficiaries.call(beneficiaryId);
        assert.equal(retrievedBeneficiary[0], beneficiaryAddress);
        assert.equal(retrievedBeneficiary[1], false);

        truffleAssert.eventEmitted(result, 'BeneficiaryDeactivated', (ev) => {
          return ev.beneficiaryId.toNumber() === beneficiaryId
        });
      });
    });

    it('rejects when attempting to call from non-owner address', async function() {
      const beneficiaryId = 11;
      const beneficiaryAddress = 0xafBCC39f474baf9596C1135522810d5f409DDE0F;
      await this.contract.addBeneficiary(beneficiaryId, beneficiaryAddress);

      await this.contract.deactivateBeneficiary.call(
        beneficiaryAddress, { from: accounts[1] }
      ).should.be.rejectedWith('revert');
    });

    it('rejects when attempting to deactivate a deactivated beneficiary', async function() {
      const beneficiaryId = 12;
      const beneficiaryAddress = 0xafBCC39f474baf9596C1135522810d5f409DDE0F;
      await this.contract.addBeneficiary(beneficiaryId, beneficiaryAddress);

      await this.contract.deactivateBeneficiary(beneficiaryId).then(async (result) => {
        let retrievedBeneficiary = await this.contract.beneficiaries.call(beneficiaryId);
        assert.equal(retrievedBeneficiary[0], beneficiaryAddress);
        assert.equal(retrievedBeneficiary[1], false);
        await this.contract.deactivateBeneficiary.call(beneficiaryId).should.be.rejectedWith('revert');
      });
    });
  });

  describe('activateBeneficiary', () => {
    it('activates an existing deactivated beneficiary and emits event', async function() {
      const beneficiaryId = 20;
      const beneficiaryAddress = 0xafBCC39f474baf9596C1135522810d5f409DDE0F;
      await this.contract.addBeneficiary(beneficiaryId, beneficiaryAddress);

      await this.contract.deactivateBeneficiary(beneficiaryId).then(async (result) => {
        await this.contract.activateBeneficiary(beneficiaryId).then(async (result) => {
          let retrievedBeneficiary = await this.contract.beneficiaries.call(beneficiaryId);
          assert.equal(retrievedBeneficiary[0], beneficiaryAddress);
          assert.equal(retrievedBeneficiary[1], true);

          truffleAssert.eventEmitted(result, 'BeneficiaryActivated', (ev) => {
            return ev.beneficiaryId.toNumber() === beneficiaryId
          });
        });
      });
    });

    it('rejects when attempting to call from non-owner address', async function() {
      const beneficiaryId = 21;
      const beneficiaryAddress = 0xafBCC39f474baf9596C1135522810d5f409DDE0F;
      await this.contract.addBeneficiary(beneficiaryId, beneficiaryAddress);
      await this.contract.deactivateBeneficiary(beneficiaryId);

      await this.contract.activateBeneficiary.call(
        beneficiaryAddress, { from: accounts[1] }
      ).should.be.rejectedWith('revert');
    });

    it('rejects when attempting to activate an already active beneficiary', async function() {
      const beneficiaryId = 22;
      const beneficiaryAddress = 0xafBCC39f474baf9596C1135522810d5f409DDE0F;
      await this.contract.addBeneficiary(beneficiaryId, beneficiaryAddress);

      await this.contract.deactivateBeneficiary(beneficiaryId).then(async (result) => {
        await this.contract.activateBeneficiary(beneficiaryId).then(async (result) => {
          let retrievedBeneficiary = await this.contract.beneficiaries.call(beneficiaryId);
          assert.equal(retrievedBeneficiary[0], beneficiaryAddress);
          assert.equal(retrievedBeneficiary[1], true);
          await this.contract.activateBeneficiary.call(beneficiaryId).should.be.rejectedWith('revert');
        });
      });
    });
  });

  describe('updateMinter', () => {
    beforeEach(async function () {
      this.beneficiaryAddress = accounts[1];
    });

    it('updates the minter address', async function() {
      let oldMinterAddress = await this.contract.minterAddress.call();
      const minterAddress = 0xafBCC39f474baf9596C1135522810d5f409DDE0F;

      await this.contract.updateMinter(minterAddress).then(async (result) => {
        let retrievedMinterAddress = await this.contract.minterAddress.call();
        assert.equal(retrievedMinterAddress, minterAddress);
      });

      // Update the minter back to the original address
      await this.contract.updateMinter(oldMinterAddress);
    });

    it('rejects when attempting to call from non-owner address', async function() {
      const minterAddress = 0xafBCC39f474baf9596C1135522810d5f409DDE0F;

      await this.contract.updateMinter.call(
        minterAddress, { from: accounts[1] }
      ).should.be.rejectedWith('revert');
    });
  });

  describe('verifyMessage', () => {
    beforeEach(async function () {
      this.tokenUri = 'QmZ8T3ZEr8UDgBpD9yXMcYASmgoZr9jytmozCNMdA3afWM';
      this.hash = Web3Utils.soliditySha3(this.tokenUri);
    });

    it('returns true when ecrecover result matches address', async function() {
      this.web3.eth.sign(this.hash, this.minterAddress, async (error, signature) => {
        const { v, r, s } = splitSignature(signature);
        const result = await this.contract.verifyMessage.call(this.hash, v, r, s);
        assert.equal(result, true);
      });
    });

    it('returns false when a different address signed the token uri', async function() {
      this.web3.eth.sign(this.hash, accounts[1], async (error, signature) => {
        const { v, r, s } = splitSignature(signature);
        const result = await this.contract.verifyMessage.call(this.hash, v, r, s);
        assert.equal(result, false);
      });
    });

    it('returns false when the hashed message does not match the ECDSA signature', async function() {
      let otherHash = Web3Utils.soliditySha3('QmSdwSq5hf2iLweoijSqKHPod5J7REcn3WErAnTxcYVXU3');

      this.web3.eth.sign(otherHash, this.minterAddress, async (error, signature) => {
        const { v, r, s } = splitSignature(signature);
        const result = await this.contract.verifyMessage.call(this.hash, v, r, s);
        assert.equal(result, false);
      });
    });

    it('emits an verified event when the ECDSA signature is correct', async function() {
      this.web3.eth.sign(this.hash, this.minterAddress, async (error, signature) => {
        const { v, r, s } = splitSignature(signature);

        this.contract.verifyMessage(this.hash, v, r, s).then((result) => {
          truffleAssert.eventEmitted(result, 'MessageVerified', (ev) => {
            return ev.addr === this.minterAddress && ev.verified === true
          });
        });
      });
    });

    it('emits an unverified event when the ECDSA signature is incorrect', async function() {
      this.web3.eth.sign(this.hash, accounts[1], async (error, signature) => {
        const { v, r, s } = splitSignature(signature);

        this.contract.verifyMessage(this.hash, v, r, s).then((result) => {
          truffleAssert.eventEmitted(result, 'MessageVerified', (ev) => {
            return ev.addr === accounts[1] && ev.verified === false
          });
        });
      });
    });
  });
});
