//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0; 

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "hardhat/console.sol";


/*  
    ElfMarket合约逻辑：
        1.质押：用户调用deposit方法，需要传入tokenid 及 pid（将该nft押注的场次），合约根据pid将nft锁在不同的locklist中
        2.解锁：等开奖后 由owner账户(市场管理员)调用unlock方法，需要传入pid，合约会将pid对应的locklist释放到unlockSet中
        3.购买：用户调用purchase方法，需要传入tokenid、level、id(签名序号）、signature(后端签名信息) 四个参数，然后可以从unlockSet中购买对应的nft。
          注意：为了防止他人购买nft时，传入与tokenid不匹配的level。所以此接口只对elf项目方的后端开放，为此需要使用多签名（需要后端账户签名 + 用户签名）

        其他特权功能：
        4.nfking账户（项目方）可以将自己的nft投放到ElfMarket市场中售卖
        5.提取：owner账户(市场管理员）可以调用withdraw方法，需要传入tokenIDs 、 to 两个参数，将对应的nft提取到to地址。
        6.owner账户(市场管理员）设置 nft各个级别对应的价格
        7.owner账户(市场管理员）设置一个财务地址，用于接收用户购买nft是发送的usdt
        8.owner账户(市场管理员)可以设置一个后端的账户地址 用于验证签名
        9.nfking账户（项目方）可以将自己的nft投放到ElfMarket市场中售卖

        为了避免ElfMarket出现脏数据，所以用户质押的nft是先转到ElfMarket管理/售卖
**/


