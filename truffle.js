module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network: "*",
      from: "0x5aeda56215b167893e80b4fe645ba6d5bab767de",
    }
  }
};
