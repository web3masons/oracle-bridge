const privateKeys = [
  '0x0000000000000000000000000000000000000000000000000000000000000001', // alice
  '0x0000000000000000000000000000000000000000000000000000000000000002', // bob
  '0x0000000000000000000000000000000000000000000000000000000000000003', // charlie
  '0x0000000000000000000000000000000000000000000000000000000000000004', // dave
  '0x0000000000000000000000000000000000000000000000000000000000000005', // emma
  '0x0000000000000000000000000000000000000000000000000000000000000006', // fred 
  '0x0000000000000000000000000000000000000000000000000000000000000007' // oracle
]

async function main() {
  const [signer] = await ethers.getSigners()

  await Promise.all(privateKeys.map(async (k) => {
    const address = ethers.utils.computeAddress(k);
    await signer.sendTransaction({ to: address, value: ethers.utils.parseEther("1.0") });
    console.log(address, (await ethers.provider.getBalance(address)).toString())
  }))

  console.log('funded!');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
