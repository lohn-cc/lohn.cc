---
title: "Running your own email: DNS, SPF, DKIM and DMARC explained"
seo_title: "Own email: SPF, DKIM, DMARC and MTA-STS"
description: "The DNS records a self-hosted mail server needs, and why: reverse DNS, MX, SPF, DKIM, DMARC, MTA-STS, TLS reports and DNSSEC, with the real records for lohn.cc."
date: 2026-10-12T21:22:00+07:00
draft: false
slug: "running-your-own-email"
keywords: ["self-hosted email", "SPF", "DKIM", "DMARC", "MTA-STS", "TLS-RPT", "DNS", "Mailcow"]
---

I run email for two domains, lohn.cc and vangera.systems, on one server I manage myself: Mailcow, on a virtual
server, behind the same web server that serves this site. Installing the mail software is the easy part. Whether
your messages reach an inbox, and whether nobody else can send mail in your name, is decided almost entirely
in DNS.

This note goes through each record in the order I would set them up, what it does, and the real value I use.
Everything here is public: anyone can look these records up with `dig`.

## Before any DNS: the server's own name

A receiving server's first question is "who is connecting?" It looks up the reverse DNS (PTR) of the address the
connection comes from. If that name doesn't exist, or doesn't match the name the server says hello with, many
providers treat the mail as suspicious before reading a single header.

So three names must agree:

- the server's hostname: `mail.lohn.cc`;
- the **A** and **AAAA** records of `mail.lohn.cc`, pointing to the server's IPv4 and IPv6 addresses;
- the **PTR** records of both addresses, pointing back to `mail.lohn.cc`.

The PTR record is not set in your domain's DNS but by whoever owns the IP address, usually in your hosting
provider's control panel. Don't forget IPv6: if the server has an IPv6 address, it will send over IPv6 to
providers that support it, and a missing IPv6 PTR is a common reason for rejected mail.

```bash
dig +short -x <your IPv4 address>
# mail.lohn.cc.
```

## MX: where mail for the domain goes

```text
lohn.cc.   MX   10 mail.lohn.cc.
```

One mail server, one MX record. The number is a priority; it only matters when you have more than one. The MX must
point to a name with A/AAAA records, never to an IP address or to a CNAME.

## SPF: which servers may send for the domain

SPF is a TXT record on the domain itself listing the servers allowed to send mail with that domain in the
envelope sender:

```text
lohn.cc.   TXT   "v=spf1 mx -all"
```

- `mx` means "the servers in my MX records may send". Because my server both receives and sends, that one word
  covers it.
- `-all` means "nothing else may". The softer `~all` asks receivers to accept but mark; I use `-all` because I
  know every place my mail comes from.

Two things to watch:

- **Only one SPF record per domain.** Two `v=spf1` records make SPF fail entirely. When you add a service that
  sends for you (a newsletter tool, a ticketing system), you add it to the one record.
- **At most 10 DNS lookups.** Each `include:`, `a`, `mx` and `redirect` costs lookups when a receiver checks it.
  Long chains of `include:` from many services can go past the limit, and then SPF fails. Keeping it to `mx`
  avoids the problem.

SPF alone has a weakness: it checks the hidden envelope sender, not the `From:` address people see. That gap is
what DMARC closes, with help from DKIM.

## DKIM: a signature on every message

With DKIM the sending server signs each message with a private key, and publishes the matching public key in DNS.
The receiver fetches the key, checks the signature, and so knows the message was not changed on the way and came
from a server holding the key.

The key lives under a *selector*, a name you choose, so you can have several keys and rotate them. Mailcow
generates the key pair; my selector is `dkim`, so the public key is at:

```text
dkim._domainkey.lohn.cc.   TXT   "v=DKIM1;k=rsa;t=s;s=email;p=MIIBIjANBgkqhkiG9w0BAQEFAAOC…"
```

- `k=rsa` and the long `p=` value: a 2048-bit RSA public key. Use 2048 bits; 1024-bit keys are considered weak.
- `t=s` (strict): the key may only sign for exactly `lohn.cc`, not for subdomains.
- `s=email`: the key is only for email.

A 2048-bit key is longer than the 255 characters one TXT string may hold. DNS providers handle that by splitting it
into several strings in the same record; if you paste it by hand, check that the provider did not cut it off.

## DMARC: what to do when checks fail, and reports

DMARC ties the two together. A message passes DMARC when SPF **or** DKIM passes **and** the domain it passed for
*aligns* with the domain in the visible `From:` address. The record also tells receivers what to do with mail that
fails, and where to send reports.

```text
_dmarc.lohn.cc.   TXT   "v=DMARC1; p=quarantine; adkim=s; aspf=s; rua=mailto:postmaster@lohn.cc"
```

- `p=quarantine`: mail that fails goes to spam. The three steps are `p=none` (only report), `p=quarantine` and
  `p=reject` (refuse it outright).
- `adkim=s; aspf=s`: strict alignment. The DKIM and SPF domains must equal `lohn.cc` exactly, not just share the
  same parent domain. Fine when one server sends everything.
- `rua=`: where receivers send their daily aggregate reports, XML files listing which servers sent mail in your
  name and whether it passed.

