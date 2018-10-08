const Web3 = require('web3');
const Web3Utils = require('web3-utils');

require('chai')
  .use(require('chai-as-promised'))
  .should();
const truffleAssert = require('truffle-assertions');

const CryptoCare = artifacts.require('./CryptoCare.sol');

function splitSignature(web3, signature) {
  signature = signature.slice(2);

  const r = `0x${signature.slice(0, 64)}`;
  const s = `0x${signature.slice(64, 128)}`;
  const v = web3.utils.toDecimal(signature.slice(128, 130)) + 27;

  return { v, r, s };
}

async function generateSignature(toAddress, tokenUri, beneficiaryId, nonce, msgValue, minterAddress) {
  const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));
  const hash = Web3Utils.soliditySha3(
    { t: 'address', v: toAddress },
    { t: 'string', v: tokenUri},
    { t: 'uint8', v: beneficiaryId },
    { t: 'uint256', v: nonce },
    { t: 'uint256', v: msgValue }
  );
  const signature = await web3.eth.sign(hash, minterAddress);
  return splitSignature(web3, signature);
}

contract('CryptoCare', (accounts) => {
  beforeEach(async function () {
    this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));
    this.minterAddress = accounts[0];
    this.contract = await CryptoCare.deployed();
  });

  describe('mintTo', () => {
    beforeEach(async function () {
      this.toAddress = accounts[2];
      this.beneficiaryId = 1;
      this.tokenUri = 'QmZ8T3ZEr8UDgBpD9yXMcYASmgoZr9jytmozCNMdA3afWM';
      this.msgValue = 100000;
      this.transactionMsg = { from: this.toAddress, value: this.msgValue };
      this.rate = 5;
    });

    it('mints a new token with a uri and token id, and emits events', async function() {
      const nonce = 0;
      const { v, r, s } = await generateSignature(
        this.toAddress, this.tokenUri, this.beneficiaryId, nonce, this.msgValue, this.minterAddress
      );

      await this.contract.mintTo(
        this.toAddress, this.beneficiaryId, this.tokenUri, nonce, this.rate, v, r, s, this.transactionMsg
      ).then(async (result) => {
        const tokenId = await this.contract.tokenOfOwnerByIndex(this.toAddress, 0);
        const tokenUri = await this.contract.tokenURI(tokenId);

        assert.equal(tokenId.toNumber(), 1);
        assert.equal(tokenUri, this.tokenUri);


        truffleAssert.eventEmitted(result, 'Adoption', (ev) => {
          return ev.tokenId.toNumber() === tokenId.toNumber() &&
            ev.toAddress === this.toAddress &&
            ev.tokenURI === tokenUri &&
            ev.beneficiaryId.toNumber() === this.beneficiaryId &&
            ev.price.toNumber() === this.msgValue &&
            ev.rate.toNumber() === 5
        });

        truffleAssert.eventEmitted(result, 'Transfer', (ev) => {
          return ev._to === this.toAddress && ev._tokenId.toNumber() === tokenId.toNumber();
        });
      });
    });

    describe('beneficiary rates', async function() {
      it('transfer the total minus the provided rate to the beneficiary', async function() {
        let retrievedBeneficiary = await this.contract.beneficiaries.call(this.beneficiaryId);
        let initialAddressBalance = await this.web3.eth.getBalance(retrievedBeneficiary[0]);

        const nonce = 7;
        const { v, r, s } = await generateSignature(
          this.toAddress, this.tokenUri, this.beneficiaryId, nonce, this.msgValue, this.minterAddress
        );

        await this.contract.mintTo(
          this.toAddress, this.beneficiaryId, this.tokenUri, nonce, this.rate, v, r, s, this.transactionMsg
        ).then(async (result) => {
          let retrievedBeneficiary = await this.contract.beneficiaries.call(this.beneficiaryId);
          let newAddressBalance = await this.web3.eth.getBalance(retrievedBeneficiary[0]);
          assert.equal(newAddressBalance - initialAddressBalance, ((100 - this.rate) * this.msgValue) / 100);
        });
      });

      it('keeps the rate percentage of payment in the contract', async function() {
        let initialAddressBalance = await this.web3.eth.getBalance(this.contract.address);

        const nonce = 8;
        const { v, r, s } = await generateSignature(
          this.toAddress, this.tokenUri, this.beneficiaryId, nonce, this.msgValue, this.minterAddress
        );

        await this.contract.mintTo(
          this.toAddress, this.beneficiaryId, this.tokenUri, nonce, this.rate, v, r, s, this.transactionMsg
        ).then(async (result) => {
          let newAddressBalance = await this.web3.eth.getBalance(this.contract.address);
          assert.equal(newAddressBalance - initialAddressBalance, 5000);
        });
      });

      it('updates the beneficiary total', async function() {
        let retrievedBeneficiary = await this.contract.beneficiaries.call(this.beneficiaryId);
        let initialTotal = retrievedBeneficiary[2].toNumber();

        const nonce = 9;
        const { v, r, s } = await generateSignature(
          this.toAddress, this.tokenUri, this.beneficiaryId, nonce, this.msgValue, this.minterAddress
        );

        await this.contract.mintTo(
          this.toAddress, this.beneficiaryId, this.tokenUri, nonce, this.rate, v, r, s, this.transactionMsg
        ).then(async (result) => {
          let retrievedBeneficiary = await this.contract.beneficiaries.call(this.beneficiaryId);
          assert.equal(retrievedBeneficiary[2].toNumber() - initialTotal, 95000);
        });
      });

      it('uses the override rate, if active', async function() {
        let retrievedBeneficiary = await this.contract.beneficiaries.call(this.beneficiaryId);
        let initialAddressBalance = await this.web3.eth.getBalance(retrievedBeneficiary[0]);
        let rate = 3;
        await this.contract.updateOverrideRate(true, rate);

        const nonce = 10;
        const { v, r, s } = await generateSignature(
          this.toAddress, this.tokenUri, this.beneficiaryId, nonce, this.msgValue, this.minterAddress
        );

        await this.contract.mintTo(
          this.toAddress, this.beneficiaryId, this.tokenUri, nonce, this.rate, v, r, s, this.transactionMsg
        ).then(async (result) => {
          let retrievedBeneficiary = await this.contract.beneficiaries.call(this.beneficiaryId);
          let newAddressBalance = await this.web3.eth.getBalance(retrievedBeneficiary[0]);
          assert.equal(newAddressBalance - initialAddressBalance, ((100 - rate) * this.msgValue) / 100);
        });

        await this.contract.updateOverrideRate(false, 5);
      });
    });

    describe('rejection criteria', async function() {
      it('rejects when no payment is provided', async function() {
        const nonce = 1;
        const { v, r, s } = await generateSignature(
          this.toAddress, this.tokenUri, this.beneficiaryId, nonce, this.msgValue, this.minterAddress
        );

        await this.contract.mintTo.call(
          this.toAddress, this.beneficiaryId, this.tokenUri, nonce, this.rate, v, r, s,
          {
            from: this.toAddress,
          }
        ).should.be.rejectedWith('revert');
      });

      it('rejects when the contract is paused', async function() {
        const nonce = 1;
        const { v, r, s } = await generateSignature(
          this.toAddress, this.tokenUri, this.beneficiaryId, nonce, this.msgValue, this.minterAddress
        );

        await this.contract.pause();

        await this.contract.mintTo.call(
          this.toAddress, this.beneficiaryId, this.tokenUri, nonce, this.rate, v, r, s, this.transactionMsg
        ).should.be.rejectedWith('revert');


        await this.contract.unpause();
      });

      it('rejects when the nonce has been used', async function() {
        const nonce = 2;
        const { v, r, s } = await generateSignature(
          this.toAddress, this.tokenUri, this.beneficiaryId, nonce, this.msgValue, this.minterAddress
        );

        await this.contract.mintTo(
          this.toAddress, this.beneficiaryId, this.tokenUri, nonce, this.rate, v, r, s, this.transactionMsg
        ).then(async (result) => {
          await this.contract.mintTo(
            this.toAddress, this.beneficiaryId, this.tokenUri, nonce, this.rate, v, r, s,
            {
              from: this.toAddress,
              value: 100000,
            }
          ).should.be.rejectedWith('revert');
        });
      });

      it('rejects when the beneficiary address is not present', async function() {
        const nonce = 3;
        const { v, r, s } = await generateSignature(
          this.toAddress, this.tokenUri, this.beneficiaryId, nonce, this.msgValue, this.minterAddress
        );

        await this.contract.mintTo.call(
          this.toAddress, 1337, this.tokenUri, nonce, this.rate, v, r, s, this.transactionMsg
        ).should.be.rejectedWith('revert');
      });

      it('rejects when beneficiary is not active', async function() {
        const beneficiaryId = 1338;
        const nonce = 4;
        const { v, r, s } = await generateSignature(
          this.toAddress, this.tokenUri, this.beneficiaryId, nonce, this.msgValue, this.minterAddress
        );

        await this.contract.addBeneficiary(beneficiaryId, accounts[3]).then(async (result) => {
          await this.contract.deactivateBeneficiary(beneficiaryId).then(async (result) => {
            await this.contract.mintTo.call(
              this.toAddress, beneficiaryId, this.tokenUri, nonce, this.rate, v, r, s, this.transactionMsg
            ).should.be.rejectedWith('revert');
          });
        });
      });

      describe('rejects when the ECDSA signature is invalid', async function() {
        it('rejects when a different address signed the message', async function() {
          const nonce = 5;
          const { v, r, s } = await generateSignature(
            this.toAddress, this.tokenUri, this.beneficiaryId, nonce, this.msgValue, accounts[1]
          );

          await this.contract.mintTo.call(
            this.toAddress, this.beneficiaryId, this.tokenUri, nonce, this.rate, v, r, s, this.transactionMsg
          ).should.be.rejectedWith('revert');
        });

        it('rejects when the ECDSA signature is for another token uri', async function() {
          const nonce = 6;
          const { v, r, s } = await generateSignature(
            this.toAddress, 'QmSdwSq5hf2iLweoijSqKHPod5J7REcn3WErAnTxcYVXU3', this.beneficiaryId, nonce, this.msgValue, this.minterAddress
          );

          await this.contract.mintTo.call(
            this.toAddress, this.beneficiaryId, this.tokenUri, nonce, this.rate, v, r, s,
            {
              from: this.toAddress,
              value: 100000,
            }
          ).should.be.rejectedWith('revert');
        });
      });
    });
  });

  describe('addBeneficiary', () => {
    beforeEach(async function () {
      this.beneficiaryAddress = accounts[1];
    });

    it('adds a new beneficiary and emits event', async function() {
      const beneficiaryId = 99;

      await this.contract.addBeneficiary(beneficiaryId, this.beneficiaryAddress).then(async (result) => {
        let retrievedBeneficiary = await this.contract.beneficiaries.call(beneficiaryId);
        assert.equal(retrievedBeneficiary[0], this.beneficiaryAddress);

        truffleAssert.eventEmitted(result, 'BeneficiaryAdded', (ev) => {
          return ev.beneficiaryId.toNumber() === beneficiaryId && ev.addr === this.beneficiaryAddress
        });
      });
    });

    it('rejects when paused', async function() {
      await this.contract.pause();

      await this.contract.addBeneficiary.call(
        100, this.beneficiaryAddress
      ).should.be.rejectedWith('revert');

      await this.contract.unpause();
    });

    it('rejects when attempting to call from non-owner address', async function() {
      await this.contract.addBeneficiary.call(
        101, this.beneficiaryAddress, { from: accounts[1] }
      ).should.be.rejectedWith('revert');
    });

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
    beforeEach(async function () {
      this.beneficiaryAddress = '0xafBCC39f474baf9596C1135522810d5f409DDE0F';
    });

    it('deactivates an existing beneficiary and emits event', async function() {
      const beneficiaryId = 14;
      await this.contract.addBeneficiary(beneficiaryId, this.beneficiaryAddress);

      await this.contract.deactivateBeneficiary(beneficiaryId).then(async (result) => {
        let retrievedBeneficiary = await this.contract.beneficiaries.call(beneficiaryId);
        assert.equal(retrievedBeneficiary[0], this.beneficiaryAddress);
        assert.equal(retrievedBeneficiary[1], false);

        truffleAssert.eventEmitted(result, 'BeneficiaryDeactivated', (ev) => {
          return ev.beneficiaryId.toNumber() === beneficiaryId
        });
      });
    });

    it('rejects when paused', async function() {
      const beneficiaryId = 11;
      await this.contract.addBeneficiary(beneficiaryId, this.beneficiaryAddress);

      await this.contract.pause();

      await this.contract.deactivateBeneficiary.call(
        this.beneficiaryAddress
      ).should.be.rejectedWith('revert');

      await this.contract.unpause();
    });

    it('rejects when attempting to call from non-owner address', async function() {
      const beneficiaryId = 12;
      await this.contract.addBeneficiary(beneficiaryId, this.beneficiaryAddress);

      await this.contract.deactivateBeneficiary.call(
        this.beneficiaryAddress, { from: accounts[1] }
      ).should.be.rejectedWith('revert');
    });

    it('rejects when attempting to deactivate a deactivated beneficiary', async function() {
      const beneficiaryId = 13;
      await this.contract.addBeneficiary(beneficiaryId, this.beneficiaryAddress);

      await this.contract.deactivateBeneficiary(beneficiaryId).then(async (result) => {
        let retrievedBeneficiary = await this.contract.beneficiaries.call(beneficiaryId);
        assert.equal(retrievedBeneficiary[0], this.beneficiaryAddress);
        assert.equal(retrievedBeneficiary[1], false);
        await this.contract.deactivateBeneficiary.call(beneficiaryId).should.be.rejectedWith('revert');
      });
    });
  });

  describe('activateBeneficiary', () => {
    beforeEach(async function () {
      this.beneficiaryAddress = '0xafBCC39f474baf9596C1135522810d5f409DDE0F';
    });

    it('activates an existing deactivated beneficiary and emits event', async function() {
      const beneficiaryId = 20;
      await this.contract.addBeneficiary(beneficiaryId, this.beneficiaryAddress);

      await this.contract.deactivateBeneficiary(beneficiaryId).then(async (result) => {
        await this.contract.activateBeneficiary(beneficiaryId).then(async (result) => {
          let retrievedBeneficiary = await this.contract.beneficiaries.call(beneficiaryId);
          assert.equal(retrievedBeneficiary[0], this.beneficiaryAddress);
          assert.equal(retrievedBeneficiary[1], true);

          truffleAssert.eventEmitted(result, 'BeneficiaryActivated', (ev) => {
            return ev.beneficiaryId.toNumber() === beneficiaryId
          });
        });
      });
    });

    it('rejects when paused', async function() {
      const beneficiaryId = 21;
      await this.contract.addBeneficiary(beneficiaryId, this.beneficiaryAddress);
      await this.contract.deactivateBeneficiary(beneficiaryId);

      this.contract.pause();

      await this.contract.activateBeneficiary.call(
        this.beneficiaryAddress
      ).should.be.rejectedWith('revert');

      this.contract.unpause();
    });

    it('rejects when attempting to call from non-owner address', async function() {
      const beneficiaryId = 22;
      await this.contract.addBeneficiary(beneficiaryId, this.beneficiaryAddress);
      await this.contract.deactivateBeneficiary(beneficiaryId);

      await this.contract.activateBeneficiary.call(
        this.beneficiaryAddress, { from: accounts[1] }
      ).should.be.rejectedWith('revert');
    });

    it('rejects when attempting to activate an already active beneficiary', async function() {
      const beneficiaryId = 23;
      await this.contract.addBeneficiary(beneficiaryId, this.beneficiaryAddress);

      await this.contract.deactivateBeneficiary(beneficiaryId).then(async (result) => {
        await this.contract.activateBeneficiary(beneficiaryId).then(async (result) => {
          let retrievedBeneficiary = await this.contract.beneficiaries.call(beneficiaryId);
          assert.equal(retrievedBeneficiary[0], this.beneficiaryAddress);
          assert.equal(retrievedBeneficiary[1], true);
          await this.contract.activateBeneficiary.call(beneficiaryId).should.be.rejectedWith('revert');
        });
      });
    });
  });

  describe('withdraw', () => {
    it('withdraws funds to owner', async function() {
      const initialContractBalance = await this.web3.eth.getBalance(this.contract.address);

      await this.contract.withdraw(10);

      const newContractBalance = await this.web3.eth.getBalance(this.contract.address);
      assert.equal(initialContractBalance - 10, newContractBalance);
    });

    it('rejects when attempting to call from non-owner address', async function() {
      await this.contract.withdraw(
        10, { from: accounts[1] }
      ).should.be.rejectedWith('revert');
    });

    it('rejects when paused', async function() {
      await this.contract.pause();
      await this.contract.withdraw(10).should.be.rejectedWith('revert');
      await this.contract.unpause();
    });
  });

  describe('updateMinter', () => {
    beforeEach(async function () {
      this.minterAddress = accounts[1];
    });

    it('updates the minter address', async function() {
      let oldMinterAddress = await this.contract.minterAddress.call();

      await this.contract.updateMinter(this.minterAddress).then(async (result) => {
        let retrievedMinterAddress = await this.contract.minterAddress.call();
        assert.equal(retrievedMinterAddress, this.minterAddress);
      });

      await this.contract.updateMinter(oldMinterAddress);
    });

    it('rejects when paused', async function() {
      await this.contract.pause();

      await this.contract.updateMinter.call(
        this.minterAddress, { from: accounts[1] }
      ).should.be.rejectedWith('revert');
    
      await this.contract.unpause();
    });

    it('rejects when attempting to call from non-owner address', async function() {
      await this.contract.updateMinter.call(
        this.minterAddress, { from: accounts[1] }
      ).should.be.rejectedWith('revert');
    });
  });

  describe('updateTokenContract', () => {
    it('updates the token contract address', async function() {
      let oldContractAddress = await this.contract.tokenContract();
      let newContractAddress = '0x8A9Df80fA754Ea6cf7241aF654685c21a87AF22e';

      await this.contract.updateTokenContract(newContractAddress);
      const retrievedContractAddress = await this.contract.tokenContract();
      assert.equal(retrievedContractAddress, newContractAddress);

      await this.contract.updateTokenContract(oldContractAddress);
    });

    it('rejects when paused', async function() {
      await this.contract.pause();

      await this.contract.updateTokenContract.call(
        this.minterAddress, { from: accounts[0] }
      ).should.be.rejectedWith('revert');

      await this.contract.unpause();
    });

    it('rejects when attempting to call from non-owner address', async function() {
      await this.contract.updateTokenContract.call(
        this.minterAddress, { from: accounts[1] }
      ).should.be.rejectedWith('revert');
    });
  });

  describe('updateOverrideRate', () => {
    beforeEach(async function () {
      this.newOverrideRate = 3;
    });

    it('updates the override rate and whether its active', async function() {
      let oldOverrideRate = await this.contract.overrideRate.call();

      await this.contract.updateOverrideRate(false, this.newOverrideRate).then(async (result) => {
        let retrievedOverrideRate = await this.contract.overrideRate.call();
        assert.equal(retrievedOverrideRate, this.newOverrideRate);
      });

      await this.contract.updateOverrideRate(true, oldOverrideRate);
    });

    it('rejects when paused', async function() {
      await this.contract.pause();

      await this.contract.updateOverrideRate.call(
        false, this.newOverrideRate
      ).should.be.rejectedWith('revert');

      await this.contract.unpause();
    });

    it('rejects when attempting to call from non-owner address', async function() {
      await this.contract.updateOverrideRate.call(
        false, this.newOverrideRate, { from: accounts[1] }
      ).should.be.rejectedWith('revert');
    });
  });
});
