# DeVPN Architecture Documentation

## System Overview

DeVPN is a decentralized VPN network that combines blockchain technology (Ethereum) with WireGuard VPN protocol to create a trustless marketplace for bandwidth sharing.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DEVPN ECOSYSTEM                             │
└─────────────────────────────────────────────────────────────────────┘

    [Users/Buyers]                                    [Providers/Sellers]
          │                                                   │
          │                                                   │
          ▼                                                   ▼
┌──────────────────────┐                          ┌──────────────────────┐
│   Web Frontend       │                          │   VPN Node (VPS)     │
│   ═══════════        │                          │   ═══════════        │
│                      │                          │                      │
│  • Marketplace UI    │                          │  • WireGuard Server  │
│  • Node Browser      │                          │  • HTTP API          │
│  • Session Purchase  │                          │  • Usage Tracking    │
│  • Dashboards        │                          │  • SQLite DB         │
│  • Wallet Connect    │                          │  • Auto Registration │
└──────────┬───────────┘                          └──────────┬───────────┘
           │                                                 │
           │  Web3/ethers.js                    Web3/ethers.js  │
           │                                                 │
           └───────────────────┬────────────────────────────┘
                               │
                               ▼
              ┌────────────────────────────────────┐
              │   Ethereum Sepolia Blockchain      │
              │   ═════════════════════════        │
              │                                    │
              │   ┌────────────────────────────┐   │
              │   │   NodeRegistry Contract    │   │
              │   │   ════════════════════     │   │
              │   │  • Node registration       │   │
              │   │  • Metadata storage        │   │
              │   │  • Operator management     │   │
              │   │  • Statistics tracking     │   │
              │   └────────────────────────────┘   │
              │                                    │
              │   ┌────────────────────────────┐   │
              │   │  EscrowPayment Contract    │   │
              │   │  ══════════════════════    │   │
              │   │  • Session creation        │   │
              │   │  • Deposit handling        │   │
              │   │  • Payout distribution     │   │
              │   │  • Usage verification      │   │
              │   └────────────────────────────┘   │
              │                                    │
              └────────────────────────────────────┘
```

## Component Details

### 1. Smart Contracts Layer

#### NodeRegistry Contract

**Purpose**: Manages VPN node registration and metadata

**Key Functions**:
```solidity
function registerNode(
    string name,
    string region,
    uint256 pricePerGB,
    uint256 advertisedBandwidth,
    string endpoint,
    bytes publicKey
) returns (uint256 nodeId)
```

**Data Structures**:
```solidity
struct Node {
    uint256 id;
    address operator;
    string name;
    string region;
    uint256 pricePerGB;
    uint256 advertisedBandwidth;
    string endpoint;
    bool active;
    bytes publicKey;
    uint256 registeredAt;
    uint256 totalSessions;
    uint256 totalDataServed;
}
```

**Features**:
- Permissionless node registration
- Operator-only updates and deactivation
- Public read access for marketplace
- Statistics tracking per node

#### EscrowPayment Contract

**Purpose**: Handles payment escrow, session management, and payouts

**Key Functions**:
```solidity
function createSession(
    uint256 nodeId,
    uint256 maxDataGB,
    uint256 durationSeconds
) payable returns (uint256 sessionId)

function claimPayout(
    uint256 sessionId,
    uint256 dataUsedBytes
)

