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



合约主要接口简介：

    用户权限：
        1.用户质押：deposit( DepositInfo[] )
            参数说明：    
                        struct DepositInfo {
                            uint tokenid; // 用户质押的tokenid
                            string pid;   // 质押的比赛场次
                        }
            例子：deposit([[888,"4-1"],[666,"4-2"].....])  888 是用户质押的tokenid，“4-1”是质押的比赛场次，

        2.用户购买：purchase(_tokenID, _level, _id,   _signature)
            参数说明：_tokenID  用户购买的tokenid
                    _level    nft的级别
                    _id       签名用户id（序号）
                    _signature 签名信息

        3.查询可以在市场上售卖的nfs：getUnlockNfts()

        4.获取用户拥有的nft：getUserNftList()



    ElfMarket市场管理员权限：
        1. 调整级别对应的价格：setPrice(string  _level, uint _price)
            参数说明：_level nft的级别
                    _price  级别对应的价格

        2. 设置后端签名地址：setBackendSigner(address _backendSigner)
            参数说明：后端账户的地址

        3. 释放指定比赛场次的fnt：unlock(string   _pid)
            参数说明:需要释放的比赛场次

        4. 将市场中的nft提走：withdrawNFT(uint  _tokenIDs, address _to)
            参数说明:_tokenIDs  需要提取的nft tokenid数组
                    _to        将nft提到哪个地址

        5.项目方把自己账户的nft放到市场售卖：putNft(address _nfkingAddress)
            参数说明:_nfkingAddress 将该地址的nft放到市场售卖

            注意：此方法对所有人开放，但是普通用户慎用，以为调用此方法将被视为 无偿给ElfMarket捐献nft

        


    相关合约测试地址：
        ELFMARKET: 0x92ba15D3f1d50E1752FA97ff8B7c88a38CCcdF92
        BUSD : 0x63E085DA18CE355A45F70470b51B66A9F8FFF600
        BNFT : 0xB972BA3080266a87dF52ea80f10357F9FC3343Cd  
            tokenid:219200001353  level: Barcelona Dragons R 
            tokenid:219200000466  level: Hamburg Sea Devils R
            tokenid:219200001219  level: Vienna Vikings SR
            tokenid:219200000565  level: Leipzig Kings N
            tokenid:219200000092  level: Leipzig Kings N

        ELFMARKET合约相关的默认参数：
            elfCFO：0x2b83877aCE845279f59919aeb912946C8b5Abe26
            backendSigner：0x2b83877aCE845279f59919aeb912946C8b5Abe26
            busdAddress：0x63E085DA18CE355A45F70470b51B66A9F8FFF600
            elfNFTContractAddress:0xB972BA3080266a87dF52ea80f10357F9FC3343Cd

            级别及对应的价格：
                evelPrice["SR"] = 200000000000000000000;
                levelPrice["R"] = 60000000000000000000;
                levelPrice["N"] = 25000000000000000000;

                levelPrice["NFKSR"] = 180000000000000000000;
                levelPrice["NFKR"] = 54000000000000000000;
                levelPrice["NFKN"] = 22500000000000000000;
            




