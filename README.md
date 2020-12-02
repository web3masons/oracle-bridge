# Oracle Bridge

A proof of concept EVM to EVM cross-chain communication protocol using EVM Storage Proofs and Oracles.

## Overview

EVM Storage proofs enable a contract to prove the presence of a specific peice of data on another EVM environment. Attempts have been made to use this to create chain-to-chain communication, but the limitation is that Ethereum's Proof of Work cannot be verified within a contract due to the gas limit.

Instead of verifying proof of work trustlessly within a contract, this approach used an oracle (or collection of oracles) to report the block header of remote chains, which can then be used to derive a verification of the state of the other chain using EVM storage proofs.

Contracts can then use this proof to create novel schemes communicating between chains. In this example, we create a token bridge that issues "wrapped" tokens that can be redeemed with strong guaruntees. Let's dive deeper.

In this example, let's imagine we want to send ETC to ETH mainnet. A basic implementaiton of the system is as follows. The numbers provided are flexible and are for illustrative purposes only.

1. User deposits 1 ETC into the `ETC-token-bridge` contract (on the Ethereum Classic chain)
1. The user immediately creates a Storage Proof showing that the ETC has been deposited on this block
1. Every 100 blocks, an oracle (or group of oracles) reports the block hash of ETC to `ETH-token-bridge` on Ethereum Mainnet
1. After 1000 confirmation blocks have pased on ETC, the user passes the Storage Proof created earlier to the the `ETH-token-bridge` contract (on the Etheruem Mainnet chain)
1. The contract verifies that the block header matches the reported header from the oracles and issues the amount of Wrapped ETC on ETH Mainnet
1. The Wrapped ETC can be traded freely as a regular ERC20 token; it remains locked on the ETC chain
1. When the time comes to redeem the Wrapped ETC to ETC, the process happens in reverse;
1. The 'deposits' (burns) the Wrapped ETC to the `ETH-token-bridge` contract
1. The user creates a Storage Proof of the deposit at this particular block
1. Every 100 blocks, an oracle reports the block hash of ETH to `ETC-token-bridge` (on Etheruem Classic)
1. After 1000 confimations, the user can relay the Storage Proof to the `ETC-token-bridge` contract, which is verified by the contract and ETC can be redeemed by the user

A basic contract set, test suite and ~~TODO: Web UI~~ is included in this repository to demonstrate the above system.

Again, this is the most basic example and there is room for many improvements and optimisations, such as:

- Implementaiton of metatransactions to eliminate the need of users to spend gas
- A swap market to remove the need for users to wait for the confirmation blocks
- Archive node services to allow users to access old proofs
- Dynamic confirmation times based on various metrics (including amount)
- Etc.

## Testing

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
