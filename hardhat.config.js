require('@nomiclabs/hardhat-waffle');
require("@nomiclabs/hardhat-web3");
require('dotenv').config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// function mnemonic() {
//   return process.env.PRIVATE_KEY;
// }

const PRIVATE_KEY = "aba4ee08731b87eb0c4e332a21b3e72c67574a777ded982c15f01a9871d870f2"

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.0',
  networks: {
    localhost: {
      url: 'http://localhost:8545',
      //gasPrice: 125000000000,  // you can adjust gasPrice locally to see how much it will cost on production
      /*
        notice no mnemonic here? it will just use account 0 of the hardhat node to deploy
        (you can put in a mnemonic here to set the deployer locally)
      */
    },
    bsctest: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545/', //<---- CONFIG YOUR INFURA ID IN .ENV! (or it won't work)
      accounts: [PRIVATE_KEY],
    },
    // kovan: {
    //   url: 'https://kovan.infura.io/v3/' + process.env.INFURA_ID, //<---- CONFIG YOUR INFURA ID IN .ENV! (or it won't work)
    //   accounts: [mnemonic()],
    // },
    // mainnet: {
    //   url: 'https://mainnet.infura.io/v3/' + process.env.INFURA_ID, //<---- CONFIG YOUR INFURA ID IN .ENV! (or it won't work)
    //   accounts: [mnemonic()],
    // },
    ropsten: {
      url: 'https://ropsten.infura.io/v3/' + '184b8233767d4d9fa46ed2d0ae9835fd', //<---- CONFIG YOUR INFURA ID IN .ENV! (or it won't work)
      accounts: [PRIVATE_KEY],
    },
    // matic: {
    //   url: 'https://polygon-mainnet.infura.io/v3/' + process.env.PROJECT_ID, //<---- CONFIG YOUR INFURA ID IN .ENV! (or it won't work)
    //   accounts: [mnemonic()]
    // },
  },
};