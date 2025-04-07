// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MoneyMarket {
    IERC20 public immutable token;
    uint public totalDeposits;
    uint public totalBorrowed;
    uint private constant COLLATERAL_RATIO = 150; // 150%
    uint private constant INTEREST_RATE = 10; // 10% annual

    struct Loan {
        uint amount;
        uint startTime;
    }

    mapping(address => uint) public deposits;
    mapping(address => uint) public collateral;
    mapping(address => Loan) public loans;

    event Deposited(address indexed user, uint amount);
    event Borrowed(address indexed user, uint amount);
    event Repaid(address indexed user, uint amount);
    event Liquidated(address indexed user, address liquidator);

    constructor(IERC20 _token) {
        token = _token;
    }

    // Deposit funds to lend
    function deposit(uint amount) external {
        token.transferFrom(msg.sender, address(this), amount);
        deposits[msg.sender] += amount;
        totalDeposits += amount;
        emit Deposited(msg.sender, amount);
    }

    // Borrow against collateral
    function borrow(uint amount) external {
        require(amount <= availableLiquidity(), "Insufficient liquidity");
        require(
            collateral[msg.sender] * collateralRatio() >= amount * 1e18,
            "Insufficient collateral"
        );

        loans[msg.sender] = Loan(amount, block.timestamp);
        totalBorrowed += amount;
        token.transfer(msg.sender, amount);
        emit Borrowed(msg.sender, amount);
    }

    // Repay loan with interest
    function repay() external {
        Loan memory loan = loans[msg.sender];
        require(loan.amount > 0, "No active loan");

        uint interest = calculateInterest(msg.sender);
        uint totalPayment = loan.amount + interest;

        token.transferFrom(msg.sender, address(this), totalPayment);
        totalBorrowed -= loan.amount;
        delete loans[msg.sender];
        emit Repaid(msg.sender, totalPayment);
    }

    // Liquidate undercollateralized positions
    function liquidate(address user) external {
        require(isUndercollateralized(user), "Position safe");
        
        Loan memory loan = loans[user];
        uint repayment = loan.amount + calculateInterest(user);
        
        token.transferFrom(msg.sender, address(this), repayment);
        payable(msg.sender).transfer(collateral[user]);
        
        totalBorrowed -= loan.amount;
        delete loans[user];
        delete collateral[user];
        emit Liquidated(user, msg.sender);
    }

    // Helper functions
    function availableLiquidity() public view returns (uint) {
        return totalDeposits - totalBorrowed;
    }

    function calculateInterest(address user) public view returns (uint) {
        Loan memory loan = loans[user];
        uint timeElapsed = block.timestamp - loan.startTime;
        return (loan.amount * INTEREST_RATE * timeElapsed) / 365 days / 100;
    }

    function isUndercollateralized(address user) public view returns (bool) {
        return collateral[user] * collateralRatio() < loans[user].amount * 1e18;
    }

    function collateralRatio() public pure returns (uint) {
        return COLLATERAL_RATIO;
    }

    // Add ETH as collateral
    receive() external payable {
        collateral[msg.sender] += msg.value;
    }
}
