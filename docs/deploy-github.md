---
title: Deploy GitHub
tags:
  - deploy
aliases:
  - GitHub
---

# Deploy GitHub

Repository settings for [[deploy|Deploy]] in `onggabrieldev/ong-gabriel`. The repository is public: anyone can read the workflow logs, so nothing secret is printed.

## Branch rules

**Settings → Rules → Rulesets → New branch ruleset**

- Target: the default branch.
- Require a pull request before merging.
- Require status checks to pass: `Lint and test`.
- Block force pushes. Restrict deletions.

A merge to `main` is a release, so this is the gate.

## Actions

**Settings → Actions → General**

- Workflow permissions: **Read repository contents**. `deploy.yml` asks for `packages: write` only in the job that pushes the image.
- Fork pull requests: require approval for outside contributors. Workflows from a fork never see the `production` secret.

## Production environment

**Settings → Environments → New environment** named `production`.

- Deployment branches: **Selected branches**, only `main`.
- Required reviewers: optional. With a reviewer, each release waits for a click in the Actions tab.

Secret:

| Name | Value |
| --- | --- |
| `VPS_SSH_KEY` | The whole private deploy key, `-----BEGIN` to `END-----`. See [[deploy-vps#Deploy key]]. |

Variables:

| Name | Value |
| --- | --- |
| `VPS_HOST` | VPS IPv4 |
| `VPS_USER` | `deploy` |
| `VPS_KNOWN_HOSTS` | The `ssh-keyscan` line. See [[deploy-vps#Host key]]. |
| `SITE_DOMAIN` | `<domain>`, used for the environment link |

`GITHUB_TOKEN` is created per job. It pushes the image and logs the VPS into GHCR for the pull.

## Package visibility

The first release creates the package `ghcr.io/onggabrieldev/ong-gabriel/web` under the organization's **Packages**. It is private by default. Deploy works either way, because `release.sh` logs in with the job token.

To pull by hand on the VPS, make the package public (**Package settings → Change visibility**) or run `docker login ghcr.io` with a classic token that has only `read:packages`. The image holds the public site and no secrets.

## Updates

**Settings → Code security**: turn on Dependabot alerts and security updates. A Next.js or React advisory then opens a pull request. Merging it deploys the fix.
