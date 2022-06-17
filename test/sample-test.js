const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("ElfMarket", function () {
    before(async function () {    
        this.signers = await ethers.getSigners()
        this.marketAdmin = this.signers[0]
        this.backendSigner = this.signers[1]
        this.nfking = this.signers[2]
        this.elfcfo = this.signers[3]
        this.userA = this.signers[4]
        this.userB = this.signers[5]
    
        this.ElfMarket = await ethers.getContractFactory("ElfMarket")
        this.ElfERC20 = await ethers.getContractFactory("ElfERC20")
        this.ElfNFT = await ethers.getContractFactory("ElfNFT")
    
      })

      beforeEach(async function () {
        this.elferc20 = await this.ElfERC20.deploy()
        await this.elferc20.deployed()

      })
    
      // 部署erc20,给相应的账户mit一些erc20token，
      it("相应的账户mit一些erc20token", async function () {
        await this.elferc20.mint(this.userA.address, "10000") 
        await this.elferc20.mint(this.userB.address, "10000") 

        const userABal = await this.elferc20.balanceOf(this.userA.address)
        const userBBal = await this.elferc20.balanceOf(this.userB.address)
 
        expect(userABal).to.equal("10000")
        expect(userBBal).to.equal("10000")
      });

      // 部署nft，给相应的账户mit一些nft
      it("部署nft给相应的账户mit一些nft", async function () {
        this.elfnft = await this.ElfNFT.deploy("https://public.nftstatic.com/static/nft/BSC/","elfnft","BMBELFSPORTS")
        await this.elfnft.deployed()
        await this.elfnft.safeMint(this.nfking.address, 555) 
        await this.elfnft.safeMint(this.nfking.address, 666) 
        await this.elfnft.safeMint(this.nfking.address, 777) 
        await this.elfnft.safeMint(this.nfking.address, 888) 

        const nfkingABal = await this.elfnft.balanceOf(this.nfking.address)
        expect(nfkingABal).to.equal("4")
      });

      // 部署elfMarket
      it("部署elfMarket", async function () {
        this.elfmarket = await this.ElfMarket.deploy(this.elfcfo.address,this.elferc20.address,this.elfnft.address,this.backendSigner.address)
        await this.elfmarket.deployed()

        const marketcfo = await this.elfmarket.elfCFO()
        expect(this.elfcfo.address).to.equal(marketcfo)
      });

      // nfking账户往 elfMarket 投放nft
      it("nfking账户往 elfMarket 投放nft", async function () {
        await this.elfnft.connect(this.nfking).setApprovalForAll(this.elfmarket.address,true)
        await this.elfmarket.connect(this.nfking).putNft(this.nfking.address)

        nfkingABal = await this.elfnft.balanceOf(this.nfking.address)
        this.marketNFTbal = await this.elfnft.balanceOf(this.elfmarket.address)
        // this.marketunset = await this.elfmarket.getUnlockNfts()
        expect(nfkingABal).to.equal("0")
        expect(this.marketNFTbal).to.equal("4")
        // expect(this.marketunset).to.equal("4")
        
      });

      // 用户尝试购买

      it("用户购买nft", async function () {


        // 部署nft
        this.elfnft = await this.ElfNFT.deploy("https://public.nftstatic.com/static/nft/BSC/","elfnft","BMBELFSPORTS")
        await this.elfnft.deployed()
        // 给nfking mintnft
        await this.elfnft.safeMint(this.nfking.address, 555) 
        await this.elfnft.safeMint(this.nfking.address, 666) 
        await this.elfnft.safeMint(this.nfking.address, 777) 
        await this.elfnft.safeMint(this.nfking.address, 888) 
        
        // nfking approve nft 给elfmarket
        await this.elfnft.connect(this.nfking).setApprovalForAll(this.elfmarket.address,true)
        await this.elfmarket.connect(this.nfking).putNft(this.nfking.address)

        await this.elferc20.mint(this.userA.address, "10000") 

        // 用户先approve 自己的erc20给elfmarket
        await this.elferc20.connect(this.userA).approve(this.elfmarket.address,"800")


        this.elfmarket = await this.ElfMarket.deploy(this.elfcfo.address,this.elferc20.address,this.elfnft.address,this.backendSigner.address)
        await this.elfmarket.deployed()


        // await this.elfnft.safeMint(this.nfking.address, "555") 

        // await this.elfnft.connect(this.nfking).setApprovalForAll(this.elfmarket.address,true)
        // await this.elfmarket.connect(this.nfking).putNft(this.nfking.address)




        const signature = await getSignature(
          this.backendSigner.address,
          555,
          "SR",
          1,
        );

        // let userAbal = await this.elferc20.balanceOf(this.userA.address)

        // let elfmarketerc20 = await this.elfmarket.usdtAddress()

        // expect(this.elferc20.address).to.equal(elfmarketerc20)

        await this.elfmarket.connect(this.userA).purchase(555,"SR",1,signature)

        // let userANFTBal = this.elfnft.balanceOf(this.userA.address)

        // expect(userANFTBal).to.equal("1")

        
      });


  // 部署erc20,给相应的账户mit一些erc20token，将账户的erc20 approve给 elfMarket
  // 部署nft，给相应的账户mit一些nft，将账户的nft approve给 elfMarket
  // 部署elfMarket
  // nfking账户往 elfMarket 投放nft
  // 查看elfMarket 的unlockset
  // 用户deposit自己的nft
  // 查看elfMarket 的unlockset
  // 用户尝试购买
  // admin unlock
  // 用户再尝试购买
  // 检查cfo账户的erc20余额，看看用户购买支付的erc20是否转移到cfo账户
  // nfking账户将elfMarket中的nft提走
  



});

async function getSignature(signer, ...rest) {
  console.log("getSignature:", signer);
  const hash = web3.utils.soliditySha3(...rest);
  let signature = await web3.eth.sign(hash, signer);
  // signature =
  //   signature.substr(0, 130) + (signature.substr(130) == "00" ? "1b" : "1c"); // v: 0,1 => 27,28
  console.log("getSignature:", signature);
  return signature;
}
