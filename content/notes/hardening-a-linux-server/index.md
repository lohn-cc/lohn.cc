---
title: "Hardening a Linux server for production, step by step"
seo_title: "Hardening a Linux server, step by step"
description: "How I harden a new Linux server before anything goes on it: SSH keys only, firewall, fail2ban, kernel settings, SELinux, updates, separate users and alerts."
date: 2026-10-12T22:40:00+07:00
draft: false
slug: "hardening-a-linux-server"
keywords: ["Linux server hardening", "SSH", "firewalld", "fail2ban", "SELinux", "sysctl", "Rocky Linux", "rootless Podman"]
---

This site, my email and the apps I build all run on one virtual server: Rocky Linux 10, rented from a hosting
provider, reinstalled from scratch at the start of October 2026. Before any of them went on it, I hardened the
server itself. This note goes through what I did, in the order I did it, with the real settings.

None of it is exotic. The point of hardening is not one clever trick but many small, boring defaults that each
close a door. A server on the internet gets its first login attempts within minutes of booting; most of them are
bots trying passwords. The steps below make sure they have nothing to try.

The commands are for Rocky Linux (and other Red Hat family systems), but every step has an equivalent on Debian
or Ubuntu.

## 1. An admin user, then SSH with keys only

The first thing on a new server: create your own user with `sudo`, put your public SSH key in it, log in as that
user in a **second** terminal to check it works, and only then turn off everything else.

I put the SSH settings in a drop-in file rather than editing the main configuration:

```text
# /etc/ssh/sshd_config.d/01-hardening.conf
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AuthenticationMethods publickey
PermitEmptyPasswords no
AllowUsers <admin user> <upload user>
MaxAuthTries 3
MaxSessions 5
LoginGraceTime 60
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowAgentForwarding no
AllowTcpForwarding local
PermitTunnel no
LogLevel VERBOSE
```

- **Keys only.** With no passwords, the bots' guessing is pointless: there is nothing to guess.
- **No root login.** You log in as yourself and use `sudo`, so every admin action is tied to a person.
- **`AllowUsers`.** Only the accounts that need SSH can use it. Any other account, even one created later by a
  package, can't log in over SSH.
- **No forwarding of agents, X11 or tunnels.** I don't need them, so they are off.
- **`LogLevel VERBOSE`** logs the fingerprint of the key used for each login, so you know *which* key logged in.

### Two traps I hit

**The file name matters.** OpenSSH uses the *first* value it reads for most settings, and it reads the drop-in
files in alphabetical order. The provider's image shipped a `50-cloud-init.conf` that says
`PasswordAuthentication yes`. A file named `99-hardening.conf` would have been read after it and lost. Naming mine
`01-hardening.conf` makes it win. Never trust the file; check what SSH actually uses:

```bash
sudo sshd -T | grep -E '^(permitrootlogin|passwordauthentication|authenticationmethods) '
# permitrootlogin no
# passwordauthentication no
# authenticationmethods publickey
```

**The provider turned root login back on.** After the first reboot, root login was allowed again. The cause was
the provider's cloud-init setup, which re-enabled it at every boot. The fix was a cloud-init override that keeps
root and password login off and leaves out the provider's boot command:

```yaml
# /etc/cloud/cloud.cfg.d/99-zz-hardening.cfg
disable_root: true
ssh_pwauth: false
```

Lesson: after hardening, **reboot once and check again**. What the provider's tooling does at boot can undo your
work silently.

### A user that can only upload

My websites are built by GitHub Actions and copied to the server over SSH. That needs a key that a machine holds,
so I gave it a separate user whose keys can do exactly one thing: write into one folder each. With `rrsync`
(a small script that comes with rsync) forced in `authorized_keys`, the key for this site can only write into
`/var/www/lohn.cc`: no shell, no other folder, not even reading back what is there (`-wo`, write only):

```text
command="/usr/local/bin/rrsync -wo /var/www/lohn.cc",restrict ssh-ed25519 AAAA… github-actions-deploy@lohn.cc
```

If that key ever leaks, the damage is limited to replacing one website, which the next deploy puts right.

## 2. A firewall that opens only what runs

