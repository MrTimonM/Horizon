# Data Usage Tracking System

## Overview
HORIZN now includes comprehensive real-time data usage tracking for all VPN sessions. Users can monitor their bandwidth consumption and node operators can track usage statistics.

## How It Works

### 1. **OpenVPN Status Log**
OpenVPN automatically logs client connection statistics to `/var/log/openvpn/openvpn-status.log` including:
- Bytes received (download)
- Bytes sent (upload)
- Connection time
- Client certificate common name (session_id)

### 2. **Automated Parsing (Node Server)**
The VPN node API server (`deploy-vpn-node.sh`) includes a `parseDataUsage()` function that:
- Runs every 60 seconds (configurable)
- Parses the OpenVPN status log
- Extracts `CLIENT_LIST` entries
- Updates the SQLite database with total bytes used per session

```javascript
// Runs every minute
setInterval(parseDataUsage, 60000);
```

### 3. **Database Storage**
Data usage is stored in the `sessions` table:

```sql
data_used_bytes INTEGER DEFAULT 0
```

Updated automatically by parsing OpenVPN logs.

### 4. **API Endpoints**

#### Get Session Usage
```
GET /session/:sessionId/usage
```

**Response:**
```json
{
  "dataUsedBytes": 72405504000
}
```

#### Get Full Session Info
```
GET /session/:sessionId/info
```

**Response:**
```json
{
  "session_id": "123",
  "user_address": "0x...",
  "node_id": "5",
  "data_used_bytes": 72405504000,
  "created_at": "2024-11-01T10:30:00.000Z",
  "expires_at": "2024-12-01T10:30:00.000Z",
  "status": "active"
}
```

### 5. **Frontend Dashboard**

#### Real-Time Usage Display
The dashboard (`/dashboard`) shows:
- **Total Purchased**: Aggregate data across all sessions
- **Data Used**: Real-time usage with percentage
- **Remaining**: Available bandwidth left

#### Per-Session Details
Each session card displays:
- Used data in GB (e.g., 67.5 GB)
- Remaining data in GB (e.g., 32.5 GB)
- Visual progress bar with color coding:
  - Green: < 70% used
  - Yellow: 70-90% used
  - Red: > 90% used

#### Refresh Usage Button
Click "Refresh Usage" to update all session data instantly from node APIs.

## Implementation Details

### OpenVPN Status Log Format
```
CLIENT_LIST,session-123,192.168.1.100,10.8.0.2,,72405504,54321000,2024-11-08 10:30:00,1699439400,user-123,1,2
```

Parsed fields:
- `parts[1]`: Common Name (session_id)
- `parts[5]`: Bytes Received
- `parts[6]`: Bytes Sent

### Data Calculation
```javascript
const bytesReceived = parseInt(parts[5]) || 0;
const bytesSent = parseInt(parts[6]) || 0;
const totalBytes = bytesReceived + bytesSent;
const totalGB = totalBytes / (1024 ** 3);
```

### Frontend Data Fetching
```typescript
// Fetch usage from node API
const usageResponse = await fetch(
  `http://${node.apiEndpoint}/session/${sessionId}/usage`
);
const usageData = await usageResponse.json();

const dataUsedBytes = usageData.dataUsedBytes || 0;
const dataUsedGB = dataUsedBytes / (1024 ** 3);
```

## Benefits

1. **Transparency**: Users see exactly how much bandwidth they've consumed
2. **Accountability**: On-chain purchase records + usage tracking
3. **Real-Time**: Updates every minute automatically
4. **Accurate**: Directly from OpenVPN server logs
5. **Decentralized**: Each node tracks its own sessions

## Usage Scenarios

### As a Buyer
1. Go to `/dashboard`
2. View "My Sessions" tab
3. See real-time data usage for each session
4. Click "Refresh Usage" for instant updates
5. Monitor progress bars to avoid overuse

### As a Node Operator
- Usage data is logged automatically
- No manual intervention required
- Check server logs for parsing status:
  ```bash
  journalctl -u horizn-node -f | grep "Updated data usage"
  ```

## Monitoring & Troubleshooting

### Check OpenVPN Status Log
```bash
cat /var/log/openvpn/openvpn-status.log
```

### Verify Database Updates
```bash
sqlite3 /opt/horizn-node/sessions.db "SELECT session_id, data_used_bytes FROM sessions"
```

### Test API Endpoint
```bash
curl http://YOUR_NODE_IP:3001/session/123/usage
```

### View Parsing Logs
```bash
journalctl -u horizn-node -n 100 | grep "data usage"
```

## Performance Considerations

- **Update Frequency**: 60 seconds (1 minute)
- **Resource Usage**: Minimal CPU/memory impact
- **Log Parsing**: Fast string operations
- **Database Writes**: One UPDATE per connected client per minute

## Future Enhancements

1. **Historical Usage Charts**: Track usage over time
2. **Usage Alerts**: Notify users at 80%, 90%, 100% thresholds
3. **Bandwidth Throttling**: Slow down connections near limit
4. **Auto-Renewal**: Purchase more data automatically
5. **Analytics Dashboard**: Node operators see aggregate statistics

## Security Notes

- Usage data is read from OpenVPN logs (trusted source)
- Only the session owner can download VPN config
- Usage API is public but harmless (just numbers)
- No sensitive data exposed in usage statistics

---

**Status**: ✅ Fully Implemented and Tested
**Version**: 1.0
**Last Updated**: November 8, 2024
