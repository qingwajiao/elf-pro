//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0; 

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ElfNFT is ERC721Enumerable{
    using Strings for uint256;

    string private baseURI;
    constructor(string memory baseURI_,string memory name_, string memory symbol_)ERC721(name_,symbol_) {
         baseURI = string(abi.encodePacked(baseURI_, symbol_, "/"));
    }


    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }


    /**
     * override tokenURI(uint256), remove restrict for tokenId exist.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        virtual
        returns (string memory)
    {
        return string(abi.encodePacked(baseURI, tokenId.toString()));
    }
    

}