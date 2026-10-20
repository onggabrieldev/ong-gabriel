---
title: Deploy domain
tags:
  - deploy
aliases:
  - Domain
  - DNS
---

# Deploy domain

How the domain reaches the VPS, for [[deploy|Deploy]]. `<domain>` is the apex, such as `example.org.br`, without `www`.

## Terms

- **Registrar**: where the domain is bought and renewed. `.br` domains are at Registro.br.
- **Nameservers**: the servers that answer DNS for the domain. The registrar points to them. Whoever runs them is where you edit records.
- **A record**: a name to an IPv4 address. **AAAA**: a name to an IPv6 address.
- **CNAME**: a name to another name. `www` → `<domain>`.
- **MX** and **TXT**: email and verification. Do not touch them unless you know what they serve.
- **TTL**: how long resolvers cache an answer, in seconds. A change can take that long to show up everywhere.

## Records

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| A | `@` | VPS IPv4 | 300 |
| CNAME | `www` | `<domain>` | 300 |

`@` means the apex itself.

Delete any other `A` or `AAAA` on `@` and `www`, such as a parking page. Let's Encrypt can check either address. A leftover `AAAA` that points elsewhere fails validation.

Add `AAAA @` with the VPS IPv6 only after `curl -6 https://<domain>` works from a machine with IPv6.

If the zone has a `CAA` record, it must allow `letsencrypt.org`.

## Where to edit

First find who runs the nameservers:

```sh
nslookup -type=ns <domain>
```

### Hostinger nameservers

`ns1.dns-parking.com` and `ns2.dns-parking.com`. In hPanel, open **Domains**, pick the domain, and open its DNS records. Edit the records in [[#Records]]. Hostinger often creates a default `A @` and a `www` record: replace them.

### Registro.br

In the Registro.br panel, open the domain, then DNS. Two choices:

- Keep Registro.br's DNS and edit the zone there with the records in [[#Records]].
- Change the nameservers to Hostinger's and edit the records in hPanel. Copy the `MX` and `TXT` records into hPanel **before** the change, or email for the domain stops.

### Cloudflare

Start with the records on **DNS only** (grey cloud). Caddy then gets its own certificate. If you turn on the proxy later, set SSL/TLS to **Full (strict)**.

## Check

Ask a public resolver, not your cached one:

```sh
nslookup <domain> 1.1.1.1
nslookup www.<domain> 8.8.8.8
```

Both must answer with the VPS IPv4. Then run the first release. See [[deploy#From zero]].
