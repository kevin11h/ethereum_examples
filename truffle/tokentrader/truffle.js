module.exports = {
  networks: {
    development: {
      // Either use host and port, or specify a provider here
      // provider: function() {
      //   return new HDWalletProvider(mnemonic, "http://127.0.0.1:7545/");
      // },
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
      gas: 4700000,
      gasPrice: 100000000000
    }
  }
};
