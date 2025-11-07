// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title UserRegistry
 * @notice Manages user profiles with wallet names and optional profile pictures
 * @dev Profile pictures are stored on IPFS via Pinata
 */
contract UserRegistry {
    struct UserProfile {
        string walletName;
        string profilePictureIPFS; // IPFS hash (empty string if no picture)
        uint256 registeredAt;
        bool exists;
    }

    // Mapping from wallet address to user profile
    mapping(address => UserProfile) public profiles;
    
    // Array to keep track of all registered users
    address[] public registeredUsers;

    // Events
    event UserRegistered(
        address indexed userAddress,
        string walletName,
        string profilePictureIPFS,
        uint256 timestamp
    );

    event ProfileUpdated(
        address indexed userAddress,
        string walletName,
        string profilePictureIPFS,
        uint256 timestamp
    );

    /**
     * @notice Register a new user profile
     * @param _walletName Display name for the wallet (e.g., "Alice")
     * @param _profilePictureIPFS IPFS hash of profile picture (empty string if none)
     */
    function registerUser(
        string memory _walletName,
        string memory _profilePictureIPFS
    ) external {
        require(!profiles[msg.sender].exists, "User already registered");
        require(bytes(_walletName).length > 0, "Wallet name cannot be empty");
        require(bytes(_walletName).length <= 50, "Wallet name too long");

        profiles[msg.sender] = UserProfile({
            walletName: _walletName,
            profilePictureIPFS: _profilePictureIPFS,
            registeredAt: block.timestamp,
            exists: true
        });

        registeredUsers.push(msg.sender);

        emit UserRegistered(
            msg.sender,
            _walletName,
            _profilePictureIPFS,
            block.timestamp
        );
    }

    /**
     * @notice Update existing user profile
     * @param _walletName New display name
     * @param _profilePictureIPFS New IPFS hash (empty string to remove picture)
     */
    function updateProfile(
        string memory _walletName,
        string memory _profilePictureIPFS
    ) external {
        require(profiles[msg.sender].exists, "User not registered");
        require(bytes(_walletName).length > 0, "Wallet name cannot be empty");
        require(bytes(_walletName).length <= 50, "Wallet name too long");

        profiles[msg.sender].walletName = _walletName;
        profiles[msg.sender].profilePictureIPFS = _profilePictureIPFS;

        emit ProfileUpdated(
            msg.sender,
            _walletName,
            _profilePictureIPFS,
            block.timestamp
        );
    }

    /**
     * @notice Get user profile by address
     * @param _user Address of the user
     * @return walletName Display name
     * @return profilePictureIPFS IPFS hash of profile picture
     * @return registeredAt Registration timestamp
     * @return exists Whether user is registered
     */
    function getUserProfile(address _user)
        external
        view
        returns (
            string memory walletName,
            string memory profilePictureIPFS,
            uint256 registeredAt,
            bool exists
        )
    {
        UserProfile memory profile = profiles[_user];
        return (
            profile.walletName,
            profile.profilePictureIPFS,
            profile.registeredAt,
            profile.exists
        );
    }

    /**
     * @notice Check if user is registered
     * @param _user Address to check
     * @return True if user has registered
     */
    function isUserRegistered(address _user) external view returns (bool) {
        return profiles[_user].exists;
    }

    /**
     * @notice Get total number of registered users
     * @return Total count
     */
    function getTotalUsers() external view returns (uint256) {
        return registeredUsers.length;
    }

    /**
     * @notice Get registered user address by index
     * @param _index Index in the array
     * @return User address
     */
    function getUserByIndex(uint256 _index) external view returns (address) {
        require(_index < registeredUsers.length, "Index out of bounds");
        return registeredUsers[_index];
    }
}
