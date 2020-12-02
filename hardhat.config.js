require('@nomiclabs/hardhat-waffle')

module.exports = {
  solidity: '0.7.5',
  defaultNetwork: 'gethDevMode',
  networks: {
    gethDevMode: {
      url: 'http://localhost:8545',
    },
  },
}
