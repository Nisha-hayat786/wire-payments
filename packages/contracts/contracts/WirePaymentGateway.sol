// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";



/**
 * @title WirePaymentGateway
 * @dev A secure, minimal payment gateway for the Wirefluid EVM network.
 * Handles payment processing and emits events for indexing.
 */
contract WirePaymentGateway is Ownable, ReentrancyGuard, Pausable {
    
    // Metadata for branding (Logo, Name, Description)
    string private _contractURI;

    constructor(string memory initialContractURI) Ownable(msg.sender) {
        _contractURI = initialContractURI;
    }


    
    // Events
    event PaymentCompleted(
        string indexed invoiceId,
        address indexed payer,
        address indexed merchant,
        uint256 amount,
        uint256 timestamp
    );

    event MerchantRegistered(address indexed merchant, string name);
    event FundsWithdrawn(address indexed merchant, uint256 amount);

    // Mappings
    mapping(address => uint256) public balances;
    mapping(string => bool) public processedInvoices;

    /**
     * @dev Pay an invoice in native WIRE tokens.
     * @param invoiceId The unique ID of the invoice.
     * @param merchant The recipient of the funds.
     */
    function payInvoice(string calldata invoiceId, address merchant) 
        external 
        payable 
        whenNotPaused 
        nonReentrant 
    {

        require(msg.value > 0, "Amount must be greater than 0");
        require(!processedInvoices[invoiceId], "Invoice already paid");
        require(merchant != address(0), "Invalid merchant address");

        // Record payment
        processedInvoices[invoiceId] = true;
        balances[merchant] += msg.value;

        emit PaymentCompleted(invoiceId, msg.sender, merchant, msg.value, block.timestamp);
    }

    /**
     * @dev Withdraw earned funds for a merchant.
     */
    function withdrawFunds() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds to withdraw");

        balances[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Emergency withdraw (owner only).
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Branding: Returns the metadata URI for the contract (logo, etc).
     */
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    /**
     * @dev Update the contract metadata URI (Admin only).
     */
    function setContractURI(string calldata newURI) external onlyOwner {
        _contractURI = newURI;
    }

    /**
     * @dev Emergency Pause (Admin only).
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Resume payments (Admin only).
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    
    // Function to receive ether
    receive() external payable {}
}
