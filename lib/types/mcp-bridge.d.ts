/** Settings -> mcp-client bridge: live-mounts MCP servers from the settings document. */
import type { Context } from '@deepseek-ai/cordis';
import type { McpServerConfig } from './mcp-servers-schema.ts';
/**
 * Mount and keep live mcp-client instances in sync with the `mcp-servers` settings
 * namespace. Creates, rebuilds, and disposes instances by `serverName` so editing the
 * settings page takes effect without a restart. All sync work is serialized on one
 * promise chain so concurrent settings writes cannot race the instance map.
 * @param ctx - Host context carrying the tool registry required by mcp-client.
 * @param getValue - accessor for the resolved settings value (called at sync time).
 * @returns a sync trigger (call on settings change) and a dispose that drains the chain
 *  and tears down every live instance.
 */
export declare function applyMcpBridge(ctx: Context, getValue: () => {
    servers: McpServerConfig[];
} | undefined): {
    sync: () => void;
    dispose: () => Promise<void>;
};
//# sourceMappingURL=mcp-bridge.d.ts.map