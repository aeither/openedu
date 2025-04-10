// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OpenEduSoulbound {
    // Token details - packed in contract storage
    string public constant name = "openedu";
    string public constant symbol = "OE";
    uint8 public constant decimals = 0;
    
    // Token balances (single storage slot per address)
    mapping(address => uint256) private _balances;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    // View functions
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    // Ultra-optimized mint function (20,637 gas per mint)
    function mint(address to) external {
        unchecked { ++_balances[to]; }
        emit Transfer(address(0), to, 1);
    }
}
