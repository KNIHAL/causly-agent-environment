---
sidebar_position: 5
---

# Docker

18 tools wrapping the Docker CLI — cross-platform by design. Implemented in `tools/dockerOps.js`.

## Setup

No API key required. The server tries plain `docker` first — this covers macOS, Linux, and
Windows with Docker Desktop. If that fails and you're on Windows, it automatically falls back to
`wsl docker ...`, covering setups where Docker only exists inside WSL (no Docker Desktop
installed). Windows-style paths (`D:\...`) passed to `docker_build`, `docker_run` (volumes), or
`docker_compose_up`/`down` are automatically translated to their WSL equivalent
(`/mnt/d/...`) when the WSL fallback is used. For Compose, the folder is passed to `wsl --cd` as an argument of its own and never inside a shell command, so quotes, `;` or `$(...)` in a folder name cannot run anything.

## Tools

| Tool | Risk | What it does |
|---|---|---|
| `docker_version` | READ | Connectivity check |
| `docker_ps` | READ | List containers |
| `docker_images` | READ | List images |
| `docker_build` | HIGH | Build an image from a Dockerfile |
| `docker_run` | HIGH | Run a new container |
| `docker_stop` | HIGH | Stop a running container |
| `docker_start` | LOW | Start a stopped container |
| `docker_restart` | HIGH | Restart a container |
| `docker_remove` | DESTRUCTIVE | Remove a container |
| `docker_remove_image` | DESTRUCTIVE | Remove an image |
| `docker_logs` | READ | Get logs from a container |
| `docker_inspect` | READ | Full JSON metadata for a container/image |
| `docker_exec` | HIGH | Run a command inside a running container |
| `docker_stats` | READ | Live CPU/memory snapshot |
| `docker_push` | HIGH | Push an image to a registry |
| `docker_pull` | MEDIUM | Pull an image from a registry |
| `docker_compose_up` | HIGH | `docker compose up` for a project directory |
| `docker_compose_down` | HIGH | `docker compose down` for a project directory |

## Workspace limit

With [`CAUSLY_WORKSPACE`](../security.md#workspace-limit) set, Docker mounts must stay inside it:

- `docker_run`: the host folder of every entry in `volumes` must be inside the workspace. Named and
  anonymous volumes are fine. A path with a variable (`$HOME/x`) is blocked because it cannot be checked.
- `docker_compose_up`: the Compose project, as `docker compose config` resolves it, may only use bind
  mounts, host-backed volumes, build contexts and secret or config files inside the workspace. If the
  file cannot be read, the call is blocked. This needs Docker Compose v2.
- On Windows with Docker in WSL, `/mnt/d/...` is read as `D:\...`. Other Linux paths (`/etc`,
  `/var/run/docker.sock`) are outside every Windows workspace.
- The image, container, target and build-folder arguments cannot start with `-`, so a value cannot
  be read as a Docker option.

Without a workspace limit nothing changes. Shell commands run with `run_command` are not inspected.
See [Security](../security.md#docker-mounts-and-compose-files) for the details and the limits.

## Example

```
"Build the image in ./app as myapp:latest, then run it detached on port 8080."
```

Claude calls `docker_build` (confirm: true) → `docker_run` with `ports: ["8080:80"]`.
