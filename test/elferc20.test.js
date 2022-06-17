const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ElfERC20", function () {

  before(async function () {
    this.ElfERC20 = await ethers.getContractFactory("ElfERC20")
    this.elftoken = await this.ElfERC20.deploy()
    await this.elftoken.deployed()


  })

  beforeEach(async function () {
    this.signers = await ethers.getSigners()
    this.alice = this.signers[0]
    this.bob = this.signers[1]
    this.lili = this.signers[2]
  })


  it("should have correct name and symbol", async function () {

    expect(await this.elftoken.name()).to.equal("elferc20");
    expect(await this.elftoken.symbol()).to.equal("elf");
  });

  it("should only allow owner to mint token", async function () {
    await this.elftoken.mint(this.alice.address, "100")
    await this.elftoken.mint(this.bob.address, "1000")

    const totalSupply = await this.elftoken.totalSupply()
    const aliceBal = await this.elftoken.balanceOf(this.alice.address)
    const bobBal = await this.elftoken.balanceOf(this.bob.address)
 
    expect(totalSupply).to.equal("1100")
    expect(aliceBal).to.equal("100")
    expect(bobBal).to.equal("1000")

  })

  it("检验转账", async function () {
    await this.elftoken.mint(this.alice.address, "100")
    await this.elftoken.mint(this.bob.address, "1000")

    await this.elftoken.transfer(this.lili.address, "10")
    await this.elftoken.connect(this.bob).transfer(this.lili.address, "100", {
      from: this.bob.address,
    })
    const totalSupply = await this.elftoken.totalSupply()
    const aliceBal = await this.elftoken.balanceOf(this.alice.address)
    const bobBal = await this.elftoken.balanceOf(this.bob.address)
    const liliBal = await this.elftoken.balanceOf(this.lili.address)
    expect(totalSupply, "1100")
    expect(aliceBal, "90")
    expect(bobBal, "900")
    expect(liliBal, "110")
  })



});
