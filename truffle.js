const HDWalletProvider = require("truffle-hdwallet-provider");
const walletConfig = require('./wallet-config.json');
const NonceTrackerSubprovider = require("web3-provider-engine/subproviders/nonce-tracker")

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: "*",
    },
    rinkeby: {
      provider: function() {
        var wallet = new HDWalletProvider(walletConfig['rinkeby']['mnemonic'], walletConfig['rinkeby']["api"]);
        var nonceTracker = new NonceTrackerSubprovider()
        wallet.engine._providers.unshift(nonceTracker)
        nonceTracker.setEngine(wallet.engine)
        return wallet
      },
      network_id: 4,
      skipDryRun: true
    },
    mainnet: {
      provider: function () {
        var wallet = new HDWalletProvider(walletConfig['mainnet']['mnemonic'], walletConfig['mainnet']["api"]);
        var nonceTracker = new NonceTrackerSubprovider()
        wallet.engine._providers.unshift(nonceTracker)
        nonceTracker.setEngine(wallet.engine)
        return wallet
      },
      network_id: 1,
      skipDryRun: true
    }
  }
};
