import { Asset, Finding } from '../types';

export const MOCK_ASSETS: Asset[] = [
  {
    id: 'asset-cisco-fw-01',
    name: 'CISCO-FW-CORE-01',
    vendor: 'cisco',
    config_raw: `
hostname CISCO-FW-CORE-01
!
enable password 7 08701E1D5D
!
service password-encryption
no service tcp-small-servers
no service udp-small-servers
!
interface GigabitEthernet0/0
 description WAN-UPLINK
 ip address 203.0.113.1 255.255.255.0
 no shutdown
 no ip proxy-arp
!
interface GigabitEthernet0/1
 description LAN-SEGMENT
 ip address 10.0.1.1 255.255.255.0
 no shutdown
!
no ip http server
no ip http secure-server
!
ip access-list extended INBOUND-FILTER
 permit ip 10.0.0.0 0.255.255.255 any
 deny   ip any any log
!
snmp-server community public RO
snmp-server community private RW
!
banner motd # Unauthorized access is prohibited #
!
line vty 0 4
 transport input telnet
 login local
!
ntp server 216.239.35.0
`.trim()
  },
  {
    id: 'asset-fortinet-vpn-02',
    name: 'FG-VPN-EDGE-02',
    vendor: 'fortinet',
    config_raw: `
config system global
    set hostname FG-VPN-EDGE-02
    set admintimeout 480
    set admin-ssh-port 22
    set strong-crypto disable
    set ssl-min-proto-version TLSv1
end
config system interface
    edit "wan1"
        set mode dhcp
        set allowaccess ping https ssh telnet
    next
    edit "internal"
        set ip 192.168.1.99 255.255.255.0
        set allowaccess ping https ssh
    next
end
config firewall policy
    edit 1
        set name "ALLOW-ALL-OUTBOUND"
        set srcintf "internal"
        set dstintf "wan1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set logtraffic disable
    next
end
config vpn ssl settings
    set servercert "self-sign"
    set tunnel-ip-pools "SSLVPN_TUNNEL_ADDR1"
    set source-interface "wan1"
    set source-address "all"
    set default-portal "full-access"
end
`.trim()
  },
  {
    id: 'asset-linux-web-03',
    name: 'LINUX-WEB-PROD-03',
    vendor: 'linux',
    config_raw: `
# /etc/ssh/sshd_config
Port 22
Protocol 2
PermitRootLogin yes
PasswordAuthentication yes
PubkeyAuthentication yes
X11Forwarding yes
MaxAuthTries 6
LoginGraceTime 120
AllowTcpForwarding yes

# /etc/sysctl.conf
net.ipv4.ip_forward = 1
net.ipv4.conf.all.accept_redirects = 1
net.ipv4.conf.all.send_redirects = 1
net.ipv6.conf.all.accept_ra = 1
net.ipv4.tcp_syncookies = 0

# Cron jobs
* * * * * root /tmp/update_check.sh
@reboot root curl -s http://update.internal/bootstrap | bash

# World-writable directories
/var/tmp world-writable
/tmp world-writable

# Open ports (netstat -tlnp)
0.0.0.0:21   ftp
0.0.0.0:23   telnet
0.0.0.0:111  rpcbind
`.trim()
  }
];

