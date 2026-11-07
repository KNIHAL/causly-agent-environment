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
- **Annotations and stdout** (`tests/annotations.e2e.test.js`, `tests/stdout.e2e.test.js`). Start the
  server over stdio with every pack loaded and check that all tools have the four annotations, a
  description and an object schema, that `READ` tools are never destructive, and that stdout holds
  only JSON-RPC lines (a stray `console.log` would corrupt the protocol; log to stderr).
- **Upgrade test** (`tests/upgrade.migration.test.js`). Opens a database written by the real 1.5.0
  (`tests/fixtures/db-1.5.0/`) and checks that pipeline, meetings, action items and reminders are
  intact and that old migrations are not run again. It also covers a corrupt database, `.env`,
  secrets file and editor config. Never edit the fixture: when the schema changes in a release, add
  a new fixture for that release.
- **Release metadata** (`tests/releaseMetadata.test.js`). `package.json`, `server.json` and the
  changelog must agree on the version, and the publish workflow must use provenance.
- **Docs site links.** The docs site build fails on a broken page link or a broken anchor
  (`onBrokenLinks` and `onBrokenAnchors` are `throw`). Run `npm run build` in `website/` before you
  push docs.

### Fuzz tests for paths and shell arguments

Any tool argument that reaches a path or a shell must survive hostile values. The helper in
`tests/helpers/fuzz.js` gives you the values and the checks:

```js
import { FUZZ_VALUES, injectionPayloads, asFileName, makeSandbox, attempt, expectNoEvaluation } from "./helpers/fuzz.js";

const box = await makeSandbox();                       // box.ws is the workspace, box.sentinel must never appear
const values = [...FUZZ_VALUES, ...injectionPayloads(box.sentinel)];
for (const { value } of values) await attempt(() => yourTool({ name: value }));
await expectNoEvaluation(box);                          // nothing evaluated, nothing outside the workspace changed
```

`FUZZ_VALUES` holds quotes, `;`, `&`, `|`, `$(x)`, a backtick, `%PATH%`, a newline, a very long name, an
empty string, Hindi and emoji names, a trailing space or dot, `..\..`, and a UNC path.
`injectionPayloads` builds strings that would create the sentinel file if a shell ran them.
`attempt` accepts success or an `Error` and fails the test on anything else. See
`tests/fuzz.boundaries.test.js` for the files, directory, git, command, project, Terraform and
Docker tools. Add your tool there when it takes a path or a name.

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
`MEDIUM`, `HIGH` or `DESTRUCTIVE`). A tool without one defaults to `MEDIUM`, and a test fails if a shipped tool has no
level. Anything that sends
something to other people or cannot be undone should be `HIGH` or `DESTRUCTIVE`, and accept a
`confirm` argument.

The MCP annotations (`readOnlyHint` and the rest) come from the level automatically. If your pack
calls a service outside the machine, also add the pack's name to `OPEN_WORLD_PACKS` in
`tools/annotations.js`, so its tools are marked open-world.

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

## Releasing

1. Set the new version in `package.json` and `server.json` (both places) and add a section for it to
   `CHANGELOG.md`. The release metadata test fails if they disagree.
2. Merge to `master`, then create a **signed** tag and publish a GitHub release for it. The tag is
   `v<version>`, for example `v1.5.4`:
   ```
   git tag -s v1.5.4 -m "v1.5.4"
   git tag -v v1.5.4
   git push origin v1.5.4
   ```
   `git tag -v` must print a good signature before you push. GitHub shows a **Verified** badge on
   the tag when your signing key is added to your account.
3. The **Publish to npm** workflow checks the tag against `package.json`, audits the production
   dependencies, checks their licenses, generates the SBOM, runs the tests and publishes with
   `npm publish --provenance`. npm then shows a verified link from the package to this repository
   and commit. It needs the repository secret `NPM_TOKEN`.
4. The workflow attaches `causly-server-v<version>.cdx.json` to the GitHub release. It is a
   CycloneDX software bill of materials for the production dependencies. To make one by hand, run
   `npm run -s sbom > sbom.cdx.json`.

### License check

`npm run check:licenses` reads `package-lock.json` and fails when a production dependency has no
license or one outside the allowlist: MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, 0BSD,
BlueOak-1.0.0, CC0-1.0, Python-2.0 and Unlicense. An `OR` expression passes if one choice is
allowed. CI and the publish workflow both run it. To add a license to the allowlist, edit
`scripts/check-licenses.mjs` in a pull request that explains why.

### Revoking a bad release

If a published version is broken or unsafe:

1. Run `npm deprecate causly-server@<version> "<one line: what is wrong and which version to use>"`.
   Do not use `npm unpublish`: it breaks people who already depend on that version.
2. Publish a fixed patch release the normal way.
3. For a security problem, publish a GitHub security advisory (repository **Security** tab) so
   `npm audit` warns users, and follow [SECURITY.md](https://github.com/KNIHAL/causly-server/blob/master/SECURITY.md).
4. Add a note to the `CHANGELOG.md` section of the fixed version that names the bad version and
   the reason.
5. If the MCP Registry entry points at the bad version, update it to the fixed one.

## Reporting a security issue

Please do not open a public issue. Follow
[SECURITY.md](https://github.com/KNIHAL/causly-server/blob/master/SECURITY.md).
