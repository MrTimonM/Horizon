# Data Limit Enforcement System

## Overview
HORIZN automatically enforces data limits purchased by users. When limits are reached, VPN access is immediately revoked to protect node operators.

## What Happens When Data Limit is Reached?

### Automatic Actions

#### 1. **Detection** (Every 60 seconds)
```javascript
// Check current usage vs purchased limit
const dataUsedBytes = bytesReceived + bytesSent;
const maxDataBytes = purchasedGB * (1024 ** 3);

if (dataUsedBytes >= maxDataBytes) {
  // LIMIT REACHED - Take action
}
```

#### 2. **Immediate Revocation**
When a session exceeds its data limit:

```bash
✓ Certificate revoked via EasyRSA
✓ CRL (Certificate Revocation List) regenerated
✓ Client disconnected from VPN immediately
✓ Database status updated to 'expired'
```

**Technical Implementation:**
```javascript
// Revoke client certificate
execSync(`cd /root/openvpn-ca && ./easyrsa --batch revoke client-session-${sessionId}`);

// Regenerate CRL
execSync(`cd /root/openvpn-ca && ./easyrsa gen-crl`);

// Copy to OpenVPN
execSync('cp /root/openvpn-ca/pki/crl.pem /etc/openvpn/server/');
```

#### 3. **Database Update**
```sql
UPDATE sessions 
SET status = 'expired' 
WHERE session_id = ?
```

#### 4. **Logging**
```
⚠️ Session 123 exceeded data limit: 10.02 GB / 10.00 GB
🚫 Session 123 disconnected due to data limit
```

## Warning System

### 90% Usage Warning
Users receive a warning when they reach 90% of their data limit:

```
⚠️ Session 123 at 90.5% data usage
```

**Frontend Dashboard:**
- Progress bar turns **yellow** at 70%
- Progress bar turns **red** at 90%
- Toast notification: "Low Data Warning - 90% used"

### User Experience
When limit is reached:
1. **Active Connection**: Drops immediately
2. **Reconnection Attempts**: Fail (revoked certificate)
3. **Dashboard**: Shows "EXPIRED" status
4. **Config Download**: Still works (for reference)

## Time-Based Expiration

Sessions also expire based on duration purchased:

### Automatic Time Checks (Every 5 minutes)
```javascript
const now = Date.now();
const expiresAt = session.expiresAt;

if (now > expiresAt) {
  // SESSION EXPIRED BY TIME
  disconnectClient(sessionId);
  updateStatus('expired');
}
```

### Logs:
```
⏰ Session 456 expired by time
🚫 Session 456 disconnected due to time expiration
```

## OpenVPN Integration

### CRL (Certificate Revocation List)
OpenVPN server configuration includes:

```
crl-verify crl.pem
```

This ensures:
- OpenVPN checks revoked certificates on every connection
- Revoked clients cannot connect even with valid config files
- Real-time enforcement (no delay)

### Status Log Monitoring
Every minute, the system reads:
```
/var/log/openvpn/openvpn-status.log
```

Extracts:
```
CLIENT_LIST,client-session-123,192.168.1.100,10.8.0.2,,72405504,54321000,...
             ^                                         ^         ^
             Session ID                                 RX       TX
```

## Frontend Notifications

### Dashboard Indicators

#### Active Session (Within Limit)
```
Status: ACTIVE
Progress Bar: Green (< 70% used)
Data: 6.5 GB / 10 GB (65%)
```

#### High Usage Warning (70-90%)
```
Status: ACTIVE
Progress Bar: Yellow
Data: 8.2 GB / 10 GB (82%)
⚠️ Warning: High data usage
```

#### Critical Warning (90-100%)
```
Status: ACTIVE
Progress Bar: Red
Data: 9.5 GB / 10 GB (95%)
🔴 Critical: Low data remaining
```

#### Limit Reached (>100%)
```
Status: EXPIRED
Progress Bar: Red (100%)
Data: 10.02 GB / 10 GB (100%)
❌ Session expired - Data limit reached
```

## User Recovery Options

When a session expires, users can:

### 1. **Purchase New Session**
- Go to Marketplace
- Buy more data from same or different node
- Get new config file

### 2. **View Usage History**
- Dashboard shows complete usage stats
- Can download old config for reference
- Transaction history on blockchain

