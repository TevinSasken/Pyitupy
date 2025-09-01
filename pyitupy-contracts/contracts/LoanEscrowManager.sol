// contracts/LoanEscrowManager.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LoanEscrowManager is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    enum LoanStatus { Pending, Active, Repaid, Defaulted, Cancelled }

    struct Loan {
        uint256 id;
        address lender;
        string lenderUserId;
        address borrower;
        string borrowerUserId;
        uint256 principal;
        uint256 repaymentAmount;
        uint256 startTimestamp;
        uint256 dueTimestamp;
        LoanStatus status;
    }

    IERC20 public immutable token; // ERC20 token used for loans (e.g. USDT)
    uint256 public feeBps = 150;   // 1.5% fee -> 150 basis points
    uint256 public nextLoanId = 1;

    mapping(uint256 => Loan) public loans;

    event LoanCreated(uint256 indexed loanId, address indexed lender, address indexed borrower, uint256 principal, uint256 repaymentAmount);
    event LoanActivated(uint256 indexed loanId, address indexed lender, address indexed borrower, uint256 principal, uint256 startTimestamp, uint256 dueTimestamp);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amountPaid);
    event LoanDefaulted(uint256 indexed loanId);
    event LoanCancelled(uint256 indexed loanId);
    event FeesWithdrawn(address indexed to, uint256 amount);

    constructor(address _token) {
        require(_token != address(0), "Token 0 addr");
        token = IERC20(_token);
    }

    function createLoan(
        address _lender,
        string calldata _lenderUserId,
        address _borrower,
        string calldata _borrowerUserId,
        uint256 _principal,
        uint256 _repaymentAmount,
        uint256 _durationSeconds
    ) external onlyOwner returns (uint256) {
        require(_lender != address(0) && _borrower != address(0), "zero addr");
        require(_principal > 0, "principal>0");
        require(_repaymentAmount >= _principal, "repay >= principal");
        require(_durationSeconds > 0, "duration>0");

        uint256 loanId = nextLoanId++;
        loans[loanId] = Loan({
            id: loanId,
            lender: _lender,
            lenderUserId: _lenderUserId,
            borrower: _borrower,
            borrowerUserId: _borrowerUserId,
            principal: _principal,
            repaymentAmount: _repaymentAmount,
            startTimestamp: 0,
            dueTimestamp: 0,
            status: LoanStatus.Pending
        });

        emit LoanCreated(loanId, _lender, _borrower, _principal, _repaymentAmount);
        return loanId;
    }

    /// Activate loan by transferring tokens from escrow account (escrowFrom must have approved this contract)
    function activateLoanWithTransferFrom(uint256 loanId, address escrowFrom, uint256 durationSeconds) external onlyOwner nonReentrant {
        Loan storage ln = loans[loanId];
        require(ln.id == loanId, "loan not exist");
        require(ln.status == LoanStatus.Pending, "loan not pending");
        require(escrowFrom != address(0), "escrowFrom 0");
        require(durationSeconds > 0, "duration>0");

        uint256 principal = ln.principal;
        // Pull the principal from the escrowFrom into this contract
        token.safeTransferFrom(escrowFrom, address(this), principal);

        // compute fee and net to borrower
        uint256 fee = (principal * feeBps) / 10000;
        uint256 netToBorrower = principal - fee;

        // disburse net amount to borrower
        token.safeTransfer(ln.borrower, netToBorrower);

        // mark loan active and set timestamps
        ln.startTimestamp = block.timestamp;
        ln.dueTimestamp = block.timestamp + durationSeconds;
        ln.status = LoanStatus.Active;

        emit LoanActivated(loanId, ln.lender, ln.borrower, principal, ln.startTimestamp, ln.dueTimestamp);
    }

    /// Borrower repays loan: borrower must approve this contract then call repayLoan
    function repayLoan(uint256 loanId) external nonReentrant {
        Loan storage ln = loans[loanId];
        require(ln.id == loanId, "loan not exist");
        require(ln.status == LoanStatus.Active, "loan not active");
        require(msg.sender == ln.borrower, "only borrower");
        uint256 repayAmount = ln.repaymentAmount;
        require(repayAmount > 0, "no repay amount");

        // pull repayment tokens from borrower into contract
        token.safeTransferFrom(msg.sender, address(this), repayAmount);

        // compute fee and net to lender
        uint256 fee = (repayAmount * feeBps) / 10000;
        uint256 netToLender = repayAmount - fee;

        // send net to lender
        token.safeTransfer(ln.lender, netToLender);

        // mark repaid
        ln.status = LoanStatus.Repaid;

        emit LoanRepaid(loanId, msg.sender, repayAmount);
    }

    function markDefault(uint256 loanId) external onlyOwner {
        Loan storage ln = loans[loanId];
        require(ln.id == loanId, "loan not exist");
        require(ln.status == LoanStatus.Active, "not active");
        require(block.timestamp > ln.dueTimestamp, "not due yet");

        ln.status = LoanStatus.Defaulted;
        emit LoanDefaulted(loanId);
    }

    function cancelLoan(uint256 loanId) external onlyOwner {
        Loan storage ln = loans[loanId];
        require(ln.id == loanId, "loan not exist");
        require(ln.status == LoanStatus.Pending, "not pending");

        ln.status = LoanStatus.Cancelled;
        emit LoanCancelled(loanId);
    }

    /// Owner withdraws accumulated fees (careful: consider reserved accounting in prod)
    function withdrawFees(address to) external onlyOwner nonReentrant {
        require(to != address(0), "to 0");
        uint256 bal = token.balanceOf(address(this));
        require(bal > 0, "no fees");
        token.safeTransfer(to, bal);
        emit FeesWithdrawn(to, bal);
    }

    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }

    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "fee too high");
        feeBps = _feeBps;
    }
}
