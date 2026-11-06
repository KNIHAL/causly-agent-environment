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

The key must be exactly 64 hexadecimal characters (32 bytes). A key that is shorter, longer, not
hex, or has extra characters after the 64 is rejected with a clear message, and nothing is written.
The same rule applies to `SECRETS_MASTER_KEY_NEW`.

Every tool also accepts an optional `store_path` to use a different store file. Three rules apply:

- **Allowed folders only.** The path must be inside Causly's data folder (`~/.causly`, or the
  repository folder in a git checkout) or inside a `CAUSLY_WORKSPACE` folder. Anything else is
  refused, including `../` tricks and symlinks that lead out. Leave `store_path` out to use the
  default store.
- **Only real stores.** If the file already exists, every entry in it must look like a Causly secret.
  A `package.json`, an `.env` or any other file is refused and left untouched, so `secrets_set`
  cannot be used to overwrite it.
- **Protected paths.** System folders and credential folders (such as `~/.ssh` or `~/.aws`) are
  refused, and the check follows symlinks to the real location. See
  [Protected paths](../security.md#protected-paths).

Every write goes to a temporary file in the same folder and is renamed over the store. If a write or
a key rotation fails part-way, for example because one entry cannot be decrypted, the old store stays
exactly as it was.

## Tools

| Tool | Risk | What it does |
|---|---|---|
| `secrets_set` | HIGH | Store an encrypted secret by name |
| `secrets_get` | HIGH | Retrieve and decrypt a secret by name. The value is returned to the agent, so it needs `confirm: true` |
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
