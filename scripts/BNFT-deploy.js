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

  // const amontaddress = await bnft.ownerOf("219200001353");

  // console.log("219200001353 owner address :",amontaddress);

  //========deployed ====erc20  ElfERC20

  const ElfERC20 = await hre.ethers.getContractFactory("ElfERC20");
  const elferc20 = await ElfERC20.deploy();
  await elferc20.deployed();

  console.log("elferc20 deployed to:", elferc20.address);


  // ========deployed ====elfmarket====  ElfMarket  


  const ElfMarket = await hre.ethers.getContractFactory("ElfMarket");
  const elfmarket = await ElfMarket.deploy("0x2b83877aCE845279f59919aeb912946C8b5Abe26",elferc20.address,bnft.address,"0x2b83877aCE845279f59919aeb912946C8b5Abe26");
  await elfmarket.deployed();

  console.log("elfmarket deployed to:", elfmarket.address);




}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



  /** ropsten 
   * elf_NFT deployed to: 0x26Dee35eBa7D70EeEe6f064bfd9aE0Bbc03aC144
   * elferc20 deployed to: 0xbBE49D88d2374A1855809b1FDd0133f152362C46
   * elfmarket deployed to: 0x47D12f8016820d56d34Fb792855426bCf919BBFe
   */