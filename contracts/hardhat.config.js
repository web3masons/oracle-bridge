require('@nomiclabs/hardhat-waffle')

module.exports = {
  solidity: '0.7.5',
  defaultNetwork: 'gethDevMode',
  networks: {
    gethDevMode: {
      url: 'http://localhost:8545',
    },
    asok: {
      url: 'http://localhost:3333',
    },
    nana: {
      url: 'http://localhost:4444',
    },
  },
}