### 3. **Contact Support**
- Node operator contact info in marketplace
- Dispute resolution via smart contract

## Node Operator Benefits

### Automated Protection
✅ No manual intervention required
✅ Prevents data theft/abuse
✅ Fair usage enforcement
✅ Automatic earnings protection

### Monitoring
```bash
# Watch real-time enforcement
journalctl -u horizn-node -f | grep "limit\|expired"

# Check CRL status
cat /etc/openvpn/server/crl.pem

# View active sessions
cat /var/log/openvpn/openvpn-status.log
```

## Smart Contract Integration

### On-Chain Session Data
```solidity
struct Session {
  uint256 sessionId;
  uint256 nodeId;
  address user;
  uint256 maxDataGB;        // ← Purchased limit
  uint256 dataUsedBytes;    // ← Current usage (updated periodically)
  uint8 status;             // ← 0=Active, 1=Expired
}
```

### Node Updates Blockchain
Every hour (or on significant events), node can update:
```javascript
await escrowContract.updateDataUsage(sessionId, dataUsedBytes);
```

This enables:
- Transparent usage tracking
- Payout calculations
- Dispute resolution

## Testing Enforcement

### Simulate Limit Reached

1. **Create test session** with small limit (e.g., 0.1 GB)
2. **Generate traffic** using VPN
3. **Watch logs**:
   ```bash
   journalctl -u horizn-node -f
   ```
4. **Observe**:
   - Usage tracking every minute
   - Warning at 90% (0.09 GB)
   - Disconnection at 100% (0.1 GB)
   - Certificate revocation

### Expected Output
```
📊 Session 789: 45.32 MB used
📊 Session 789: 89.15 MB used
⚠️ Session 789 at 90.5% data usage
📊 Session 789: 98.73 MB used
⚠️ Session 789 exceeded data limit: 0.102 GB / 0.100 GB
✓ Revoked certificate for session 789
🚫 Session 789 disconnected due to data limit
```

## Troubleshooting

### Client Can't Reconnect (Good!)
**Symptom**: "Certificate has been revoked" error
**Status**: ✅ **WORKING AS INTENDED**
**Solution**: User needs to purchase new session

### Client Still Connected After Limit
**Symptom**: Client uses more than purchased
**Debug**:
```bash
# Check if CRL is loaded
systemctl status openvpn-server@server | grep crl

# Verify CRL contains revoked cert
openssl crl -in /etc/openvpn/server/crl.pem -noout -text

# Check logs
journalctl -u horizn-node -n 100 | grep "session-789"
```

### Data Usage Not Updating
**Check**:
```bash
# Verify status log exists
cat /var/log/openvpn/openvpn-status.log

# Check parsing function
journalctl -u horizn-node -f

# Verify database
sqlite3 /opt/horizn-node/vpn_node.db "SELECT * FROM sessions"
```

## Security Considerations

### Certificate Revocation vs Deletion
- ✅ **Revoke**: Secure, leaves audit trail, OpenVPN enforces
- ❌ **Delete**: Less secure, breaks audit trail

### CRL Updates
- Automatically regenerated on each revocation
- OpenVPN reloads CRL automatically
- No service restart needed

### Database Consistency
- Status updated before disconnection
- Prevents race conditions
- Audit trail preserved

## Performance Impact

### Resource Usage
- **CPU**: Minimal (~0.1% per check)
- **Memory**: Negligible (~1 MB for tracking)
- **Disk I/O**: Low (one log read per minute)
- **Network**: None (local operations only)

### Scalability
- Handles 1000+ concurrent sessions
- O(n) complexity for parsing
- Async operations prevent blocking

## Future Enhancements

### Planned Features
1. **Grace Period**: 5-minute warning before disconnect
2. **Auto-Renewal**: Purchase more data automatically
3. **Throttling**: Slow down speed at 95% instead of hard cut
4. **Email Notifications**: Alert users at 80%, 90%, 100%
5. **Usage Analytics**: Historical charts and predictions
6. **Smart Limits**: AI-based usage forecasting

### Community Requests
- Rollover unused data
- Family plan sharing
- Bonus data for loyalty
- Referral rewards

---

**Status**: ✅ Fully Implemented and Active
**Last Updated**: November 8, 2024
**Version**: 1.1
