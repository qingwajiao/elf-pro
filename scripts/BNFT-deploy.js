// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const BNFT = await hre.ethers.getContractFactory("BNFT");
  const bnft = await BNFT.deploy("0x2b83877aCE845279f59919aeb912946C8b5Abe26","https://public.nftstatic.com/static/nft/BSC/","Binance NFT Mystery Box - ELF Sports League","BMBELFSPORTS");

  await bnft.deployed();

  console.log("elf_NFT deployed to:", bnft.address);

//   await bnft.transferFrom("0x2b83877aCE845279f59919aeb912946C8b5Abe26","0x2b83877aCE845279f59919aeb912946C8b5Abe26","219200001353");

  const amontaddress = await bnft.ownerOf("219200001353");

  console.log("219200001353 owner address :",amontaddress);


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