**Read the reports before tightening the policy.** That is what they are for: they show you a forgotten system
sending in your name before a strict policy sends its mail to spam. lohn.cc is at `quarantine` now; my plan is to move
to `reject` only after a few more weeks of clean reports for both domains.

### A mistake worth knowing: reports to another domain

For a while, vangera.systems sent its DMARC reports to an address at lohn.cc. No reports ever came. The reason is
in the DMARC standard: when the report address is in **another domain**, receivers first check that the other
domain agrees to receive them, with a TXT record like this in the receiving domain:

```text
vangera.systems._report._dmarc.lohn.cc.   TXT   "v=DMARC1"
```

Without it, receivers quietly skip the reports. The simplest fix, and the one I chose, is to give each domain a
report address of its own (`postmaster@` that domain). If you send reports to a reporting service, the service
publishes that record for you.

## MTA-STS: no more unencrypted delivery

Mail servers talk to each other over SMTP on port 25, upgrading to TLS with STARTTLS when both sides support it.
The weakness: an attacker in the middle can remove the offer of TLS, and the sending server falls back to plain
text without complaint.

MTA-STS lets you tell senders "my server always supports TLS, with a valid certificate for this name; if you can't
get that, don't deliver". It has two parts:

1. A TXT record announcing a policy and its version:

   ```text
   _mta-sts.lohn.cc.   TXT   "v=STSv1; id=202610110816"
   ```

2. The policy itself, served over HTTPS at a fixed address, `https://mta-sts.lohn.cc/.well-known/mta-sts.txt`:

   ```text
   version: STSv1
   mode: enforce
   mx: mail.lohn.cc
   max_age: 604800
   ```

`mode: enforce` means "refuse to deliver without valid TLS"; start with `mode: testing`, which only reports.
`max_age` is how long senders remember the policy, here one week. The `id` is any string that changes whenever the
policy changes: senders only fetch the policy again when they see a new id. I use the date and time of the change.

Because senders cache the policy, **changing the mail server's name or certificate needs planning**: switch the
policy back to `testing`, change the id, wait at least `max_age`, and only then make the change. Otherwise senders
holding the old policy refuse to deliver.

On my server the web server (Caddy) serves the policy file from its own configuration, so there is nothing else to
run.

## TLS-RPT: reports about encryption problems

The companion of MTA-STS: a place for senders to report when they could not set up TLS with you.

```text
_smtp._tls.lohn.cc.   TXT   "v=TLSRPTv1; rua=mailto:postmaster@lohn.cc"
```

On a small domain these reports are rare. Their value is the day something goes wrong, for example an expired
certificate on port 25, and a large provider tells you before your users do.

## DNSSEC: making the answers trustworthy

All of the records above are only as reliable as DNS itself. DNSSEC signs the zone, so resolvers can tell a real
answer from a forged one. For lohn.cc and vangera.systems I turned it on at each domain's DNS host and added the DS
record at each registrar. You can check it with a validating resolver: the answer carries the `ad` (authenticated
data) flag.

```bash
dig +dnssec lohn.cc MX @1.1.1.1
# ;; flags: qr rd ra ad; ...
```

## Checking it all

A few commands I use to check the records from outside:

```bash
dig +short lohn.cc MX
dig +short lohn.cc TXT                     # SPF
dig +short dkim._domainkey.lohn.cc TXT     # DKIM public key
dig +short _dmarc.lohn.cc TXT
dig +short _mta-sts.lohn.cc TXT
curl -s https://mta-sts.lohn.cc/.well-known/mta-sts.txt
```

And the certificate the server offers on port 25, which is the one MTA-STS checks:

```bash
openssl s_client -connect mail.lohn.cc:25 -starttls smtp -servername mail.lohn.cc </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -enddate
```

My server runs a health check every 15 minutes that, among other things, makes this port-25 check for every IPv4
and IPv6 address of `mail.lohn.cc`. An expired or wrong certificate there is easy to miss, because web browsers
never see it.

Finally, send a message to an account at a large provider and open its full headers ("Show original" or similar).
You want to see `spf=pass`, `dkim=pass` and `dmarc=pass`.

## The short version

| Record | Name | Value for lohn.cc |
|---|---|---|
| PTR | your IP addresses | `mail.lohn.cc` (set at the hosting provider) |
| MX | `lohn.cc` | `10 mail.lohn.cc` |
| SPF | `lohn.cc` | `v=spf1 mx -all` |
| DKIM | `dkim._domainkey.lohn.cc` | `v=DKIM1;k=rsa;t=s;s=email;p=…` |
| DMARC | `_dmarc.lohn.cc` | `v=DMARC1; p=quarantine; adkim=s; aspf=s; rua=…` |
| MTA-STS | `_mta-sts.lohn.cc` + policy file | `v=STSv1; id=…`, `mode: enforce` |
| TLS-RPT | `_smtp._tls.lohn.cc` | `v=TLSRPTv1; rua=…` |
| DNSSEC | the zone, DS at the registrar | signed |

Set them up in that order, keep DMARC at `none` or `quarantine` until the reports are clean, start MTA-STS in
`testing`, and read the reports that arrive. If people use the mailboxes on phones and computers, the next step is
setting up their mail apps; I wrote a guide for the mailboxes I host at
[Vangera Systems: email setup](https://www.vangera.systems/email-setup/).
