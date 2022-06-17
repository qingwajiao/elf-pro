//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0; 

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ElfERC20 is ERC20("elferc20","elf"){

    // constructor(string memory name_, string memory symbol_)ERC20(name_, symbol_) {
    // }


    function mint(address _to, uint256 _amount)public {
        _mint(_to, _amount);
    }
}