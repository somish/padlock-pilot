const HDWalletProvider = require('@truffle/hdwallet-provider')
require('dotenv').config()

module.exports = {
  networks: {
    development: {
      provider: () => {
        return new HDWalletProvider(process.env.MNEMONIC, 'http://0.0.0.0:8545')
      },
      network_id: '*',
    },
    rinkeby: {
      provider: () => {
        return new HDWalletProvider(process.env.MNEMONIC, 'https://rinkeby.infura.io/v3/' + process.env.INFURA)
      },
      network_id: '4',
    },
    mainnet: {
      provider: () => {
        return new HDWalletProvider(process.env.MNEMONIC, 'https://mainnet.infura.io/v3/' + process.env.INFURA)
      },
      network_id: '4',
    },
  },
  compilers: {
    solc: {
      version: '0.6.2',
      settings: {
        optimizer: {
          enabled: false,
          runs: 200,
        },
      },
    },
  },
}
