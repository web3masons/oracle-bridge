async function main() {
  const ERC20Wrapper = await ethers.getContractFactory('ERC20Wrapper')
  const wrapper = await ERC20Wrapper.deploy()
  await wrapper.deployed()

  const OracleBridge = await ethers.getContractFactory('OracleBridge')
  const oracleBridge = await OracleBridge.deploy()
  await oracleBridge.deployed()

  if (!process.env.NO_INIT) {
    await oracleBridge.init(oracleBridge.address, wrapper.address)
  } else {
    console.log("Contract NOT initialized, you must do this manually!")
  }

  console.log("OracleBridge:", oracleBridge.address);
  console.log("Wrapper:", wrapper.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