Rocky Linux uses `firewalld`. I opened services by name rather than by port, so the list reads like a description
of the server:

```bash
sudo firewall-cmd --permanent --add-service={http,https,smtp,smtps,submission,imaps,pop3s,managesieve}
sudo firewall-cmd --reload
sudo firewall-cmd --list-services
# http https imaps managesieve pop3s smtp smtps ssh submission
```

Notice what is **not** there: plain IMAP (143) and POP3 (110). Mail apps connect over their TLS ports (993 and 995)
only, so there is no unencrypted way in. Databases and app servers listen on `127.0.0.1` only, behind the web
server, so they need no firewall opening at all. The only extra ports are the media ports for voice and video
calls in the chat app I run, which can't go through the web server.

## 3. fail2ban for what still knocks

With keys only, password guessing can't succeed, but it still fills the logs and uses resources. fail2ban reads the
logs and bans addresses that fail too often, through firewalld:

```ini
# /etc/fail2ban/jail.local
[DEFAULT]
banaction = firewallcmd-rich-rules
banaction_allports = firewallcmd-rich-rules[actiontype=<allports>]
backend = systemd
bantime = 1h
bantime.increment = true
bantime.factor = 2
bantime.maxtime = 1w
findtime = 10m
maxretry = 5
ignoreip = 127.0.0.1/8 ::1 <your own address>

[sshd]
enabled = true

[recidive]
enabled = true
logpath = /var/log/fail2ban.log
banaction = %(banaction_allports)s
bantime = 1w
findtime = 1d
maxretry = 3
```

- Five failures in ten minutes: banned for an hour, then two hours, four, and so on up to a week for repeat
  offenders (`bantime.increment`).
- The `recidive` jail watches fail2ban's own log: an address banned three times in a day is blocked on **all**
  ports for a week.
- **Put your own address in `ignoreip`.** Locking yourself out because of a typo in a script is a classic. Recent
  OpenSSH versions also slow down misbehaving addresses on their own (`PerSourcePenalties`); I exempt my own
  address there as well, with `PerSourcePenaltyExemptList`.

And know your way back in if it happens anyway: the provider's web console (VNC) works without SSH, and
`sudo fail2ban-client set sshd unbanip <address>` lifts a ban.

## 4. Kernel network and process settings

A handful of `sysctl` settings close old network tricks and make the kernel tell attackers less. All of mine are in
one file, so they are easy to review:

```text
# /etc/sysctl.d/90-hardening.conf (excerpt)
net.ipv4.tcp_syncookies = 1                 # survive SYN floods
net.ipv4.conf.all.rp_filter = 1             # drop packets with impossible source addresses
net.ipv4.conf.all.accept_redirects = 0      # ignore ICMP redirects (and for IPv6)
net.ipv4.conf.all.send_redirects = 0        # a server is not a router
net.ipv4.conf.all.accept_source_route = 0   # ignore source routing
net.ipv4.conf.all.log_martians = 1          # log packets that should not exist
kernel.kptr_restrict = 2                    # hide kernel addresses
kernel.dmesg_restrict = 1                   # only root reads the kernel log
kernel.yama.ptrace_scope = 1                # processes can't inspect unrelated processes
kernel.sysrq = 0                            # no magic SysRq keys
fs.protected_symlinks = 1                   # classic /tmp link attacks
fs.protected_hardlinks = 1
fs.suid_dumpable = 0                        # no core dumps from privileged programs
```

Apply with `sudo sysctl --system`, and check one value with `sysctl net.ipv4.conf.all.rp_filter`. None of these
change how a normal web or mail server behaves; they only refuse things a normal server never needs.

## 5. Keep SELinux on

Rocky Linux comes with SELinux in enforcing mode. The common advice in old tutorials is to turn it off when
something doesn't work. Don't. SELinux is what stops a compromised web process from reading files that have
nothing to do with it.

When SELinux blocks something, it is usually telling you that a file is in an unexpected place. My one real case:
a systemd unit that watches a folder for new app releases didn't fire when the folder was under `/srv`. Moving it
under `/var/lib`, where service data normally lives and has the matching label, fixed it without weakening
anything. When you do need to look, `sudo ausearch -m avc -ts recent` shows what was denied and why.

