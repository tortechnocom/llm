// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RevenueSharing
 * @dev Manages revenue distribution between agent creators and platform
 * When users pay for AI agent usage, this contract automatically splits:
 * - Agent creator gets their share
 * - Platform gets platform fee
 */
contract RevenueSharing is Ownable, ReentrancyGuard {
    IERC20 public platformToken;
    
    // Platform fee percentage (in basis points, 100 = 1%)
    uint256 public platformFeePercent = 1000; // 10% default
    uint256 public constant MAX_PLATFORM_FEE = 3000; // 30% max
    uint256 public constant BASIS_POINTS = 10000;
    
    // Platform treasury address
    address public treasury;
    
    // Agent creator earnings tracking
    mapping(address => uint256) public creatorEarnings;
    mapping(address => uint256) public creatorWithdrawn;
    
    // Total platform revenue
    uint256 public totalPlatformRevenue;
    uint256 public totalCreatorRevenue;
    
    // Events
    event PaymentProcessed(
        address indexed user,
        address indexed creator,
        uint256 totalAmount,
        uint256 creatorShare,
        uint256 platformShare
    );
    event CreatorWithdrawal(address indexed creator, uint256 amount);
    event PlatformFeeUpdated(uint256 newFee);
    event TreasuryUpdated(address newTreasury);

    constructor(address _platformToken, address _treasury) Ownable(msg.sender) {
        require(_platformToken != address(0), "Invalid token address");
        require(_treasury != address(0), "Invalid treasury address");
        
        platformToken = IERC20(_platformToken);
        treasury = _treasury;
    }

    /**
     * @dev Process payment for agent usage
     * @param creator Address of the agent creator
     * @param amount Total amount to be split
     */
    function processPayment(address creator, uint256 amount) external nonReentrant {
        require(creator != address(0), "Invalid creator address");
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from user to this contract
        require(
            platformToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        // Calculate shares
        uint256 platformShare = (amount * platformFeePercent) / BASIS_POINTS;
        uint256 creatorShare = amount - platformShare;
        
        // Update balances
        creatorEarnings[creator] += creatorShare;
        totalCreatorRevenue += creatorShare;
        totalPlatformRevenue += platformShare;
        
        // Transfer platform share to treasury
        require(
            platformToken.transfer(treasury, platformShare),
            "Platform transfer failed"
        );
        
        emit PaymentProcessed(msg.sender, creator, amount, creatorShare, platformShare);
    }

    /**
     * @dev Allow creators to withdraw their earnings
     */
    function withdrawEarnings() external nonReentrant {
        uint256 available = creatorEarnings[msg.sender] - creatorWithdrawn[msg.sender];
        require(available > 0, "No earnings to withdraw");
        
        creatorWithdrawn[msg.sender] += available;
        
        require(
            platformToken.transfer(msg.sender, available),
            "Withdrawal failed"
        );
        
        emit CreatorWithdrawal(msg.sender, available);
    }

    /**
     * @dev Get available earnings for a creator
     */
    function getAvailableEarnings(address creator) external view returns (uint256) {
        return creatorEarnings[creator] - creatorWithdrawn[creator];
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_PLATFORM_FEE, "Fee too high");
        platformFeePercent = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    /**
     * @dev Update treasury address (only owner)
     */
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }
}
