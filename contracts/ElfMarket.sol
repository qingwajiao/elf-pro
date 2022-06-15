//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0; 

import "./interfaces/IELFNFT.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


/*
    ElfMarket合约逻辑：
        1.质押：用户质押nft分两种情况
            1.1 该nft第一次到ElfMarket质押，调用firstDeposit方法，需要提供 tokenid 及对应的 level，用于在ElfMarket中记录该 nft及其价格，
                主意：为了防止有人恶意提供nft的level，导致ElfMarket记录错乱，此方法需要使用后台账户签名才能调用。
            1.2 该nft不是第一次在ElfMarket质押，deposit方法，则只需 提供tokenid购买即可，因为合约中已经有该nft的价格记录
            1.3 用户质押的nft将添加到lockNfts数组中锁住，防止“一张门票被循环使用”
        2.解锁：等开奖后 由owner账户(市场管理员)，调用unlock()将lockNfts锁定的nft释放到unlockSet中
        3.购买：用户在ElfMarket中调用buy()方法从unlockSet中购买nft

        其他特权功能：
        4.nfKings账户提取 nft
        5.owner账户(市场管理员）更新 nfKings地址
        6.owner账户(市场管理员）设置 nft各个级别对应的价格

        为了避免ElfMarket出现脏数据，所以用户质押的nft是先转到ElfMarket管理/售卖，nfKings需要提取才会转到nfKings地址
**/


contract ElfMarket is Ownable, ReentrancyGuard {

    address nfKingsAddress;
    address usdtAddress;
    IELFNFT elfNFT;

    using EnumerableSet for EnumerableSet.UintSet;

    // 
    EnumerableSet.UintSet unlockSet;

    // nftInfo [] public nfts;

    uint [] public tempUserNFTs;


    uint [] public lockNfts;

    // mapping(uint => uint) unlockNfts;
 
    // nft级别  => nft 价格 
    mapping(string => uint) levelPrice;
    // mapping(address => )

    // mapping(uint => string) nftlevel;

    // uint lock;
    event Deposit(address indexed user, uint indexed tokenId);

    event Buy(address indexed user, uint indexed tokenId, string indexed price);

    event Withdraw(address indexed nfKings,uint[] indexed nfts);

    event SetPrice(string level, uint price);

    event SetNFKingsAddress(address nfKingsAddress);

    modifier onlyNFKings() {
        require(nfKingsAddress == _msgSender(), "ElfMarket: caller is not the NFKings");
        _;
    }

    constructor(address _nfKingsAddress, address _usdtAddress, address _elfNFTaddress){
        require(_nfKingsAddress != address(0) && _usdtAddress != address(0) && _elfNFTaddress != address(0),"ElfMarket: Parameter error");
        nfKingsAddress = _nfKingsAddress;
        elfNFT = IELFNFT(_elfNFTaddress);
        usdtAddress = _usdtAddress;
    }

    

    // 查询用户拥有的nft

    function checkBalance(address _userAddress)public returns(uint[] memory userNFTs){
        uint  amount =  elfNFT.balanceOf(_userAddress);
        // uint[] memory userNFTs1;
        for (uint index = 0;index< amount;index++){
            tempUserNFTs.push(elfNFT.tokenOfOwnerByIndex(_userAddress, index)) ;
        }

        userNFTs = tempUserNFTs;
        
    }

    // function setApprovalForAll(address nftaddress)public{
    //             // You can send ether and specify a custom gas amount
    //     (bool success, bytes memory data) = nftaddress.call(
    //         abi.encodeWithSignature("setApprovalForAll(address,bool)", nfKingsAddress, true)
    //     );

    //     // emit Response(success, data);
    // }


    // 转移用户的nft到admin
    function tranferToAdmin(uint _tokenID)public{
        elfNFT.safeTransferFrom(msg.sender, nfKingsAddress, _tokenID);
    }


    // // 用户质押 需要后端的账户签名
    // function firstDeposit(uint _tokenID, string memory _level)public nonReentrant {

    //     // 
    //     elfNFT.transferFrom(msg.sender,address(this),_tokenID);

    //     uint temp_price =  levelPrice[_level];

    //     // 将该nft及其对应的价格记录下来
    //     nftlevel[_tokenID] = _level;

    //     // 将该nft添加到lockset中
    //     lockNfts.push(_tokenID);

    //     emit Deposit(msg.sender,_tokenID);

    // }


    function deposit(uint _tokenID)public nonReentrant{

        elfNFT.transferFrom(msg.sender,address(this),_tokenID);

        // 将该nft添加到lockset中
        lockNfts.push(_tokenID);

        emit Deposit(msg.sender,_tokenID);

    }


    function unlock() public onlyOwner{
        uint len = lockNfts.length;

        for (uint index =0;index < len; index ++){
            unlockSet.add(lockNfts[index]);
        }

        // 将 lockNfts数组 清空
        delete lockNfts;
    }

        // 用户购买 nft

    function buy(uint _tokenID, string memory _level)public nonReentrant{

        require( unlockSet.contains(_tokenID), " NFT non-existent ");
        // require(levelPrice[nftlevel[_tokenID]] == _price, " Wrong price");

        // 将nft从unlockset中移除
        unlockSet.remove(_tokenID);

        // 转账
        IERC20(usdtAddress).transferFrom(msg.sender, nfKingsAddress, levelPrice[_level]);

        // 给用户转对应的nft
        elfNFT.safeTransferFrom(address(this), msg.sender, _tokenID);

        emit Buy(msg.sender,_tokenID,_level);
    }

    function withdrawAll()public{

    }

    // admin 提取nft
    function withdraw(uint [] memory _tokenIDs)public onlyNFKings nonReentrant {
        uint len = _tokenIDs.length;
        
        for (uint index = 0; index < len; index++){
            uint tokenid = _tokenIDs[index];
            elfNFT.transferFrom(msg.sender,nfKingsAddress,tokenid);
            // 需要将转移走的tokenid 从unlockset中移除，避免后端获取到脏数据
            unlockSet.remove(tokenid);
        }

        emit Withdraw(nfKingsAddress,_tokenIDs);

    }

    function test_addset(uint tokenid)public {
        unlockSet.add(tokenid);
    }


    function getUnlockNfts()public view returns(uint[] memory){
        return unlockSet.values();
    }

    // admin 调整级别 价格
    function setPrice(string memory _level, uint _price) public onlyOwner {
        levelPrice[_level] = _price;

        emit SetPrice(_level,_price);
    }

    // 变更 NFKingsAddress 地址,只能由市场管理员有权限设置
    function setNFKingsAddress(address _nfKingsAddress) public onlyOwner {
        require(_nfKingsAddress != address(0),"Invalid address");
        nfKingsAddress = _nfKingsAddress;

        emit SetNFKingsAddress(_nfKingsAddress);
    }


}