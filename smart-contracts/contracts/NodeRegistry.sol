// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title NodeRegistry
 * @dev Registry for VPN node operators to register and manage their nodes
 */
contract NodeRegistry {
    struct Node {
        uint256 id;
        address operator;
        string name;
        string region;
        uint256 pricePerGB; // Price in wei per GB
        uint256 advertisedBandwidth; // Mbps
        string endpoint; // IP:PORT
        bool active;
        bytes publicKey; // WireGuard public key
        uint256 registeredAt;
        uint256 totalSessions;
        uint256 totalDataServed; // in bytes
    }

    uint256 private nextNodeId = 1;
    mapping(uint256 => Node) public nodes;
    mapping(address => uint256[]) public operatorNodes;
    uint256[] public activeNodeIds;

    event NodeRegistered(
        uint256 indexed nodeId,
        address indexed operator,
        string name,
        string region,
        uint256 pricePerGB
    );
    
    event NodeUpdated(
        uint256 indexed nodeId,
        uint256 pricePerGB,
        string endpoint
    );
    
    event NodeDeactivated(uint256 indexed nodeId);
    event NodeActivated(uint256 indexed nodeId);

    modifier onlyNodeOperator(uint256 nodeId) {
        require(nodes[nodeId].operator == msg.sender, "Not node operator");
        _;
    }

    modifier nodeExists(uint256 nodeId) {
        require(nodes[nodeId].id != 0, "Node does not exist");
        _;
    }

    /**
     * @dev Register a new VPN node
     */
    function registerNode(
        string calldata name,
        string calldata region,
        uint256 pricePerGB,
        uint256 advertisedBandwidth,
        string calldata endpoint,
        bytes calldata publicKey
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(region).length > 0, "Region required");
        require(pricePerGB > 0, "Price must be greater than 0");
        require(bytes(endpoint).length > 0, "Endpoint required");
        require(publicKey.length > 0, "Public key required");

        uint256 nodeId = nextNodeId++;

        nodes[nodeId] = Node({
            id: nodeId,
            operator: msg.sender,
            name: name,
            region: region,
            pricePerGB: pricePerGB,
            advertisedBandwidth: advertisedBandwidth,
            endpoint: endpoint,
            active: true,
            publicKey: publicKey,
            registeredAt: block.timestamp,
            totalSessions: 0,
            totalDataServed: 0
        });

        operatorNodes[msg.sender].push(nodeId);
        activeNodeIds.push(nodeId);

        emit NodeRegistered(nodeId, msg.sender, name, region, pricePerGB);

        return nodeId;
    }

    /**
     * @dev Update node pricing and endpoint
     */
    function updateNode(
        uint256 nodeId,
        uint256 newPricePerGB,
        string calldata newEndpoint
    ) external onlyNodeOperator(nodeId) nodeExists(nodeId) {
        require(newPricePerGB > 0, "Price must be greater than 0");
        
        nodes[nodeId].pricePerGB = newPricePerGB;
        if (bytes(newEndpoint).length > 0) {
            nodes[nodeId].endpoint = newEndpoint;
        }

        emit NodeUpdated(nodeId, newPricePerGB, newEndpoint);
    }

    /**
     * @dev Deactivate a node
     */
    function deactivateNode(uint256 nodeId) 
        external 
        onlyNodeOperator(nodeId) 
        nodeExists(nodeId) 
    {
        require(nodes[nodeId].active, "Node already inactive");
        nodes[nodeId].active = false;
        emit NodeDeactivated(nodeId);
    }

    /**
     * @dev Reactivate a node
     */
    function activateNode(uint256 nodeId) 
        external 
        onlyNodeOperator(nodeId) 
        nodeExists(nodeId) 
    {
        require(!nodes[nodeId].active, "Node already active");
        nodes[nodeId].active = true;
        emit NodeActivated(nodeId);
    }

    /**
     * @dev Increment session stats (called by EscrowPayment contract)
     */
    function incrementNodeStats(uint256 nodeId, uint256 dataUsed) external {
        // TODO: Add access control - only EscrowPayment contract should call this
        require(nodes[nodeId].id != 0, "Node does not exist");
        nodes[nodeId].totalSessions++;
        nodes[nodeId].totalDataServed += dataUsed;
    }

    /**
     * @dev Get node details
     */
    function getNode(uint256 nodeId) 
        external 
        view 
        nodeExists(nodeId) 
        returns (Node memory) 
    {
        return nodes[nodeId];
    }

    /**
     * @dev Get all active nodes
     */
    function getActiveNodes() external view returns (Node[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < activeNodeIds.length; i++) {
            if (nodes[activeNodeIds[i]].active) {
                activeCount++;
            }
        }

        Node[] memory activeNodes = new Node[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < activeNodeIds.length; i++) {
            if (nodes[activeNodeIds[i]].active) {
                activeNodes[index] = nodes[activeNodeIds[i]];
                index++;
            }
        }

        return activeNodes;
    }

    /**
     * @dev Get nodes by operator
     */
    function getOperatorNodes(address operator) 
        external 
        view 
        returns (Node[] memory) 
    {
        uint256[] memory nodeIds = operatorNodes[operator];
        Node[] memory operatorNodesList = new Node[](nodeIds.length);
        
        for (uint256 i = 0; i < nodeIds.length; i++) {
            operatorNodesList[i] = nodes[nodeIds[i]];
        }
        
        return operatorNodesList;
    }

    /**
     * @dev Get total number of registered nodes
     */
    function getTotalNodes() external view returns (uint256) {
        return nextNodeId - 1;
    }
}
