const { expect } = require('chai')
const { getProof } = require('../web3-proof')

describe('OracleBridge', () => {
  it('works', async () => {
    const [sSigner, rSigner] = await ethers.getSigners()

    const { address: sender } = sSigner
    const { address: receiver } = rSigner
    const nullAddress = ethers.constants.AddressZero

    const AMOUNT = 1337
    const DEPOSIT_TYPE = 1
    const BURN_TYPE = 2

    const ERC20Wrapper = await ethers.getContractFactory('ERC20Wrapper')
    const wrapper = await ERC20Wrapper.deploy()
    await wrapper.deployed()

    const OracleBridge = await ethers.getContractFactory('OracleBridge')
    const oracleBridge = await OracleBridge.deploy()
    await oracleBridge.deployed()
    // instance with receiver as the signer
    const rOracleBridge = oracleBridge.connect(rSigner)

    // TODO use a different peer contract in prod(!)
    const peer = oracleBridge.address

    // let's a-go (initialize)
    await oracleBridge.init(peer, wrapper.address)
    expect(await oracleBridge.wrapper()).to.equal(wrapper.address)
    expect(await oracleBridge.peer()).to.equal(peer)

    // deposit value into it
    const depositTx = await (
      await oracleBridge.deposit(receiver, {
        from: sender,
        value: AMOUNT,
      })
    ).wait()

    const { id: depositId, nonce: depositNonce } = depositTx.events[0].args

    // generate proof locally
    const depositProof = await getProof(
      oracleBridge.address,
      depositId,
      depositTx.blockNumber,
    )

    // create a checkpoint
    // in reality this would be done by chainlink or something
    await (
      await oracleBridge.createCheckpoint(
        depositTx.blockNumber,
        depositTx.blockHash,
      )
    ).wait()

    // confirm checkpoint
    expect(await oracleBridge.checkpoints(depositTx.blockNumber)).to.equal(
      depositTx.blockHash,
    )

    // mint some tokens by relaying proof
    await (
      await oracleBridge.mint(
        receiver,
        [depositTx.blockNumber, AMOUNT, depositNonce, DEPOSIT_TYPE],
        [
          depositProof.blockHeaderRLP,
          depositProof.accountProofRLP,
          depositProof.storageProofsRLP[0],
        ],
      )
    ).wait()

    // cool, we got da shit.
    expect(await wrapper.balanceOf(receiver)).to.equal(AMOUNT)

    // burn it
    const burnTx = await (await rOracleBridge.burn(nullAddress, AMOUNT)).wait()

    // no more tokens
    expect(await wrapper.balanceOf(receiver)).to.equal(0)

    const { id: burnId, nonce: burnNonce } = burnTx.events[1].args

    // generate proof locally
    const burnProof = await getProof(
      oracleBridge.address,
      burnId,
      burnTx.blockNumber,
    )

    // create a checkpoint
    // in reality this would be done by chainlink or something
    await (
      await oracleBridge.createCheckpoint(burnTx.blockNumber, burnTx.blockHash)
    ).wait()

    // confirm checkpoint
    expect(await oracleBridge.checkpoints(burnTx.blockNumber)).to.equal(
      burnTx.blockHash,
    )

    const beforeBal = await ethers.provider.getBalance(nullAddress)
    // // now we can redeem
    await (
      await rOracleBridge.redeem(
        nullAddress,
        [burnTx.blockNumber, AMOUNT, burnNonce, BURN_TYPE],
        [
          burnProof.blockHeaderRLP,
          burnProof.accountProofRLP,
          burnProof.storageProofsRLP[0],
        ],
      )
    ).wait()

    // 😎
    expect(await ethers.provider.getBalance(nullAddress)).to.equal(
      beforeBal.add(AMOUNT),
    )
  })
})
