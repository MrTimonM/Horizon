# HORIZN VPN Node - Redeployment Guide

## Quick Redeployment (Updated Script)

### Prerequisites
- ✅ VPS running Ubuntu 20.04/22.04 or Debian 11/12
- ✅ Root access via SSH
- ✅ Updated `deploy-vpn-node.sh` script

---

## Option A: Clean Redeployment (Recommended)

### Step 1: Upload Updated Script
```bash
# From your local machine (in HORIZN directory)
scp node-deployment/deploy-vpn-node.sh root@YOUR_VPS_IP:/root/
```

### Step 2: SSH into VPS
```bash
ssh root@YOUR_VPS_IP
```

### Step 3: Stop Existing Services
```bash
# Stop API and VPN services
systemctl stop horizn-node
systemctl stop openvpn-server@server

# Backup database (IMPORTANT!)
mkdir -p /root/backups
cp /opt/horizn-node/vpn_node.db /root/backups/vpn_node.db.backup-$(date +%Y%m%d-%H%M%S)
cp /opt/horizn-node/aes_key.txt /root/backups/aes_key.txt.backup 2>/dev/null || true

echo "✓ Backup complete"
```

### Step 4: Clean Old Installation (Optional)
```bash
# Remove old node directory (database is backed up)
rm -rf /opt/horizn-node/node_modules
rm -rf /opt/horizn-node/package-lock.json

# Note: This keeps your .env, aes_key.txt, and vpn_node.db
```

### Step 5: Run Deployment
```bash
cd /root
chmod +x deploy-vpn-node.sh
./deploy-vpn-node.sh
```

**You'll be prompted for:**
- Server IP (auto-detected, just confirm)
- Node name
- Region
- Price per GB
- Bandwidth
- Private key
- Pinata JWT

### Step 6: Verify Services
```bash
# Check API service
systemctl status horizn-node

# Check OpenVPN
systemctl status openvpn-server@server

# Watch logs
journalctl -u horizn-node -f
```

---

## Option B: Update Existing Installation (Faster)

### Only Update Node.js Server Code

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Stop service
systemctl stop horizn-node

# Backup current server.js
cp /opt/horizn-node/server.js /opt/horizn-node/server.js.backup

# Update server.js (copy from the deploy script or use cat)
cd /opt/horizn-node

# Create updated server.js with new enforcement logic
cat > server.js << 'EOF'
[PASTE THE COMPLETE SERVER.JS CODE FROM deploy-vpn-node.sh]
EOF

# Restart service
systemctl start horizn-node

# Verify
systemctl status horizn-node
journalctl -u horizn-node -f
```

---

## Option C: Script-Based Update Only

If you just want to update the enforcement logic:

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Download and run update script
wget https://raw.githubusercontent.com/MrTimonM/Horizon/main/node-deployment/update-enforcement.sh
chmod +x update-enforcement.sh
./update-enforcement.sh
```

---

## Post-Deployment Verification

### 1. Check All Services
```bash
echo "=== Service Status ==="
systemctl status horizn-node --no-pager
systemctl status openvpn-server@server --no-pager
systemctl status fail2ban --no-pager
ufw status verbose
```

### 2. Verify Data Limit Enforcement
```bash
# Watch logs for enforcement
journalctl -u horizn-node -f

# You should see:
# ✓ Generated new AES encryption key (or loaded existing)
# ✓ Node registered! Transaction: 0x...
# ✓ Node ID: X
# 📊 Session tracking logs
```

### 3. Test OpenVPN Status Parsing
```bash
# Check if OpenVPN status log exists
cat /var/log/openvpn/openvpn-status.log

# Verify CRL is enabled
grep "crl-verify" /etc/openvpn/server/server.conf

# Check CRL file exists
ls -la /etc/openvpn/server/crl.pem
```

### 4. Database Check
```bash
cd /opt/horizn-node
sqlite3 vpn_node.db "SELECT * FROM sessions;"
sqlite3 vpn_node.db ".schema sessions"
```

### 5. Test API Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Should return:
# {"status":"healthy","nodeId":"X","region":"YourRegion","encryption":"enabled"}
```

---

## Restore from Backup (If Needed)

```bash
# Stop service
systemctl stop horizn-node

# Restore database
cp /root/backups/vpn_node.db.backup-TIMESTAMP /opt/horizn-node/vpn_node.db

# Restore encryption key
cp /root/backups/aes_key.txt.backup /opt/horizn-node/aes_key.txt

# Restart
systemctl start horizn-node
```

---

## New Features Verification

### Check Data Limit Enforcement
```bash
# Monitor logs for enforcement
journalctl -u horizn-node -f | grep -E "limit|expired|revoked"

