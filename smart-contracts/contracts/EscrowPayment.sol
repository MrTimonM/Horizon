// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./NodeRegistry.sol";

/**
 * @title EscrowPayment
 * @dev Handles escrow deposits, session management, and payouts for VPN services
 */
contract EscrowPayment {
    NodeRegistry public nodeRegistry;

    struct Session {
        uint256 sessionId;
        uint256 nodeId;
        address user;
        address nodeOperator;
        uint256 depositAmount;
        uint256 maxDataGB; // Maximum data in GB user paid for
        uint256 durationSeconds; // How long the session is valid
        uint256 pricePerGB;
        uint256 createdAt;
        uint256 expiresAt;
        uint256 dataUsedBytes;
        SessionStatus status;
        bool payoutClaimed;
    }

    enum SessionStatus {
        Active,
        Completed,
        Expired,
        Refunded
    }

    uint256 private nextSessionId = 1;
    mapping(uint256 => Session) public sessions;
    mapping(address => uint256[]) public userSessions;
    mapping(address => uint256[]) public operatorSessions;

    // Platform fee (1% = 100 basis points)
    uint256 public platformFeeBasisPoints = 100;
    address public platformFeeRecipient;
    uint256 public collectedFees;

    event SessionCreated(
        uint256 indexed sessionId,
        uint256 indexed nodeId,
        address indexed user,
        uint256 depositAmount,
        uint256 maxDataGB,
        uint256 durationSeconds,
        uint256 expiresAt
    );

    event SessionCompleted(
        uint256 indexed sessionId,
        uint256 dataUsedBytes,
        uint256 payoutAmount,
        uint256 refundAmount
    );

    event PayoutClaimed(
        uint256 indexed sessionId,
        address indexed operator,
        uint256 amount
    );

    event SessionRefunded(
        uint256 indexed sessionId,
        address indexed user,
        uint256 amount
    );

    constructor(address _nodeRegistry) {
        nodeRegistry = NodeRegistry(_nodeRegistry);
        platformFeeRecipient = msg.sender;
    }

    modifier sessionExists(uint256 sessionId) {
        require(sessions[sessionId].sessionId != 0, "Session does not exist");
        _;
    }

    modifier onlySessionUser(uint256 sessionId) {
        require(sessions[sessionId].user == msg.sender, "Not session user");
        _;
    }

    modifier onlyNodeOperator(uint256 sessionId) {
        require(
            sessions[sessionId].nodeOperator == msg.sender,
            "Not node operator"
        );
        _;
    }

    /**
     * @dev Create a new session with escrow deposit
     * User specifies how much data they want to buy and for how long
     */
    function createSession(
        uint256 nodeId,
        uint256 maxDataGB,
        uint256 durationSeconds
    ) external payable returns (uint256) {
        // Get node details from registry
        NodeRegistry.Node memory node = nodeRegistry.getNode(nodeId);
        require(node.active, "Node is not active");
        require(maxDataGB > 0, "Data amount must be greater than 0");
        require(durationSeconds > 0, "Duration must be greater than 0");

        // Calculate required deposit
        uint256 requiredDeposit = (node.pricePerGB * maxDataGB);
        require(msg.value >= requiredDeposit, "Insufficient deposit");

        uint256 sessionId = nextSessionId++;
        uint256 expiresAt = block.timestamp + durationSeconds;

        sessions[sessionId] = Session({
            sessionId: sessionId,
            nodeId: nodeId,
            user: msg.sender,
            nodeOperator: node.operator,
            depositAmount: msg.value,
            maxDataGB: maxDataGB,
            durationSeconds: durationSeconds,
            pricePerGB: node.pricePerGB,
            createdAt: block.timestamp,
            expiresAt: expiresAt,
            dataUsedBytes: 0,
            status: SessionStatus.Active,
            payoutClaimed: false
        });

        userSessions[msg.sender].push(sessionId);
        operatorSessions[node.operator].push(sessionId);

        emit SessionCreated(
            sessionId,
            nodeId,
            msg.sender,
            msg.value,
            maxDataGB,
            durationSeconds,
            expiresAt
        );

        return sessionId;
    }

    /**
     * @dev Claim payout after session completion
     * Node operator submits data usage and claims payment
     */
    function claimPayout(uint256 sessionId, uint256 dataUsedBytes)
        external
        onlyNodeOperator(sessionId)
        sessionExists(sessionId)
    {
        Session storage session = sessions[sessionId];
        require(
            session.status == SessionStatus.Active,
            "Session not active"
        );
        require(!session.payoutClaimed, "Payout already claimed");

        // Mark session as completed
        session.status = SessionStatus.Completed;
        session.dataUsedBytes = dataUsedBytes;
        session.payoutClaimed = true;

        // Calculate payout based on actual usage
        uint256 maxPayment = session.depositAmount;
        uint256 dataUsedGB = dataUsedBytes / (1024 * 1024 * 1024); // Convert bytes to GB
        
        // If partial GB used, round up
        if (dataUsedBytes % (1024 * 1024 * 1024) > 0) {
            dataUsedGB += 1;
        }

        // Cap at maximum data purchased
        if (dataUsedGB > session.maxDataGB) {
            dataUsedGB = session.maxDataGB;
        }

        uint256 totalPayout = session.pricePerGB * dataUsedGB;
        if (totalPayout > maxPayment) {
            totalPayout = maxPayment;
        }

        // Calculate platform fee
        uint256 platformFee = (totalPayout * platformFeeBasisPoints) / 10000;
        uint256 operatorPayout = totalPayout - platformFee;
        uint256 refundAmount = session.depositAmount - totalPayout;

        // Update collected fees
        collectedFees += platformFee;

        // Transfer payout to operator
        if (operatorPayout > 0) {
            (bool successOperator, ) = session.nodeOperator.call{
                value: operatorPayout
            }("");
            require(successOperator, "Operator payout failed");
            emit PayoutClaimed(sessionId, session.nodeOperator, operatorPayout);
        }

        // Refund unused deposit to user
        if (refundAmount > 0) {
            (bool successUser, ) = session.user.call{value: refundAmount}("");
            require(successUser, "User refund failed");
        }

        // Update node stats in registry
        nodeRegistry.incrementNodeStats(session.nodeId, dataUsedBytes);

        emit SessionCompleted(
            sessionId,
            dataUsedBytes,
            operatorPayout,
            refundAmount
        );
    }

    /**
     * @dev Refund user if session expired without service
     */
    function refundExpiredSession(uint256 sessionId)
        external
        sessionExists(sessionId)
    {
        Session storage session = sessions[sessionId];
        require(
            block.timestamp > session.expiresAt,
            "Session not expired yet"
        );
        require(
            session.status == SessionStatus.Active,
            "Session not active"
        );
        require(!session.payoutClaimed, "Payout already claimed");
        require(
            msg.sender == session.user || msg.sender == platformFeeRecipient,
            "Not authorized"
        );

        session.status = SessionStatus.Expired;
        uint256 refundAmount = session.depositAmount;

        // Refund full deposit to user
        (bool success, ) = session.user.call{value: refundAmount}("");
        require(success, "Refund failed");

        emit SessionRefunded(sessionId, session.user, refundAmount);
    }

    /**
     * @dev Get session details
     */
    function getSession(uint256 sessionId)
        external
        view
        sessionExists(sessionId)
        returns (Session memory)
    {
        return sessions[sessionId];
    }

    /**
     * @dev Get user's sessions
     */
    function getUserSessions(address user)
        external
        view
        returns (Session[] memory)
    {
        uint256[] memory sessionIds = userSessions[user];
        Session[] memory userSessionsList = new Session[](sessionIds.length);

        for (uint256 i = 0; i < sessionIds.length; i++) {
            userSessionsList[i] = sessions[sessionIds[i]];
        }

        return userSessionsList;
    }

    /**
     * @dev Get operator's sessions
     */
    function getOperatorSessions(address operator)
        external
        view
        returns (Session[] memory)
    {
        uint256[] memory sessionIds = operatorSessions[operator];
        Session[] memory operatorSessionsList = new Session[](
            sessionIds.length
        );

        for (uint256 i = 0; i < sessionIds.length; i++) {
            operatorSessionsList[i] = sessions[sessionIds[i]];
        }

        return operatorSessionsList;
    }

    /**
     * @dev Withdraw collected platform fees
     */
    function withdrawPlatformFees() external {
        require(
            msg.sender == platformFeeRecipient,
            "Not platform fee recipient"
        );
        uint256 amount = collectedFees;
        collectedFees = 0;

        (bool success, ) = platformFeeRecipient.call{value: amount}("");
        require(success, "Fee withdrawal failed");
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function setPlatformFee(uint256 newFeeBasisPoints) external {
        require(
            msg.sender == platformFeeRecipient,
            "Not platform fee recipient"
        );
        require(newFeeBasisPoints <= 1000, "Fee too high"); // Max 10%
        platformFeeBasisPoints = newFeeBasisPoints;
    }

    /**
     * @dev Check if session is active and not expired
     */
    function isSessionActive(uint256 sessionId)
        external
        view
        sessionExists(sessionId)
        returns (bool)
    {
        Session memory session = sessions[sessionId];
        return
            session.status == SessionStatus.Active &&
            block.timestamp <= session.expiresAt;
    }

    /**
     * @dev Get remaining data and time for active session
     */
    function getSessionRemaining(uint256 sessionId)
        external
        view
        sessionExists(sessionId)
        returns (uint256 remainingDataGB, uint256 remainingTimeSeconds)
    {
        Session memory session = sessions[sessionId];
        
        uint256 dataUsedGB = session.dataUsedBytes / (1024 * 1024 * 1024);
        remainingDataGB = session.maxDataGB > dataUsedGB 
            ? session.maxDataGB - dataUsedGB 
            : 0;

        if (block.timestamp < session.expiresAt) {
            remainingTimeSeconds = session.expiresAt - block.timestamp;
        } else {
            remainingTimeSeconds = 0;
        }

        return (remainingDataGB, remainingTimeSeconds);
    }

    receive() external payable {}
}
