---
sidebar_position: 7
---

# Secrets manager

6 tools for a local, encrypted secrets store — no external vault service required. Implemented
in `tools/secretsOps.js`.

## Why local instead of Vault/AWS Secrets Manager

This server is designed to work identically no matter what you're hosting on — a local encrypted
file has no dependency on which cloud (or no cloud) your project lives on, and there's nothing
extra to provision or pay for.

## Setup

Generate a master key and save it:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
causly-server keys set SECRETS_MASTER_KEY
```

Paste the generated value at the hidden prompt. **Keep a copy somewhere safe.** If you lose the
master key, the stored secrets cannot be recovered.

Secrets are stored AES-256-GCM encrypted in `~/.causly/.causly-secrets.enc`. Never commit or share
this file.

## Tools

| Tool | Risk | What it does |
|---|---|---|
| `secrets_set` | HIGH | Store an encrypted secret by name |
| `secrets_get` | MEDIUM | Retrieve and decrypt a secret by name |
| `secrets_list` | READ | List secret names (never values) |
| `secrets_delete` | DESTRUCTIVE | Delete a secret |
| `secrets_rotate_key` | HIGH | Re-encrypt every secret under a new master key |
| `secrets_generate_key` | LOW | Generate a new random 32-byte key |

## Rotating the master key

1. `secrets_generate_key` to get a new key
2. Save it with `causly-server keys set SECRETS_MASTER_KEY_NEW`
3. Call `secrets_rotate_key`. Every stored secret is re-encrypted under the new key
4. Save the new key as `SECRETS_MASTER_KEY` and remove the temporary one with
   `causly-server keys unset SECRETS_MASTER_KEY_NEW`

Key changes are picked up on the next tool call, so no restart is needed.

This exact flow was live-tested end to end, including verifying decryption still works correctly
after rotation.
