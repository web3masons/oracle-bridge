/* eslint-disable class-methods-use-this */
// modified from https://github.com/aragon/evm-storage-proofs/blob/eec39e0668304c0c0cc42eaa86fe6a459f623645/packages/web3-proofs/src/index.js
// this is pretty hacky, refactor to just use ethersjs (!)

const Web3 = require('web3')
const { ethers } = require('ethers');
const EthereumBlock = require('ethereumjs-block/from-rpc')
const RLP = require('rlp')
const Trie = require('merkle-patricia-tree')
const { promisify } = require('util')

class Web3Proofs {
  constructor(ethersProvider) {
    this.ethersProvider = ethersProvider
    this.web3 = new Web3(
      new Web3.providers.HttpProvider(ethersProvider.connection.url),
    )
  }

  async getProof(
    address,
    storageKeys = [],
    blockNumber = 'latest',
    verify = true,
  ) {
    const blockNumParsed =
      blockNumber === 'latest' ? 'latest' : this.web3.utils.toHex(blockNumber)
    const proof = await this.ethersProvider.send('eth_getProof', [
      address,
      storageKeys,
      blockNumParsed,
    ])

    const block = await this.web3.eth.getBlock(blockNumber)
    const blockHeaderRLP = this.blockHeaderRLP(block)

    if (verify) {
      // Verify account proof locally
      const accountProofVerification = await this.verifyAccountProof(
        block.stateRoot,
        address,
        proof,
      )
      if (!accountProofVerification) {
        throw new Error('Local verification of account proof failed')
      }

      // Verify storage proofs locally
      const storageProofs = await Promise.all(
        proof.storageProof.map((storageProof) =>
          this.verifyStorageProof(proof.storageHash, storageProof),
        ),
      )

      const failedProofs = storageProofs
        .filter((result) => !result) // filter failed proofs
        .map((_, i) => i)

      if (failedProofs.length > 0) {
        throw new Error(
          `Proof failed for storage proofs ${JSON.stringify(failedProofs)}`,
        )
      }
    }

    const accountProofRLP = this.encodeProof(proof.accountProof)
    const storageProofsRLP = proof.storageProof.map((p) =>
      this.encodeProof(p.proof),
    )

    return {
      proof,
      block,
      blockHeaderRLP,
      accountProofRLP,
      storageProofsRLP,
    }
  }

  encodeProof(proof) {
    return `0x${RLP.encode(proof.map((part) => RLP.decode(part))).toString(
      'hex',
    )}`
  }

  async verifyAccountProof(stateRoot, address, proof) {
    const path = this.web3.utils.sha3(address).slice(2)

    const proofAccountRLP = await this.verifyProof(
      stateRoot,
      Buffer.from(path, 'hex'),
      proof.accountProof,
    )
    const stateAccountRLP = this.accountRLP(proof)

    return Buffer.compare(stateAccountRLP, proofAccountRLP) === 0
  }

  async verifyStorageProof(storageRoot, storageProof) {
    const path = this.web3.utils
      .soliditySha3({ t: 'uint256', v: storageProof.key })
      .slice(2)

    const proofStorageValue = await this.verifyProof(
      storageRoot,
      Buffer.from(path, 'hex'),
      storageProof.proof,
    )
    const stateValueRLP = RLP.encode(storageProof.value)

    return Buffer.compare(proofStorageValue, stateValueRLP) === 0
  }

  async verifyProof(rootHash, path, proof) {
    // Note: it crashes when the account is not used??? ()
    // Error: Key does not match with the proof one (extention|leaf)
    return promisify(Trie.verifyProof)(rootHash, path, proof)
  }

  accountRLP({ nonce, balance, storageHash, codeHash }) {
    const bal = balance === '0x0' ? null : balance
    return RLP.encode([nonce, bal, storageHash, codeHash])
  }

  blockHeaderRLP(_block) {
    // From https://github.com/zmitton/eth-proof/blob/master/buildProof.js#L274

    const block = { ..._block }
    block.difficulty = `0x${this.web3.utils
      .toBN(block.difficulty)
      .toString(16)}`
    const ethereumBlock = new EthereumBlock(block)
    const blockHeaderRLP = `0x${RLP.encode(ethereumBlock.header.raw).toString(
      'hex',
    )}`

    const solidityBlockHash = this.web3.utils.soliditySha3(blockHeaderRLP)

    if (solidityBlockHash !== block.hash) {
      throw new Error(
        `Block header rlp hash (${solidityBlockHash}) doesnt match block hash (${block.hash})`,
      )
    }

    return blockHeaderRLP
  }
}

// storage slot position - modify if the contact changes the location of `actions`
const SLOT_POSITION = 0

async function getProof(address, actionId, blockNumber = 'latest', ethersProvider) {
  const w3p = new Web3Proofs(ethersProvider);
  const slot = ethers.utils.solidityKeccak256(
    ['bytes32', 'uint256'],
    [actionId, SLOT_POSITION],
  )
  const proofs = await w3p.getProof(address, [slot], blockNumber)
  return proofs
}

module.exports = getProof
