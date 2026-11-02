---
sidebar_position: 1
---

# Development

Causly Server is open source under the MIT license. This page explains how to run it from a
checkout, how the code is organized, and how to add a tool pack.

Please read the [Code of Conduct](https://github.com/KNIHAL/causly-server/blob/master/CODE_OF_CONDUCT.md)
and [CONTRIBUTING.md](https://github.com/KNIHAL/causly-server/blob/master/CONTRIBUTING.md) before
you open a pull request.

## Set up a checkout

You need Node.js 22.13 or newer.

```bash
git clone https://github.com/KNIHAL/causly-server.git
cd causly-server
npm install
cp .env.example .env     # add keys for the services you are working on
npm run setup            # same as: causly-server init, pointed at this checkout
npm run doctor           # check the setup
```

When you run from a checkout, the `.env` in the repository is used, and logs and the secrets
store stay in the repository folder. See [Environment variables](./configuration.md).

After a change, restart your editor and exercise the tool through a real conversation.

## Repository layout

```text
causly-server/
├── index.js            Server entry: registers resources, prompts and packs, then connects stdio
├── bin/causly.js       The CLI (init, setup, keys, doctor, status, toolsets, backup, ...)
├── packs/              One file per tool pack, plus the registry and the manifest
│   ├── registry.js     Every pack: name, description, core or on-demand
│   ├── loader.js       Loads packs on demand
│   └── manifest.json   Generated list of every tool, used by search_tools
├── tools/              The implementation behind each pack (xxxOps.js) and shared modules
│   ├── toolWrapper.js  The pipeline every tool call runs through
│   ├── security.js     Permission levels, redaction, risk scanning
│   ├── workspace.js    The workspace limit
│   ├── services.js     Per-service setup and live key checks
│   └── store.js        The local SQLite database
├── prompts/            MCP prompts
├── scripts/            build-manifest.mjs, agent-smoke.mjs
├── tests/              One test file per module (vitest)
└── .github/             CI workflows and Dependabot
```

## Tests

```bash
npm test                      # the full suite (vitest)
npm run test:boundaryattest   # only the BoundaryAttest tests
node scripts/agent-smoke.mjs  # connect a plain MCP client and call tools end to end
```

CI runs on every pull request:

- **cross-os** runs the unit tests and the agent smoke test on Ubuntu, macOS and Windows with
  Node.js 22 and 24, then installs the published package and runs `causly-server doctor`. The
  unit tests include the package contents check described below.
- **ci** checks the syntax of every file and that the server boots (Node.js 22 and 24), runs the
  BoundaryAttest tests, audits the production dependencies, and runs the docs drift test.

CI installs with `npm ci` everywhere, so it uses exactly the versions in `package-lock.json`.

### Automatic checks

- **Dependency audit.** `npm audit --omit=dev --audit-level=high` fails the build when a
  production dependency has a high or critical vulnerability. Run the same command yourself.
- **Dependabot.** `.github/dependabot.yml` opens weekly pull requests for npm packages and for
  GitHub Actions.
- **Package contents** (`tests/packageContents.test.js`). Runs `npm pack --dry-run` and fails if
  the package holds anything outside the `files` list in `package.json`, or any `.env` file (other
  than `.env.example`), database, log, key or `.enc` file.
- **Docs drift** (`tests/docsDrift.test.js`). Every tool in `packs/manifest.json` must appear on a
  tools page, every tool a page lists must exist, and the risk level on a page must match
  `tools/security.js`. The docs live in the docs repository, so the test needs both repositories
  side by side. Locally it looks for a folder named `agenv` next to `causly-server`, or you can
  point it at the docs yourself:

```bash
CAUSLY_DOCS_DIR=../agenv/website/docs/server npx vitest run tests/docsDrift.test.js
```

  CI checks out the docs repository and sets `CAUSLY_REQUIRE_DOCS=1`, so the test fails instead of
  being skipped when the docs are missing. When you change a tool or its risk level, change its
  docs page in the same piece of work, and merge the docs change first or together with the code.
- **Docs site links.** The docs site build fails on a broken page link or a broken anchor
  (`onBrokenLinks` and `onBrokenAnchors` are `throw`). Run `npm run build` in `website/` before you
  push docs.

Please also test by hand before you merge a new or changed tool:

1. Connect your editor to your working copy.
2. Restart the editor and exercise the tool in a real conversation.
3. Run `causly-server doctor --test`.
4. Check `logs/activity.log` to confirm the call succeeded and was logged as expected.

## Add a tool pack

A pack is a group of tools for one integration or job. Adding one touches five places.

**1. Write the operations in `tools/yourServiceOps.js`.** One exported async function per
operation, taking one destructured object and returning a small plain object. Do not leak raw API
response shapes.

```js
import { requireEnv } from "./envLoader.js"; // read the key and fail with a clear message

export async function listThings({ limit = 25 }) {
  // call the API, then map the result to a minimal object
}
```

**2. Register the tools in `packs/yourService.js`.** Wrap each function so it gets the safety
layer, logging and error hints for free.

```js
import { z } from "zod";
import { wrap } from "../tools/toolWrapper.js";
import * as ops from "../tools/yourServiceOps.js";

export default function register(server) {
  server.registerTool(
    "yourservice_list_things",
    {
      description: "List things. Say what comes back and what is untrusted.",
      inputSchema: { limit: z.number().optional().describe("1-100, default 25") },
    },
    wrap("yourservice_list_things", ops.listThings)
  );
}
```

Keep descriptions short and concrete. They are what the agent reads. If a tool returns text
written by other people, say so in the description so the agent treats it as data.

**3. Add the pack to `packs/registry.js`** with a one-line `description` and `core: false`.

**4. Set permission levels in `tools/security.js`.** Give every tool a level (`READ`, `LOW`,
`MEDIUM`, `HIGH` or `DESTRUCTIVE`). A tool without one defaults to `MEDIUM`. Anything that sends
something to other people or cannot be undone should be `HIGH` or `DESTRUCTIVE`, and accept a
`confirm` argument.

**5. Add setup support if it needs a key.** Describe the service in `tools/services.js` so
`causly-server setup yourservice` and `doctor --test` work, and add the variable to
`.env.example`.

Then:

```bash
npm run build:manifest   # regenerate packs/manifest.json so search_tools finds your tools
npm test
```

`npm publish` runs the manifest build and the tests automatically (`prepublishOnly`).

Also write a test in `tests/`, and a docs page under `website/docs/server/tools/` with the tools
table, setup, behavior and limits. Look at an existing page such as [Linear](./tools/linear.md)
for the format. The docs drift test fails until the tools on the page match the manifest and their risk levels match `tools/security.js`.

## Pull requests

- Keep each pull request to one feature or fix.
- Describe what you changed, why, and how you tested it.
- Update the docs page for any tool you add or change.
- Open an issue first for anything large, so the approach can be agreed before you build it.

## Reporting a security issue

Please do not open a public issue. Follow
[SECURITY.md](https://github.com/KNIHAL/causly-server/blob/master/SECURITY.md).
