const ethers = require('ethers');

// The Contract interface
let abi = [
    "function balanceOf(address owner) external view returns (uint256 balance)"
];

//  let abi = [
//      "event ValueChanged(address indexed author, string oldValue, string newValue)",
//      "function balanceOf(address owner) external view returns (uint256 balance)",
//      "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256 tokenId)",
//      "function setValue(string value)"
//  ];

// 连接网络
let provider = ethers.getDefaultProvider('ropsten');

// 加载钱包以部署合约
let privateKey = 'aba4ee08731b87eb0c4e332a21b3e72c67574a777ded982c15f01a9871d870f2';
let wallet = new ethers.Wallet(privateKey, provider);

// Connect to the network
// let provider = ethers.getDefaultProvider();

// 地址来自上面部署的合约
let contractAddress = "0xebf24437cf59d6d3b3d799d6d032a925aa2e7a13";

// 使用Provider 连接合约，将只有对合约的可读权限
let contract = new ethers.Contract(contractAddress, abi, provider);

// 获取当前的值
let currentValue = await contract.balanceOf("0x2b83877aCE845279f59919aeb912946C8b5Abe26");

console.log("amount:", currentValue);
// "Hello World"


//  // 从私钥获取一个签名器 Signer
// let privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
//  let wallet = new ethers.Wallet(privateKey, provider);

//  // 使用签名器创建一个新的合约实例，它允许使用可更新状态的方法
//  let contractWithSigner = contract.connect(wallet);
//  // ... 或 ...
//  // let contractWithSigner = new Contract(contractAddress, abi, wallet)

//  // 设置一个新值，返回交易
//  let tx = await contractWithSigner.setValue("I like turtles.");

//  // 查看: https://ropsten.etherscan.io/tx/0xaf0068dcf728afa5accd02172867627da4e6f946dfb8174a7be31f01b11d5364
// console.log(tx.hash);
//  // "0xaf0068dcf728afa5accd02172867627da4e6f946dfb8174a7be31f01b11d5364"

//  // 操作还没完成，需要等待挖矿
//  await tx.wait();

//  // 再次调用合约的 getValue()
//  let newValue = await contract.getValue();

//  console.log(currentValue);
//  // "I like turtles."


