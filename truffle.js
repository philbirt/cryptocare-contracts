const HDWalletProvider = require("truffle-hdwallet-provider");
const rinkebyConfig = require('./rinkeby-config.json');

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
        return new HDWalletProvider(rinkebyConfig['mnemonic'], rinkebyConfig["api"]);
      },
      network_id: 4,
      skipDryRun: true
    }
  }
};
