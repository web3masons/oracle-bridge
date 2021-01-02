# Oracle Bridge

A proof of concept EVM to EVM cross-chain communication protocol using EVM Storage Proofs and Oracles, for a custody-free token bridge.

Watch the video demo: https://youtu.be/H9n8z5Ge9cs

![Oracle Brdige Diagram](https://github.com/web3masons/oracle-bridge/blob/master/diagram.png)

## Overview

[EVM Storage Proofs](https://github.com/aragon/evm-storage-proofs) enable a contract to prove the presence of a specific peice of data within another EVM environment. Attempts have been made to use this to enable chain-to-chain communication, but one limitation is that Ethereum's Proof of Work cannot be verified within a contract due to the gas limit.

Most other approaches use a fedaration of validators or custodians that micro-manage the minting and burning of wrapped contracts, whilst holding assets and ultimately having the ability collude and 'alleviate' the funds if they wish. They need to be online all the time and you trust them to not disappear one day.

Instead of verifying proof of work trustlessly within a contract, or relying on a specific validator set, the Oracle Bridge approach uses a generalised oracle (or collection of oracles, such as ChainLink) to simply periodically report the block number and block hash of remote chains.

As these oracles are generalised data oracles and have strong disincentive to collude with each other (they have their own rhobust systems in place to ensure data integrity and are potentially reporting the same data for many different dapps), the Oracle Bridge appraoch presents a novel and improved security model for token bridges and chain-to-chain communication in general.

In combination with a storage proof, the block hash can be used to validate the state of a remote chain and contracts can implement cross chain systems such as the example in this repository.

The following token bridge example issues "wrapped" tokens that can be redeemed back to the original asset with strong guaruntees.

Let's imagine we want to 'send' ETC to ETH mainnet - really we are just locking it up on ETC and issuing an IOU 'wrapped token' on ETH that can be redeemed for ETC. A basic implementaiton of the system is as follows (the numbers provided are flexible and are for illustrative purposes only):

1. User deposits 1 ETC into the `ETC-OracleBridge` contract (on the Ethereum Classic chain)
1. The user creates a Storage Proof proving the ETC has been deposited on this block
1. Every 100 blocks, an oracle (or group of oracles) reports the block hash of ETC to `ETH-OracleBridge` on Ethereum Mainnet
1. After 1000 confirmation blocks have pased on ETC, the user passes the Storage Proof created earlier to the the `ETH-OracleBridge` contract (on the Etheruem Mainnet chain)
1. The contract verifies that the Storage Proof is part of a black that matches the block header reported by the oracle and issues the amount of Wrapped ETC on ETH Mainnet
1. The Wrapped ETC can be traded freely as a regular ERC20 token; it remains locked on the ETC chain
1. When the time comes to redeem the Wrapped ETC to ETC, the process happens in reverse;
1. The 'deposits' (burns) the Wrapped ETC to the `ETH-OracleBridge` contract
1. The user creates a Storage Proof of the deposit at this particular block
1. Every 100 blocks, an oracle reports the block hash of ETH to `ETC-OracleBridge` (on Etheruem Classic)
1. After 1000 confimations, the user can relay the Storage Proof to the `ETC-OracleBridge` contract, which is verified by the contract and ETC can be redeemed by the user

A basic contract set, test suite and Web UI is included in this repository to demonstrate the above system.

Again, this is the most basic example and there is room for many improvements and optimisations, such as:

- Work out the best scheme for Oracle selection
- Support ERC20 deposits
- One contract for multiple assets and chains
- Implementaiton of metatransactions to eliminate the need of users to spend gas
- A swap market to remove the need for users to wait for the confirmation blocks
- Archive node services to allow users to access old proofs
- Dynamic confirmation times based on various metrics (including amount)
- Etc.

## Testing

Check out `./test/oracle-bridge.js` for an example test run through. Run it with `npm run test`.

Because we use `eth_getProof`, we need to run a real node (not a virtual hardhat node) when testing. You can set this environment up by running Geth in dev mode and creating a second account:

```bash
# run geth
geth --datadir ~/geth-dev --rpc --dev --allow-insecure-unlock
# attach
geth attach ~/geth-dev/geth.ipc
# create account
personal.newAccount()
# fund it
eth.sendTransaction({from:eth.coinbase, to:eth.accounts[1],value:1e18})
# unlock it
personal.unlockAccount(eth.accounts[1],'',0)
```

## UI Tesitng

In this case we are using two seperate networks to simulate cross chian stuff, with private keys in the browser.

```bash
# start asok
geth --datadir ~/no-backup/geth-dev-asok --rpc --dev --allow-insecure-unlock --rpccorsdomain "http://localhost:3000" --http --http.port 3333
# start nana
geth --datadir ~/no-backup/geth-dev-nana --rpc --dev --allow-insecure-unlock --rpccorsdomain "http://localhost:3000" --http --http.port 4444
# deploy and fund asok accounts; take note of contract addresss and update UI
npm run deploy-asok && npm run fund-asok
# deploy and fund asok accounts; take note of contract addresss and update UI
npm run deploy-nana && npm run fund-nana
```