export const MOCK_FINDINGS: Finding[] = [
  // === CISCO FINDINGS ===
  {
    id: 'finding-001',
    rule_id: 'CISCO-AUTH-001',
    title: 'Telnet Enabled on VTY Lines – Plaintext Credential Exposure',
    severity: 'CRITICAL',
    vendor: 'cisco',
    asset_id: 'asset-cisco-fw-01',
    evidence: 'line vty 0 4\n  transport input telnet\nCleartext protocol allows credential interception via MITM attacks.',
    remediation: 'Replace telnet with SSH-only transport:\n  line vty 0 4\n    transport input ssh\n  crypto key generate rsa modulus 2048\nEnsure IOS version supports SSHv2.'
  },
  {
    id: 'finding-002',
    rule_id: 'CISCO-SNMP-002',
    title: 'Default SNMP Community Strings (public/private) Detected',
    severity: 'CRITICAL',
    vendor: 'cisco',
    asset_id: 'asset-cisco-fw-01',
    evidence: 'snmp-server community public RO\nsnmp-server community private RW\nDefault community strings expose full device MIB to unauthorized actors.',
    remediation: 'Remove default community strings and configure strong unique values:\n  no snmp-server community public\n  no snmp-server community private\n  snmp-server community <STRONG_STRING> RO\nConsider migrating to SNMPv3 with authentication and encryption.'
  },
  {
    id: 'finding-003',
    rule_id: 'CISCO-CRYPT-003',
    title: 'Weak Type-7 Password Encryption in Running Config',
    severity: 'HIGH',
    vendor: 'cisco',
    asset_id: 'asset-cisco-fw-01',
    evidence: 'enable password 7 08701E1D5D\nType-7 encoding is reversible and can be decoded with freely available tools.',
    remediation: 'Upgrade to Type-9 (scrypt) or Type-8 (PBKDF2-SHA256) hashing:\n  enable algorithm-type scrypt secret <password>\n  service password-encryption\nRemove all Type-7 encoded passwords.'
  },
  {
    id: 'finding-004',
    rule_id: 'CISCO-HTTP-004',
    title: 'HTTP Management Interface Verified Disabled',
    severity: 'LOW',
    vendor: 'cisco',
    asset_id: 'asset-cisco-fw-01',
    evidence: 'no ip http server\nno ip http secure-server\nHTTP management plane is correctly disabled.',
    remediation: 'No action required. Continue monitoring to ensure this configuration persists across upgrades.'
  },
  // === FORTINET FINDINGS ===
  {
    id: 'finding-005',
    rule_id: 'FGT-TLS-001',
    title: 'TLS 1.0 Minimum Protocol Version – Deprecated Cipher Support',
    severity: 'CRITICAL',
    vendor: 'fortinet',
    asset_id: 'asset-fortinet-vpn-02',
    evidence: 'config system global\n  set ssl-min-proto-version TLSv1\nTLS 1.0 is deprecated per RFC 8996 and vulnerable to BEAST, POODLE attacks.',
    remediation: 'Enforce TLS 1.2 minimum or preferably TLS 1.3:\n  config system global\n    set ssl-min-proto-version TLSv1-2\n  end\nDisable TLS 1.0 and 1.1 across all services.'
  },
  {
    id: 'finding-006',
    rule_id: 'FGT-POLICY-002',
    title: 'Firewall Policy Permits ALL Services Without Traffic Logging',
    severity: 'HIGH',
    vendor: 'fortinet',
    asset_id: 'asset-fortinet-vpn-02',
    evidence: 'edit 1\n  set service "ALL"\n  set action accept\n  set logtraffic disable\nOverly permissive policy with no audit trail violates least-privilege principles.',
    remediation: 'Apply least-privilege to firewall policies:\n  edit 1\n    set service "HTTP" "HTTPS" "DNS"\n    set logtraffic all\n  next\nReview and segment policies per traffic class.'
  },
  {
    id: 'finding-007',
    rule_id: 'FGT-ADMIN-003',
    title: 'Admin Session Timeout Set to 480 Minutes (8 Hours)',
    severity: 'MEDIUM',
    vendor: 'fortinet',
    asset_id: 'asset-fortinet-vpn-02',
    evidence: 'config system global\n  set admintimeout 480\nCIS Benchmark recommends timeout ≤ 10 minutes to prevent session hijacking.',
    remediation: 'Reduce admin timeout to 10 minutes or less:\n  config system global\n    set admintimeout 10\n  end\nEnforce MFA for all admin sessions.'
  },
  {
    id: 'finding-008',
    rule_id: 'FGT-WAN-004',
    title: 'Telnet Access Permitted on WAN Interface',
    severity: 'CRITICAL',
    vendor: 'fortinet',
    asset_id: 'asset-fortinet-vpn-02',
    evidence: 'edit "wan1"\n  set allowaccess ping https ssh telnet\nTelnet on WAN interface exposes admin credentials to internet-level attackers.',
    remediation: 'Remove telnet from WAN allowaccess:\n  config system interface\n    edit "wan1"\n      set allowaccess ping https\n    next\n  end\nRestrict SSH to known management IP ranges only.'
  },
  // === LINUX FINDINGS ===
  {
    id: 'finding-009',
    rule_id: 'LNX-SSH-001',
    title: 'Root Login via SSH Permitted – Direct Privilege Escalation Risk',
    severity: 'CRITICAL',
    vendor: 'linux',
    asset_id: 'asset-linux-web-03',
    evidence: 'PermitRootLogin yes\nDirect root SSH login bypasses sudo audit trail and enables brute-force targeting of root.',
    remediation: 'Disable root SSH login and enforce key-based auth:\n  PermitRootLogin no\n  PasswordAuthentication no\n  PubkeyAuthentication yes\nUse sudo for privilege escalation with full audit logging.'
  },
  {
    id: 'finding-010',
    rule_id: 'LNX-KERN-002',
    title: 'SYN Cookie Protection Disabled – TCP SYN Flood Vulnerability',
    severity: 'HIGH',
    vendor: 'linux',
    asset_id: 'asset-linux-web-03',
    evidence: 'net.ipv4.tcp_syncookies = 0\nWithout SYN cookies, the server is vulnerable to TCP SYN flood DoS attacks.',
    remediation: 'Enable SYN cookies in sysctl:\n  net.ipv4.tcp_syncookies = 1\nApply immediately:\n  sysctl -w net.ipv4.tcp_syncookies=1\nPersist in /etc/sysctl.conf and reload with sysctl -p.'
  },
  {
    id: 'finding-011',
    rule_id: 'LNX-FTP-003',
    title: 'FTP Service Running on Port 21 – Plaintext File Transfer Detected',
    severity: 'HIGH',
    vendor: 'linux',
    asset_id: 'asset-linux-web-03',
    evidence: '0.0.0.0:21   ftp\nFTP transmits credentials and data in plaintext. No PCI-DSS or CIS compliant environment should run FTP.',
    remediation: 'Disable FTP service:\n  systemctl stop vsftpd\n  systemctl disable vsftpd\nReplace with SFTP (over SSH) or FTPS with TLS enforcement.'
  },
  {
    id: 'finding-012',
    rule_id: 'LNX-CRON-004',
    title: 'Cron Job Executing Script from /tmp – Privilege Escalation Vector',
    severity: 'CRITICAL',
    vendor: 'linux',
    asset_id: 'asset-linux-web-03',
    evidence: '* * * * * root /tmp/update_check.sh\nExecuting root-owned cron from world-writable /tmp allows any local user to replace the script.',
    remediation: 'Move cron scripts to /usr/local/sbin/ with strict permissions:\n  mv /tmp/update_check.sh /usr/local/sbin/\n  chmod 750 /usr/local/sbin/update_check.sh\n  chown root:root /usr/local/sbin/update_check.sh\nUpdate crontab accordingly.'
  },
  {
    id: 'finding-013',
    rule_id: 'LNX-CURL-005',
    title: 'Remote Code Execution via curl | bash Bootstrap Pattern',
    severity: 'CRITICAL',
    vendor: 'linux',
    asset_id: 'asset-linux-web-03',
    evidence: '@reboot root curl -s http://update.internal/bootstrap | bash\nPiping remote HTTP content directly to bash at root level is an immediate RCE risk.',
    remediation: 'Remove the curl|bash pattern entirely:\n  crontab -e  # Delete the @reboot entry\nReplace with verified, signed package management:\n  1. Download script manually\n  2. Verify SHA256 checksum\n  3. Audit content before execution\n  4. Use package manager instead where possible.'
  },
  {
    id: 'finding-014',
    rule_id: 'LNX-REDIR-006',
    title: 'ICMP Redirect Acceptance Enabled – Routing Table Poisoning Risk',
    severity: 'MEDIUM',
    vendor: 'linux',
    asset_id: 'asset-linux-web-03',
    evidence: 'net.ipv4.conf.all.accept_redirects = 1\nAccepting ICMP redirects allows attackers to manipulate routing tables via spoofed ICMP messages.',
    remediation: 'Disable ICMP redirect acceptance:\n  net.ipv4.conf.all.accept_redirects = 0\n  net.ipv4.conf.default.accept_redirects = 0\nApply: sysctl -p /etc/sysctl.conf'
  }
];
