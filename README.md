# dsh-mcp-servers — MCP servers settings page

[![npm](https://img.shields.io/npm/v/@railgun52/dsh-mcp-servers?style=flat-square)](https://www.npmjs.com/package/@railgun52/dsh-mcp-servers)

English | [中文](README.zh.md)

> A profile-config settings page for DeepSeek Harness that lets you manage MCP servers from the Web UI and mounts live `mcp-client` instances from the saved list.

Each server you add becomes a running MCP client whose tools are registered on the agent tool registry, so the model can call them the moment you save — no restart, no hand-edited YAML. The page is a JSON editor over the `mcp-servers` profile-config namespace; the Host half owns the schema and the live bridge, the browser half owns the editor card.

## Features

| Feature | Description |
|---|---|
| Settings page | A first-level Settings section `MCP 服务器` with an add/edit/remove card list |
| JSON editor | Edit the whole `servers` array in one textarea; add a server with one click |
| Live bridge | The Host mounts one `mcp-client` instance per enabled server and re-syncs on every settings edit (`loader/volatile-update`) without remounting the plugin |
| stdio + streamable-http | Each server carries `name`, `command`, `args`, `env`, `transport`, `url`, `enabled` |
| Profile-config backed | Values persist to the active profile's plugin config; the page reads/writes through the shared `configForms` namespace |

## Architecture

```text
dsh-mcp-servers/
|-- src/
|   |-- index.ts               # host half: Config schema (volatile servers) + mcp-client bridge
|   |-- mcp-servers-schema.ts  # McpServersSchema + McpServerConfig
|   |-- mcp-bridge.ts          # applyMcpBridge: create/dispose mcp-client instances from the live value
|   |-- invariant.ts
|   `-- client/
|       |-- index.ts           # browser half: configForms.whileServed + settings.section card
|       |-- McpSection.tsx     # JSON editor card (load/save through configForms)
|       |-- McpSection.module.css
|       `-- locales.ts         # zh/en nav + page copy
`-- cordis.patch.yml           # bundle patch: inserts the mcp-servers plugin row
```

- **Namespace**: `mcp-servers`. The owning profile entry id must equal this string; the plugin's Config schema IS the namespace under the profile-config settings model.
- **Live edits**: `servers` is declared `.volatile()`, so the settings model exposes the namespace and edits do not remount the plugin. The Host reads the live value through `Volatile.get()` and re-syncs the bridge on `loader/volatile-update`.
- **Browser bundle**: rides the `window.__ModuleLoader__.load` contract; React and `@deepseek-ai/dsh-client-ui-primitives` resolve from the loader's module table (external); CSS Modules are inlined by lightningcss as `<style data-plugin>`.

## Install

```sh
### From a local directory (development)
dsh plugin --profile web add link:/absolute/path/to/dsh-mcp-servers

### From npm (recommended)
dsh plugin --profile web add @railgun52/dsh-mcp-servers@latest
```

After installing, **restart `dsh web`**. Open Settings → MCP 服务器 to manage servers. In link mode, run `pnpm build` and refresh the page after a code change; no reinstall needed.

## Development

```sh
pnpm install
pnpm build        # tsc -b (types+declarations) && tsdown (node half + browser bundle)
pnpm typecheck    # type check only
```

The browser bundle is produced with the harness `clientBundle` helper; building from a fresh clone requires the DeepSeek Harness repository available (the `tsdown.config.ts` imports its `clientBundle`). The shipped `lib/` is pre-built, so consumers never build.

## License

[MIT](LICENSE)
