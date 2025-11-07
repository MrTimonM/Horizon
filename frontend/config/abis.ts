export const USER_REGISTRY_ABI = [
  "function registerUser(string memory _walletName, string memory _profilePictureIPFS) external",
  "function updateProfile(string memory _walletName, string memory _profilePictureIPFS) external",
  "function getUserProfile(address _user) external view returns (string walletName, string profilePictureIPFS, uint256 registeredAt, bool exists)",
  "function isUserRegistered(address _user) external view returns (bool)",
  "event UserRegistered(address indexed userAddress, string walletName, string profilePictureIPFS, uint256 timestamp)",
  "event ProfileUpdated(address indexed userAddress, string walletName, string profilePictureIPFS, uint256 timestamp)"
];

export const NODE_REGISTRY_ABI = [
  "function registerNode(string calldata name, string calldata region, uint256 pricePerGB, uint256 advertisedBandwidth, string calldata endpoint, bytes calldata publicKey) external returns (uint256)",
  "function updateNode(uint256 nodeId, uint256 newPricePerGB, string calldata newEndpoint) external",
  "function deactivateNode(uint256 nodeId) external",
  "function activateNode(uint256 nodeId) external",
  "function getNode(uint256 nodeId) external view returns (tuple(uint256 id, address operator, string name, string region, uint256 pricePerGB, uint256 advertisedBandwidth, string endpoint, bool active, bytes publicKey, uint256 registeredAt, uint256 totalSessions, uint256 totalDataServed))",
  "function getActiveNodes() external view returns (tuple(uint256 id, address operator, string name, string region, uint256 pricePerGB, uint256 advertisedBandwidth, string endpoint, bool active, bytes publicKey, uint256 registeredAt, uint256 totalSessions, uint256 totalDataServed)[])",
  "function getOperatorNodes(address operator) external view returns (tuple(uint256 id, address operator, string name, string region, uint256 pricePerGB, uint256 advertisedBandwidth, string endpoint, bool active, bytes publicKey, uint256 registeredAt, uint256 totalSessions, uint256 totalDataServed)[])",
  "event NodeRegistered(uint256 indexed nodeId, address indexed operator, string name, string region, uint256 pricePerGB)",
  "event NodeUpdated(uint256 indexed nodeId, uint256 pricePerGB, string endpoint)",
  "event NodeDeactivated(uint256 indexed nodeId)",
  "event NodeActivated(uint256 indexed nodeId)"
];

export const ESCROW_PAYMENT_ABI = [
  "function createSession(uint256 nodeId, uint256 maxDataGB, uint256 durationSeconds) external payable returns (uint256)",
  "function claimPayout(uint256 sessionId, uint256 dataUsedBytes) external",
  "function sessions(uint256) external view returns (uint256 sessionId, uint256 nodeId, address user, address nodeOperator, uint256 depositAmount, uint256 maxDataGB, uint256 durationSeconds, uint256 pricePerGB, uint256 createdAt, uint256 expiresAt, uint256 dataUsedBytes, uint8 status, bool payoutClaimed)",
  "function userSessions(address, uint256) external view returns (uint256)",
  "function operatorSessions(address, uint256) external view returns (uint256)",
  "event SessionCreated(uint256 indexed sessionId, uint256 indexed nodeId, address indexed user, uint256 depositAmount, uint256 maxDataGB, uint256 durationSeconds, uint256 expiresAt)",
  "event SessionCompleted(uint256 indexed sessionId, uint256 dataUsedBytes, uint256 payoutAmount, uint256 refundAmount)",
  "event PayoutClaimed(uint256 indexed sessionId, address indexed operator, uint256 amount)"
];
