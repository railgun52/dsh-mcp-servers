/**
 * Host registration: the `mcp-servers` settings namespace and the live
 * mcp-client bridge it feeds. Under the profile-config settings model the
 * plugin's Config schema IS the namespace, so the owning profile entry id must
 * equal `mcp-servers`. `servers` is volatile, so edits reload the value without
 * remounting this plugin; the bridge re-syncs on `loader/volatile-update`.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { McpServersHostConfig } from './mcp-servers-schema.ts';
export { MCP_SERVERS_NAMESPACE, McpServersSchema } from './mcp-servers-schema.ts';
export type { McpServerConfig, McpServersSettings } from './mcp-servers-schema.ts';
/** Services required: the mcp-client instances this plugin mounts inject the tool registry. */
export declare const inject: string[];
/** Config schema; the owning profile entry's id must equal {@link MCP_SERVERS_NAMESPACE}. */
export declare const Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<NoInfer<{
    servers: import("@deepseek-ai/schemastery").default<NoInfer<({
        name?: string | null;
        command?: string | null;
        args?: string[] | null;
        env?: import("@deepseek-ai/cosmokit").Dict<string, string> | null;
        transport?: "stdio" | "streamable-http" | null;
        url?: string | null;
        enabled?: boolean | null;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        name: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        command: import("@deepseek-ai/schemastery").default<string, string, "plain">;
        args: import("@deepseek-ai/schemastery").default<string[], string[], "defined">;
        env: import("@deepseek-ai/schemastery").default<import("@deepseek-ai/cosmokit").Dict<string, string>, import("@deepseek-ai/cosmokit").Dict<string, string>, "defined">;
        transport: import("@deepseek-ai/schemastery").default<"stdio" | "streamable-http", "stdio" | "streamable-http", "defined">;
        url: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    }>>[]>, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    servers: import("@deepseek-ai/schemastery").default<NoInfer<({
        name?: string | null;
        command?: string | null;
        args?: string[] | null;
        env?: import("@deepseek-ai/cosmokit").Dict<string, string> | null;
        transport?: "stdio" | "streamable-http" | null;
        url?: string | null;
        enabled?: boolean | null;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        name: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        command: import("@deepseek-ai/schemastery").default<string, string, "plain">;
        args: import("@deepseek-ai/schemastery").default<string[], string[], "defined">;
        env: import("@deepseek-ai/schemastery").default<import("@deepseek-ai/cosmokit").Dict<string, string>, import("@deepseek-ai/cosmokit").Dict<string, string>, "defined">;
        transport: import("@deepseek-ai/schemastery").default<"stdio" | "streamable-http", "stdio" | "streamable-http", "defined">;
        url: import("@deepseek-ai/schemastery").default<string, string, "defined">;
        enabled: import("@deepseek-ai/schemastery").default<boolean, boolean, "defined">;
    }>>[]>, "volatile-defined">;
}>>, "plain">;
/**
 * Keep live mcp-client instances in sync with the resolved `mcp-servers`
 * config, so the Settings page's MCP edits take effect without a restart.
 * @param ctx - Host context whose tool registry the mounted mcp-client instances need.
 * @param config - resolved `mcp-servers` section; `servers` is a live volatile reference.
 */
export declare function apply(ctx: Context, config: McpServersHostConfig): void;
//# sourceMappingURL=index.d.ts.map