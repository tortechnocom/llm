// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LLMPlatformToken
 * @dev ERC20 token for the LLM Platform with burning capability
 * This token is used for:
 * - Paying for AI agent usage
 * - Revenue sharing with agent creators
 * - Platform fees
 */
contract LLMPlatformToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10**18; // 10 billion tokens max
    
    // Minting control
    uint256 public totalMinted;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor() ERC20("LLM Platform Token", "LLMP") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
        totalMinted = INITIAL_SUPPLY;
    }

    /**
     * @dev Mint new tokens (only owner can mint)
     * @param to Address to receive the tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalMinted + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
        totalMinted += amount;
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Override burn to emit custom event
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Override burnFrom to emit custom event
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }
}