function refundExpiredSession(uint256 sessionId)
```

**Data Structures**:
```solidity
struct Session {
    uint256 sessionId;
    uint256 nodeId;
    address user;
    address nodeOperator;
    uint256 depositAmount;
    uint256 maxDataGB;
    uint256 durationSeconds;
    uint256 pricePerGB;
    uint256 createdAt;
    uint256 expiresAt;
    uint256 dataUsedBytes;
    SessionStatus status;
    bool payoutClaimed;
}
```

**Payment Flow**:
1. User creates session with deposit
2. Deposit held in escrow
3. Node tracks usage
4. Operator claims payout with usage proof
5. Unused funds refunded to user

**Fee Structure**:
- Platform fee: 1% of total payout
- Remaining 99% goes to node operator

### 2. VPN Node Layer

#### Architecture

```
┌────────────────────────────────────────────────────┐
│            VPN Node Container (Docker)              │
│                                                     │
│  ┌──────────────┐         ┌──────────────────┐     │
│  │  WireGuard   │         │   HTTP API       │     │
│  │  Interface   │◄────────│   (Node.js)      │     │
│  │  (wg0)       │         │                  │     │
│  │              │         │  • /register     │     │
│  │  Port: 51820 │         │  • /session/*    │     │
│  │  Protocol:UDP│         │  • /metrics      │     │
│  └──────┬───────┘         └─────────┬────────┘     │
│         │                           │              │
│         │                           │              │
│         ▼                           ▼              │
│  ┌──────────────────────────────────────────┐     │
│  │         Session Manager & Database        │     │
│  │         ═══════════════════════════       │     │
│  │                                           │     │
│  │  • Track active sessions                  │     │
│  │  • Monitor bandwidth usage                │     │
│  │  • Store usage logs (SQLite)              │     │
│  │  • Calculate data transferred             │     │
│  └──────────────────┬────────────────────────┘     │
│                     │                              │
│                     ▼                              │
│  ┌──────────────────────────────────────────┐     │
│  │         Blockchain Service                │     │
│  │         ═════════════════                 │     │
│  │                                           │     │
│  │  • Register node on-chain                 │     │
│  │  • Verify session vouchers                │     │
│  │  • Submit payout claims                   │     │
│  │  • Read contract state                    │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Key Components

**1. WireGuard Server** (`wg-setup.sh`)
- Generates server key pair
- Configures network interface
- Sets up routing and NAT
- Manages client peers

**2. API Server** (`server.js`)
- Express.js REST API
- Session lifecycle management
- Real-time usage tracking
- Health checks and metrics

**3. Database** (`database.js`)
- SQLite for local storage
- Session records
- Usage logs
- Statistics

**4. Blockchain Service** (`blockchain.js`)
- ethers.js integration
- Contract interactions
- Event listening
- Transaction signing

#### Session Lifecycle

```
1. User Creates Session On-Chain
   ↓
2. Frontend Notifies Node via API
   ↓
3. Node Verifies Session with Smart Contract
   ↓
4. Node Generates WireGuard Client Config
   ↓
5. Node Adds Peer to WireGuard Interface
   ↓
6. Client Downloads Config & Connects
   ↓
7. Node Tracks Data Usage (RX + TX bytes)
   ↓
8. Session Ends (User stops or expires)
   ↓
9. Node Submits Usage to Smart Contract
   ↓
10. Smart Contract Calculates & Releases Payment
```

### 3. Frontend Layer

#### Architecture

```
┌─────────────────────────────────────────────────────┐
│              React Application (SPA)                 │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │            Pages                            │     │
│  │            ═════                            │     │
│  │                                             │     │
│  │  • Home          - Landing page             │     │
│  │  • Marketplace   - Browse nodes             │     │
│  │  • NodeDetails   - View & purchase          │     │
│  │  • BuyerDash     - User sessions            │     │
│  │  • SellerDash    - Operator earnings        │     │
│  └─────────────┬────────────────────────────────┘    │
│                │                                     │
│                ▼                                     │
│  ┌────────────────────────────────────────────┐     │
│  │         Components                          │     │
│  │         ══════════                          │     │
│  │                                             │     │
│  │  • Navbar    - Navigation & wallet          │     │
│  │  • Footer    - Site info & links            │     │
│  │  • Cards     - Reusable UI elements         │     │
│  └─────────────┬────────────────────────────────┘    │
│                │                                     │
│                ▼                                     │
│  ┌────────────────────────────────────────────┐     │
│  │       Web3 Context (State)                  │     │
│  │       ════════════════════                  │     │
│  │                                             │     │
│  │  • Wallet connection (MetaMask)             │     │
│  │  • Contract instances                       │     │
│  │  • Account state                            │     │
│  │  • Network validation                       │     │
│  └─────────────┬────────────────────────────────┘    │
│                │                                     │
│                ▼                                     │
│  ┌────────────────────────────────────────────┐     │
│  │         ethers.js / Web3                    │     │
│  │         ══════════════════                  │     │
│  │                                             │     │
│  │  • Transaction signing                      │     │
│  │  • Contract calls                           │     │
│  │  • Event listening                          │     │
│  │  • Balance queries                          │     │
│  └─────────────────────────────────────────────┘     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

#### Key Features

**1. Wallet Integration**
- MetaMask connection
- Network switching (Sepolia)
- Account management
- Transaction signing

**2. Smart Contract Interaction**
- Read node registry
- Create sessions
- Monitor transactions
- Query session data

**3. User Experience**
- Responsive design (mobile-first)
- Real-time updates
- Transaction status
- Error handling

### 4. Data Flow Diagrams

#### Purchase Flow

```
User                Frontend          Blockchain         VPN Node
 │                     │                  │                 │
 │  Browse Nodes       │                  │                 │
 ├────────────────────►│                  │                 │
 │                     │  getActiveNodes()│                 │
 │                     ├─────────────────►│                 │
 │                     │◄─────────────────┤                 │
 │  Display Nodes      │                  │                 │
 │◄────────────────────┤                  │                 │
 │                     │                  │                 │
 │  Select & Purchase  │                  │                 │
 ├────────────────────►│                  │                 │
 │                     │  createSession() │                 │
 │                     │  + ETH deposit   │                 │
 │                     ├─────────────────►│                 │
 │                     │                  │                 │
 │                     │  SessionCreated  │                 │
 │                     │     (event)      │                 │
 │                     │◄─────────────────┤                 │
 │                     │                  │                 │
 │                     │  POST /session/start              │
 │                     │  { sessionId }   │                 │
 │                     ├────────────────────────────────────►│
 │                     │                  │                 │
 │                     │         WireGuard Config           │
 │                     │◄────────────────────────────────────┤
 │  Download Config    │                  │                 │
 │◄────────────────────┤                  │                 │
 │                     │                  │                 │
 │  Connect VPN        │                  │                 │
 │────────────────────────────────────────────────────────►│
 │                     │                  │                 │
 │◄─── Encrypted VPN Traffic ───────────────────────────────┤
 │                     │                  │                 │
```

#### Payout Flow

```
VPN Node           Blockchain          User
   │                   │                 │
   │  Monitor Usage    │                 │
   │  (cron job)       │                 │
   │                   │                 │
   │  Session Ends     │                 │
   │                   │                 │
   │  claimPayout()    │                 │
   │  { sessionId,     │                 │
   │    dataUsedBytes }│                 │
   ├──────────────────►│                 │
   │                   │                 │
   │                   │  Calculate:     │
   │                   │  - Total cost   │
   │                   │  - Platform fee │
   │                   │  - Operator cut │
   │                   │  - User refund  │
   │                   │                 │
   │  Transfer ETH     │                 │
   │  (99% to operator)│                 │
   │◄──────────────────┤                 │
   │                   │                 │
   │                   │  Transfer ETH   │
   │                   │  (unused refund)│
   │                   ├────────────────►│
   │                   │                 │
   │  SessionCompleted │                 │
   │     (event)       │                 │
   │◄──────────────────┤                 │
```

## Security Considerations

### Smart Contract Security

1. **Access Control**
   - Only node operators can update their nodes
   - Only session participants can trigger refunds
   - Platform admin controls fees

2. **Reentrancy Protection**
   - Follow checks-effects-interactions pattern
   - Use Solidity 0.8+ built-in protections

3. **Integer Safety**
   - Solidity 0.8+ automatic overflow checks
   - Explicit bounds checking for user inputs

4. **Payment Security**
   - Escrow holds funds until completion
   - Refund mechanisms for expired sessions
   - Fair distribution based on actual usage

### VPN Node Security

1. **Docker Isolation**
   - Container runs with minimal privileges
   - Only required capabilities (NET_ADMIN)
   - No access to host filesystem

2. **API Security**
   - Rate limiting on endpoints
   - Input validation
   - No sensitive data in logs

3. **Private Key Management**
   - Environment variables only
   - Never commit to repository
   - Use secrets management in production

4. **Network Security**
   - Firewall rules (51820/UDP, 3000/TCP only)
   - WireGuard encryption
   - Regular security updates

## Performance Considerations

### Scalability

1. **Smart Contracts**
   - Gas-optimized functions
   - Batch operations where possible
   - Event-based indexing

2. **VPN Nodes**
   - Stateless API design
   - Async operations
   - Connection pooling

3. **Frontend**
   - React optimization (memoization)
   - Lazy loading
   - Pagination for large lists

### Monitoring

1. **Metrics Endpoints**
   - `/health` - Container health
   - `/metrics` - Usage statistics
   - `/info` - Node information

2. **Logging**
   - Structured logging
   - Error tracking
   - Performance monitoring

## Future Enhancements

1. **Layer 2 Integration**
   - Move to Optimism/Arbitrum
   - Reduce transaction costs
   - Faster confirmations

2. **Reputation System**
   - On-chain reviews
   - Uptime tracking
   - Quality scoring

3. **Advanced Features**
   - Multi-token payments
   - Bandwidth verification
   - Automated dispute resolution
   - Governance token

4. **Scalability**
   - Sharding support
   - Off-chain computation
   - State channels for micropayments

---

For implementation details, see source code comments and README.md.