contract ElfMarket is Ownable, ReentrancyGuard {

    using EnumerableSet for EnumerableSet.UintSet;
    using ECDSA for bytes32;


    struct DepositInfo {
        uint tokenid;
        string pid;
    }

    // elf财务账户地址 
    address public elfCFO;
    // 支付代币地址
    address public busdAddress;
    // ELF的nft合约地址
    address public elfNFTContractAddress;
    // elf后端签名账户
    address public backendSigner;


    // 存放可以放在市场上售卖的nft集合
    EnumerableSet.UintSet unlockSet;

    // 比赛场次 => locklist
    mapping(string => uint[]) public lockSet;
 
    // nft级别  => nft 价格 
    mapping(string => uint) public levelPrice;

    // 
    mapping(uint256 => bool) recordMap;

    event Deposit(address indexed user, uint indexed tokenId);

    event Purchase(address indexed user, uint indexed tokenId);

    event Withdraw(address indexed nfKings,uint[] indexed nfts);

    event SetPrice(string indexed level, uint indexed price);

    event SetBackendSigner(address indexed oldBackendSigner, address indexed newBackendSigner);

    modifier once(uint256 id) {
        require(!recordMap[id], "already transferred");
        _;
        recordMap[id] = true;
    }

    // 部署合约需要指定 cfo地址 支付代币地址 elf的nft的合约地址
    constructor(address _elfCFOAddress, address _busdAddress, address _elfNFTaddress, address _backendSigner){
        require(_elfCFOAddress != address(0) && _busdAddress != address(0) && _elfNFTaddress != address(0),"ElfMarket: Parameter error");
        elfCFO = _elfCFOAddress;
        elfNFTContractAddress = _elfNFTaddress;
        busdAddress = _busdAddress;
        backendSigner = _backendSigner;
        initialize();

    }

    function initialize()internal {
        levelPrice["SR"] = 200000000000000000000;
        levelPrice["R"] = 60000000000000000000;
        levelPrice["N"] = 25000000000000000000;

        levelPrice["NFKSR"] = 180000000000000000000;
        levelPrice["NFKR"] = 54000000000000000000;
        levelPrice["NFKN"] = 22500000000000000000;

    }

    // 批量质押 pass
    function deposit(DepositInfo[]memory _depositInfos) public {
         uint len = _depositInfos.length;
         require(len >0,"ElfMarket: Parameter error");
         for(uint index = 0;index <len; index ++){
            IERC721Enumerable(elfNFTContractAddress).transferFrom(msg.sender,address(this),_depositInfos[index].tokenid);

            // 将该nft添加到lockset中
            lockSet[_depositInfos[index].pid].push(_depositInfos[index].tokenid);
         }
    }


    // 将pid对应的locklist释放到unlockset中
    function unlock(string memory  _pid) public onlyOwner{
        uint[] memory lockList = lockSet[_pid];
        uint len = lockList.length;

        if(len == 0) return;

        for (uint index =0;index < len; index ++){

            unlockSet.add(lockList[index]);
        }
        // 将 lockNfts数组 清空
        delete lockSet[_pid];

        // lockSet[_pid] = lockList;
    }

    // 用户购买 nft 
    // _tokenID：用户购买的nft的tokenid
    // _level：用户购买的nft对应的级别
    function purchase(uint _tokenID, string memory _level, uint256 _id, bytes memory signature)public nonReentrant once(_id){

        require( unlockSet.contains(_tokenID), "ElfMarket: NFT non-existent ");
        require(levelPrice[_level] != 0, "ElfMarket: level non-existent");
        require(IERC20(busdAddress).balanceOf(msg.sender) >= levelPrice[_level], "ElfMarket: Insufficient user balance");

        //todo 后续待完善 验证后段签名   

        checkSigner(abi.encodePacked(_tokenID, _level, _id), signature);

        // 将nft从unlockset中移除
        unlockSet.remove(_tokenID);

        // 转账
        IERC20(busdAddress).transferFrom(msg.sender, elfCFO, levelPrice[_level]);

        // 给用户转对应的nft
        IERC721Enumerable(elfNFTContractAddress).safeTransferFrom(address(this), msg.sender, _tokenID);

        emit Purchase(msg.sender,_tokenID);
    }

    function withdrawERC20(address _nftAddress, address _to, uint _amount)public onlyOwner{
        require(_to != address(0),"Address cannot be zero");
        IERC20(_nftAddress).transfer(_to,_amount);
    }

    // owner提取nft 到 to 地址
    function withdrawNFT(address _nftAddress, address _to, uint[] memory _tokenIDs)public onlyOwner {
        uint len = _tokenIDs.length;

        if (len == 0){
            _withdrawAll(_nftAddress, _to);
            return;
        }
        
        for (uint index = 0; index < len; index++){
            uint tokenid = _tokenIDs[index];
            // unlock状态才能转走

            IERC721Enumerable(_nftAddress).safeTransferFrom(address(this),_to,tokenid);
            // 需要将转移走的tokenid 从unlockset中移除，避免后端获取到脏数据
            unlockSet.remove(tokenid);
        }

        emit Withdraw(_to,_tokenIDs);

    }

    function _withdrawAll(address _nftAddress, address _to)internal{
        require(_to != address(0),"ElfMarket: Account has no permission");
        uint[]memory nftList = getUserNftList(address(this));
        uint len = nftList.length;
        for (uint index =0;index < len; index ++){

            IERC721Enumerable(_nftAddress).safeTransferFrom(address(this), _to, nftList[index]);
            unlockSet.remove(nftList[index]);
        }
        emit Withdraw(_to,nftList);
    }


    // 查询可以在市场上售卖的nfs
    function getUnlockNfts()public view returns(uint[] memory){

        return unlockSet.values();
    }

    
        // owner 设置后端签名地址
    function setBackendSigner(address _backendSigner) public onlyOwner {
        require(_backendSigner != address(0),"ElfMarket: Address cannot be zero");
        address oldAddress = backendSigner;
        backendSigner = _backendSigner;

        emit SetBackendSigner(oldAddress,_backendSigner);
       
    }



        // owner 调整级别对应的价格
    function setPrice(string memory _level, uint _price) public onlyOwner {
        levelPrice[_level] = _price;

        emit SetPrice(_level,_price);
    }

    // 初始阶段 项目方将自己账户的nft放入到 ElfMarket 中开卖 
    // pass  --> 有待优化 todo 需要加权限问题
    function putNft(address _nfkingAddress)public {

        require(_nfkingAddress == msg.sender,"ElfMarket: Account has no permission");
        uint[]memory nftList = getUserNftList(_nfkingAddress);
        uint len = nftList.length;
        for (uint index =0;index < len; index ++){

            IERC721Enumerable(elfNFTContractAddress).transferFrom(_nfkingAddress, address(this), nftList[index]);
            unlockSet.add(nftList[index]);
        }
    }

    // 获取用户拥有的nft
    function getUserNftList(address _userAddress)public view returns(uint[] memory ){
        require(_userAddress != address(0),"ElfMarket: Address cannot be zero");

        uint amount =  IERC721Enumerable(elfNFTContractAddress).balanceOf(_userAddress);

        uint[] memory tempUserNFTs = new uint[](amount);
        
        if (amount == 0) return tempUserNFTs;

        for (uint index = 0; index < amount; index ++){
            uint tokenId = IERC721Enumerable(elfNFTContractAddress).tokenOfOwnerByIndex(_userAddress, index);
            tempUserNFTs[index] = tokenId ;
        }

        return tempUserNFTs;

    }


    function onERC721Received(address _operator,address _from,uint256 _tokenId,bytes calldata _data) external returns(bytes4){
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }


    function checkSigner(bytes memory hash, bytes memory signature)private view{
        require(
            keccak256(hash).toEthSignedMessageHash().recover(signature) ==
                backendSigner,
            "wrong signer"
        );
    }


}
