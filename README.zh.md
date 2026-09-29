# dsh-mcp-servers — MCP 服务器设置页

[![npm](https://img.shields.io/npm/v/@railgun52/dsh-mcp-servers?style=flat-square)](https://www.npmjs.com/package/@railgun52/dsh-mcp-servers)

[English](README.md) | 中文

> DeepSeek Harness 的 profile-config 设置页，在 Web UI 里管理 MCP 服务器，并把保存的服务器列表挂成实时运行的 `mcp-client` 实例。

你添加的每个服务器都会成为一个运行中的 MCP 客户端，其工具会注册到智能体工具表上——保存即生效，模型马上能调用，无需重启、无需手改 YAML。页面是对 `mcp-servers` profile-config 命名空间的 JSON 编辑器；Host 端负责 schema 与实时桥，浏览器端负责编辑卡片。

## 功能

| 功能 | 说明 |
|---|---|
| 设置页 | 一级设置 section `MCP 服务器`，提供增/改/删卡片列表 |
| JSON 编辑器 | 用一个文本框编辑整段 `servers` 数组；一键添加服务器 |
| 实时桥 | Host 为每个启用的服务器挂一个 `mcp-client` 实例，并在每次设置改动时（`loader/volatile-update`）重同步，不重载插件 |
| stdio + streamable-http | 每个服务器含 `name`、`command`、`args`、`env`、`transport`、`url`、`enabled` |
| profile-config 存储 | 值持久化到当前 profile 的插件配置；页面通过共享 `configForms` 命名空间读写 |

## 架构

```text
dsh-mcp-servers/
|-- src/
|   |-- index.ts               # host 端：Config schema（volatile servers）+ mcp-client 桥
|   |-- mcp-servers-schema.ts  # McpServersSchema + McpServerConfig
|   |-- mcp-bridge.ts          # applyMcpBridge：按实时值创建/销毁 mcp-client 实例
|   |-- invariant.ts
|   `-- client/
|       |-- index.ts           # 浏览器端：configForms.whileServed + settings.section 卡片
|       |-- McpSection.tsx     # JSON 编辑卡片（经 configForms load/save）
|       |-- McpSection.module.css
|       `-- locales.ts         # zh/en 导航与页面文案
`-- cordis.patch.yml           # bundle patch：插入 mcp-servers 插件行
```

- **命名空间**：`mcp-servers`。所属 profile 条目 id 必须等于该字符串；在 profile-config 设置模型下，插件的 Config schema 即命名空间。
- **实时编辑**：`servers` 声明为 `.volatile()`，设置模型据此暴露命名空间，且编辑不重载插件；Host 通过 `Volatile.get()` 读实时值，并在 `loader/volatile-update` 时重同步桥。
- **浏览器 bundle**：走 `window.__ModuleLoader__.load` 契约；React 与 `@deepseek-ai/dsh-client-ui-primitives` 从加载器模块表解析（external）；CSS Modules 由 lightningcss 内联为 `<style data-plugin>`。

## 安装

```sh
### 从本地目录（开发）
dsh plugin --profile web add link:/absolute/path/to/dsh-mcp-servers

### 从 npm（推荐）
dsh plugin --profile web add @railgun52/dsh-mcp-servers@latest
```

安装后**重启 `dsh web`**。打开 设置 → MCP 服务器 管理服务器。link 模式下改代码后跑 `pnpm build` 再刷新页面即可，无需重新安装。

## 开发

```sh
pnpm install
pnpm build        # tsc -b（类型+声明）&& tsdown（node 半 + 浏览器 bundle）
pnpm typecheck    # 仅类型检查
```

浏览器 bundle 用 harness 的 `clientBundle` helper 产出；从全新克隆构建需要 DeepSeek Harness 仓库在场（`tsdown.config.ts` 引入其 `clientBundle`）。发布的 `lib/` 已预构建，使用者无需构建。

## 许可证

[MIT](LICENSE)
