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
        expect(userBal).to.equal("10000")
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