# Expected log patterns:
# ⚠️ Session X at 90.5% data usage
# ⚠️ Session X exceeded data limit: 10.02 GB / 10.00 GB
# ✓ Revoked certificate for session X
# 🚫 Session X disconnected due to data limit
```

### Check Time Expiration
```bash
# Should run every 5 minutes
journalctl -u horizn-node | grep "expired by time"
```

### Verify CRL Working
```bash
# Check CRL content
openssl crl -in /etc/openvpn/server/crl.pem -noout -text

# Verify OpenVPN loads it
grep "crl-verify" /etc/openvpn/server/server.conf
```

---

## Troubleshooting

### Service Won't Start
```bash
# Check detailed logs
journalctl -u horizn-node -n 50 --no-pager

# Common issues:
# - Missing dependencies: npm install
# - Wrong permissions: chmod 644 /opt/horizn-node/.env
# - Missing files: Check aes_key.txt exists
```

### OpenVPN Won't Start
```bash
# Check OpenVPN logs
journalctl -u openvpn-server@server -n 50 --no-pager

# Test config
openvpn --config /etc/openvpn/server/server.conf --test-tls

# Common issues:
# - CRL file missing: Generate with easyrsa gen-crl
# - Certificate issues: Rebuild CA
```

### Database Issues
```bash
# Check database integrity
sqlite3 /opt/horizn-node/vpn_node.db "PRAGMA integrity_check;"

# Recreate if corrupted
systemctl stop horizn-node
mv /opt/horizn-node/vpn_node.db /opt/horizn-node/vpn_node.db.old
systemctl start horizn-node  # Auto-creates new DB
```

---

## Monitoring After Deployment

### Essential Commands
```bash
# API logs (real-time)
journalctl -u horizn-node -f

# OpenVPN logs
tail -f /var/log/openvpn/openvpn-status.log

# Check active connections
cat /var/log/openvpn/openvpn-status.log | grep CLIENT_LIST

# Service status dashboard
watch -n 2 'systemctl status horizn-node openvpn-server@server fail2ban | grep Active'
```

### Performance Monitoring
```bash
# CPU/Memory usage
htop

# Disk usage
df -h

# Network connections
netstat -tulpn | grep -E '1194|3000'
```

---

## Rollback Plan

If something goes wrong:

```bash
# 1. Stop new services
systemctl stop horizn-node
systemctl stop openvpn-server@server

# 2. Restore backups
cp /root/backups/vpn_node.db.backup-LATEST /opt/horizn-node/vpn_node.db
cp /root/backups/aes_key.txt.backup /opt/horizn-node/aes_key.txt

# 3. Restore old server.js (if backed up)
cp /opt/horizn-node/server.js.backup /opt/horizn-node/server.js

# 4. Restart
systemctl start openvpn-server@server
systemctl start horizn-node

# 5. Verify
systemctl status horizn-node
```

---

## Migration Notes

### Database Schema
The new version is **backward compatible**:
- Existing `sessions` table works as-is
- New `status` column auto-defaults to 'active'
- No migration script needed

### Configuration Files
All existing configs are preserved:
- `/opt/horizn-node/.env` - Kept
- `/opt/horizn-node/aes_key.txt` - Kept
- `/etc/openvpn/server/*` - Updated with CRL

### Certificates
Existing certificates remain valid:
- CA certificate unchanged
- Server certificate unchanged
- Client certificates work until revoked

---

## Success Checklist

After redeployment, verify:

- [ ] `systemctl status horizn-node` shows **active (running)**
- [ ] `systemctl status openvpn-server@server` shows **active (running)**
- [ ] `curl http://localhost:3000/health` returns JSON
- [ ] Logs show "HORIZN Node API Server" startup message
- [ ] CRL file exists: `/etc/openvpn/server/crl.pem`
- [ ] Database file exists: `/opt/horizn-node/vpn_node.db`
- [ ] Node registered on blockchain (check logs for Node ID)
- [ ] Firewall allows ports 22, 1194
- [ ] No error messages in `journalctl -u horizn-node -n 50`

---

## Need Help?

### Check Logs First
```bash
# API service logs
journalctl -u horizn-node -n 100 --no-pager

# OpenVPN logs
journalctl -u openvpn-server@server -n 100 --no-pager

# System logs
dmesg | tail -50
```

### Common Solutions
1. **"npm: command not found"** → Reinstall Node.js
2. **"Cannot find module"** → Run `npm install` in `/opt/horizn-node`
3. **"Port 3000 in use"** → `killall node` then restart
4. **"Certificate revocation failed"** → Check `/root/openvpn-ca` exists

---

**Status**: Ready for Production ✅  
**Version**: 1.1 (Data Limit Enforcement)  
**Last Updated**: November 8, 2024
