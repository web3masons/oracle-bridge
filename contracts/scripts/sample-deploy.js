async function main() {
  const ERC20Wrapper = await ethers.getContractFactory('ERC20Wrapper')
  const wrapper = await ERC20Wrapper.deploy()
  await wrapper.deployed()

  const OracleBridge = await ethers.getContractFactory('OracleBridge')
  const oracleBridge = await OracleBridge.deploy()
  await oracleBridge.deployed()

  await oracleBridge.init(oracleBridge.address, wrapper.address)

  console.log("Deployed to:", oracleBridge.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
