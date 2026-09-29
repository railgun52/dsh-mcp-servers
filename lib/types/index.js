/**
 * Host registration: the `mcp-servers` settings namespace and the live
 * mcp-client bridge it feeds. Under the profile-config settings model the
 * plugin's Config schema IS the namespace, so the owning profile entry id must
 * equal `mcp-servers`. `servers` is volatile, so edits reload the value without
 * remounting this plugin; the bridge re-syncs on `loader/volatile-update`.
 */
import { McpServersSchema } from "./mcp-servers-schema.js";
import { applyMcpBridge } from "./mcp-bridge.js";
export { MCP_SERVERS_NAMESPACE, McpServersSchema } from "./mcp-servers-schema.js";
/** Services required: the mcp-client instances this plugin mounts inject the tool registry. */
export const inject = ['tools'];
/** Config schema; the owning profile entry's id must equal {@link MCP_SERVERS_NAMESPACE}. */
export const Config = McpServersSchema;
/**
 * Keep live mcp-client instances in sync with the resolved `mcp-servers`
 * config, so the Settings page's MCP edits take effect without a restart.
 * @param ctx - Host context whose tool registry the mounted mcp-client instances need.
 * @param config - resolved `mcp-servers` section; `servers` is a live volatile reference.
 */
export function apply(ctx, config) {
    const bridge = applyMcpBridge(ctx, () => ({
        servers: config.servers.get().map((server) => ({
            ...server,
            args: [...server.args],
            env: { ...server.env },
        })),
    }));
    ctx.on('loader/volatile-update', () => {
        bridge.sync();
    });
    ctx.effect(() => () => {
        void bridge.dispose();
    }, 'mcp-servers: settings bridge');
}
//# sourceMappingURL=index.js.map