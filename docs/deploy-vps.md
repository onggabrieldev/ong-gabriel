---
title: Deploy VPS
tags:
  - deploy
aliases:
  - VPS
---

# Deploy VPS

The server setup for [[deploy|Deploy]], from a new Hostinger VPS. Commands in `<>` are values to fill in. Run them in order.

Hostinger's panel is hPanel. Menu names change. The steps name what to find, not the exact path.

## 1. Install the OS

In hPanel, open the VPS and choose the operating system.

- Pick **Ubuntu 24.04 LTS** without a control panel. The "Ubuntu 24.04 with Docker" template also works: skip [[#6. Install Docker]].
- Set a strong root password and keep it in a password manager. It is the fallback through Hostinger's browser terminal.
- Note the VPS **IPv4** and **IPv6** from the overview page. [[deploy-domain|Domain]] needs them.

## 2. Personal SSH key

On your own computer (PowerShell, macOS, or Linux):

```sh
ssh-keygen -t ed25519 -C "<your email>"
```

It writes `~/.ssh/id_ed25519` (private, never shared) and `~/.ssh/id_ed25519.pub` (public). Add the public key in hPanel under SSH keys, or copy it in the next step.

## 3. First login and updates

```sh
ssh root@<ipv4>
apt update && apt full-upgrade -y
timedatectl set-timezone America/Sao_Paulo
reboot
```

## 4. Admin user

Log in as root again and create your own user with `sudo`:

```sh
adduser <you>
usermod -aG sudo <you>
install -d -m 700 -o <you> -g <you> /home/<you>/.ssh
cp ~/.ssh/authorized_keys /home/<you>/.ssh/
chown <you>:<you> /home/<you>/.ssh/authorized_keys
```

If root has no `authorized_keys` yet, paste your public key into `/home/<you>/.ssh/authorized_keys` instead.

Open a **second** terminal and check `ssh <you>@<ipv4>` and `sudo -v`. Keep the root session open until that works.

## 5. Lock down SSH

```sh
sudo tee /etc/ssh/sshd_config.d/10-hardening.conf > /dev/null <<'EOF'
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
EOF
sudo sshd -t && sudo systemctl reload ssh
```

sshd keeps the first value it reads, and it reads `sshd_config.d/` in name order. `10-` wins over the `50-cloud-init.conf` that some images ship with `PasswordAuthentication yes`.

Test a new login in another terminal before you close the current one. If you lock yourself out, use the browser terminal in hPanel.

### Firewall

```sh
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw enable
```

Add the same rules in the VPS firewall in hPanel (TCP 22, 80, 443 and UDP 443). That one filters before traffic reaches the server.

> [!warning] Docker skips ufw
> A port published with `ports:` in `compose.yaml` is open to the internet even when ufw denies it. Only Caddy publishes ports. Never publish a database or the API port. Use `expose:` for anything internal.

### Automatic security updates

```sh
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 6. Install Docker

From Docker's own repository. Ubuntu's `docker.io` package lags behind.

```sh
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo docker run --rm hello-world
```

## 7. Deploy user

GitHub Actions logs in as `deploy`. That user only runs Docker in `/opt/ong-gabriel`.

```sh
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG docker deploy
sudo install -d -o deploy -g deploy /opt/ong-gabriel
sudo install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
```

> [!warning] The docker group is root
> A member of `docker` can get root on the host. Keep the `deploy` key only in the GitHub `production` environment.

### Deploy key

On your own computer, make a key only for GitHub Actions, without a passphrase:

```sh
ssh-keygen -t ed25519 -N "" -C "github-actions-deploy" -f ong-gabriel-deploy
```

Put the **public** half on the VPS:

```sh
sudo tee /home/deploy/.ssh/authorized_keys < ong-gabriel-deploy.pub   # or paste its line with an editor
sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

Check it from your computer with `ssh -i ong-gabriel-deploy deploy@<ipv4> docker ps`.

The **private** half goes into the GitHub secret `VPS_SSH_KEY`. See [[deploy-github|GitHub]]. Delete the local copy after that.

### Host key

GitHub Actions has to trust the VPS host key. On your computer:

```sh
ssh-keyscan -t ed25519 <ipv4>
```

The output line is the `VPS_KNOWN_HOSTS` variable. Compare its fingerprint with the one the VPS reports, so nobody in between swapped it:

```sh
ssh-keyscan -t ed25519 <ipv4> | ssh-keygen -lf -     # on your computer
sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub  # on the VPS
```

## 8. Environment file

```sh
sudo -u deploy tee /opt/ong-gabriel/.env > /dev/null <<'EOF'
SITE_DOMAIN=<domain without www>
ACME_EMAIL=<email that gets certificate notices>
WEB_TAG=
EOF
sudo chmod 600 /opt/ong-gabriel/.env
```

The other files arrive with the first release. See [[deploy#Release flow]].