## 6. Security updates on their own

Most break-ins don't use clever new attacks; they use old holes that were never patched. I let the server install
**security** updates by itself, and leave everything else for when I'm watching:

```ini
# /etc/dnf/automatic.conf (excerpt)
[commands]
upgrade_type = security
download_updates = yes
apply_updates = yes
reboot = never
```

```bash
sudo systemctl enable --now dnf-automatic.timer
```

Kernel updates only take effect after a reboot, and I don't want the server rebooting itself. So my health check
(below) warns me when a reboot has been waiting for more than seven days, and I reboot at a quiet time.

## 7. Every app as its own user

The most useful rule after SSH: **no app runs as root, and no two apps share a user.** Each app I run has its own
system user with no login shell, and its containers run under that user with **rootless Podman**:

- the chat app runs as one user, the approval-flow app as another (the small contact-form service for these
  websites runs rootless under my own user);
- each has its own database container and its own secrets, stored as Podman secrets, never in files in the
  repository;
- their services listen on `127.0.0.1` only, and the web server (Caddy) in front of them is the only thing facing
  the internet.

If one app is broken into, the attacker is an unprivileged user who can't read the others' data or secrets. The
one exception on my server is the mail system (Mailcow), which needs Docker with root. It was the only choice for
that software, so I keep it to that one system and don't put anything else in Docker.

## 8. Strict headers on every site

Caddy gets HTTPS certificates automatically. On top of that, every site sends the same security headers from one
shared snippet:

- **HSTS** for a year, so browsers never fall back to plain HTTP;
- **`X-Content-Type-Options: nosniff`** and a **referrer policy**;
- a strict **Content Security Policy**: scripts, styles, fonts and images only from the site itself. This site has
  no inline scripts and no third-party resources; the one exception, statistics, loads only after the visitor
  allows it;
- **`X-Frame-Options: DENY`**, so no other site can frame these pages;
- the `Server` header removed.

A strict CSP is more work while building a site, because every script must be a file. Its payoff is that a
script someone manages to inject simply doesn't run.

## 9. Know when something is wrong

Hardening is only half of it; the other half is noticing when something breaks. On my server:

- **The server's logs** go to the systemd journal, kept for 30 days or 2 GB at most, whichever comes first. Enough to look
  into a problem, without keeping data about visitors longer than needed.
- **A health check every 15 minutes** checks disk and memory, every service and app, certificate expiry (14 days
  ahead), the backups' age, a pending reboot, the websites and the contact form. It emails me when a problem
  appears, every 12 hours while it lasts, and once when it is fixed.
- **A weekly report** every Monday: updates waiting, the last seven backups, security events, mail, and traffic.
- **A failed systemd unit** emails me its last log lines automatically.
- **Backups** with restic every night, encrypted, with an outside service that alerts me if one doesn't report in.

### What is still open

Honesty about the gaps matters as much as the list above. Two are still open on my server:

- **The backups are on the same server.** If the provider account or the disk is lost, the backups go with it. An
  off-site copy to a second server is planned. Until then, this is the biggest risk, and it is written down as
  such.
- **The alerts are sent by the server itself.** If the whole server is down, nothing tells me. An outside uptime
  monitor that emails an address on another system is the fix.

## The checklist

1. Admin user with `sudo` and an SSH key; test it in a second session.
2. SSH: keys only, no root, `AllowUsers`; check with `sshd -T`.
3. Reboot once and check again (cloud-init and provider scripts).
4. Machine keys restricted to one folder with `rrsync`.
5. Firewall: open services by name; databases on `127.0.0.1` only.
6. fail2ban with increasing bans and `recidive`; your own address in `ignoreip`.
7. `sysctl` hardening in one file.
8. SELinux (or AppArmor) left on.
9. Automatic security updates; reboots on your schedule.
10. One user per app, rootless containers, secrets outside the code.
11. HTTPS with HSTS and a strict Content Security Policy.
12. Logs with a time limit, a health check, alerts, and backups that live somewhere else.

The same server also runs my email; the DNS side of that is in
[Running your own email: DNS, SPF, DKIM and DMARC explained](/notes/running-your-own-email/).
