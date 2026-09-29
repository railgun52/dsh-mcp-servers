/** MCP servers settings schema (host + browser shared). */
import type { Volatile } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
/** Settings namespace owned by the MCP servers settings bridge. */
export declare const MCP_SERVERS_NAMESPACE = "mcp-servers";
/** One MCP server declaration as stored in the user-settings document. */
export interface McpServerConfig {
    name: string;
    command: string;
    args: string[];
    env: Record<string, string>;
    transport: 'stdio' | 'streamable-http';
    url: string;
    enabled: boolean;
}
/** Durable MCP servers section shared by the Host schema and the browser scope. */
export interface McpServersSettings {
    servers: McpServerConfig[];
}
/**
 * Durable MCP servers schema. `servers` is volatile so the profile-config
 * settings model exposes it as a live-editable field (the plugin is not
 * remounted on edit; the bridge re-syncs on `loader/volatile-update`).
 */
export declare const McpServersSchema: z<Schemastery.ObjectS<NoInfer<{
    servers: z<NoInfer<({
        name?: string | null;
        command?: string | null;
        args?: string[] | null;
        env?: import("@deepseek-ai/cosmokit").Dict<string, string> | null;
        transport?: "stdio" | "streamable-http" | null;
        url?: string | null;
        enabled?: boolean | null;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        name: z<string, string, "defined">;
        command: z<string, string, "plain">;
        args: z<string[], string[], "defined">;
        env: z<import("@deepseek-ai/cosmokit").Dict<string, string>, import("@deepseek-ai/cosmokit").Dict<string, string>, "defined">;
        transport: z<"stdio" | "streamable-http", "stdio" | "streamable-http", "defined">;
        url: z<string, string, "defined">;
        enabled: z<boolean, boolean, "defined">;
    }>>[]>, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    servers: z<NoInfer<({
        name?: string | null;
        command?: string | null;
        args?: string[] | null;
        env?: import("@deepseek-ai/cosmokit").Dict<string, string> | null;
        transport?: "stdio" | "streamable-http" | null;
        url?: string | null;
        enabled?: boolean | null;
    } & import("@deepseek-ai/cosmokit").Dict)[]>, NoInfer<Schemastery.ObjectT<NoInfer<{
        name: z<string, string, "defined">;
        command: z<string, string, "plain">;
        args: z<string[], string[], "defined">;
        env: z<import("@deepseek-ai/cosmokit").Dict<string, string>, import("@deepseek-ai/cosmokit").Dict<string, string>, "defined">;
        transport: z<"stdio" | "streamable-http", "stdio" | "streamable-http", "defined">;
        url: z<string, string, "defined">;
        enabled: z<boolean, boolean, "defined">;
    }>>[]>, "volatile-defined">;
}>>, "plain">;
/** Resolved Host config; the volatile field is read through its live reference. */
export type McpServersHostConfig = {
    servers: Volatile<McpServerConfig[]>;
};
//# sourceMappingURL=mcp-servers-schema.d.ts.map