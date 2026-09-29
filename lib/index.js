import z from "@deepseek-ai/schemastery";
import * as McpClient from "@deepseek-ai/dsh-mcp-client";
//#region lib/types/mcp-servers-schema.js
/** MCP servers settings schema (host + browser shared). */
/** Settings namespace owned by the MCP servers settings bridge. */
const MCP_SERVERS_NAMESPACE = "mcp-servers";
const McpServerSchema = z.object({
	name: z.string().required(),
	command: z.string(),
	args: z.array(String).default([]),
	env: z.dict(String).default({}),
	transport: z.union(["stdio", "streamable-http"]).default("stdio"),
	url: z.string().default(""),
	enabled: z.boolean().default(true)
});
/**
* Durable MCP servers schema. `servers` is volatile so the profile-config
* settings model exposes it as a live-editable field (the plugin is not
* remounted on edit; the bridge re-syncs on `loader/volatile-update`).
*/
const McpServersSchema = z.object({ servers: z.array(McpServerSchema).default([]).volatile() });
//#endregion
//#region lib/types/mcp-bridge.js
/** Settings -> mcp-client bridge: live-mounts MCP servers from the settings document. */
/**
* Build one mcp-client config from a settings entry. The settings service
* deeply freezes published values, while Schemastery's config parse fills
* defaults into the args array and env dict, so both are cloned first.
* @param server - one entry of the mcp-servers settings value.
* @returns validated mcp-client config for that server.
*/
function toClientConfig(server) {
	if (server.transport === "streamable-http") return McpClient.Config({
		transport: "streamable-http",
		serverName: server.name,
		url: server.url,
		headers: {},
		failOnStartupError: false
	});
	return McpClient.Config({
		transport: "stdio",
		serverName: server.name,
		command: server.command,
		args: [...server.args],
		env: { ...server.env },
		cwd: "",
		failOnStartupError: false
	});
}
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
function applyMcpBridge(ctx, getValue) {
	const instances = /* @__PURE__ */ new Map();
	let chain = Promise.resolve();
	const syncOnce = async () => {
		const servers = getValue()?.servers ?? [];
		const next = /* @__PURE__ */ new Map();
		for (const server of servers) {
			if (!server.enabled) continue;
			if (next.has(server.name)) continue;
			next.set(server.name, server);
		}
		for (const [name, server] of next) {
			const signature = JSON.stringify(server);
			const existing = instances.get(name);
			if (existing !== void 0 && existing.signature === signature) continue;
			if (existing !== void 0) {
				await existing.fiber.dispose();
				instances.delete(name);
			}
			let config;
			try {
				config = toClientConfig(server);
			} catch (error) {
				ctx.logger.warn("mcp-bridge: invalid server config for \"%s\": %s", name, String(error));
				continue;
			}
			const fiber = ctx.plugin(McpClient, config);
			instances.set(name, {
				fiber,
				signature
			});
		}
		for (const [name, { fiber }] of instances) if (!next.has(name)) {
			await fiber.dispose();
			instances.delete(name);
		}
	};
	const sync = () => {
		chain = chain.then(syncOnce).catch((error) => {
			ctx.logger.warn("mcp-bridge: sync failed: %s", String(error));
		});
	};
	const dispose = async () => {
		chain = chain.finally(async () => {
			for (const [, { fiber }] of instances) try {
				await fiber.dispose();
			} catch {}
			instances.clear();
		});
		await chain;
	};
	sync();
	return {
		sync,
		dispose
	};
}
//#endregion
//#region lib/types/index.js
/**
* Host registration: the `mcp-servers` settings namespace and the live
* mcp-client bridge it feeds. Under the profile-config settings model the
* plugin's Config schema IS the namespace, so the owning profile entry id must
* equal `mcp-servers`. `servers` is volatile, so edits reload the value without
* remounting this plugin; the bridge re-syncs on `loader/volatile-update`.
*/
/** Services required: the mcp-client instances this plugin mounts inject the tool registry. */
const inject = ["tools"];
/** Config schema; the owning profile entry's id must equal {@link MCP_SERVERS_NAMESPACE}. */
const Config = McpServersSchema;
/**
* Keep live mcp-client instances in sync with the resolved `mcp-servers`
* config, so the Settings page's MCP edits take effect without a restart.
* @param ctx - Host context whose tool registry the mounted mcp-client instances need.
* @param config - resolved `mcp-servers` section; `servers` is a live volatile reference.
*/
function apply(ctx, config) {
	const bridge = applyMcpBridge(ctx, () => ({ servers: config.servers.get().map((server) => ({
		...server,
		args: [...server.args],
		env: { ...server.env }
	})) }));
	ctx.on("loader/volatile-update", () => {
		bridge.sync();
	});
	ctx.effect(() => () => {
		bridge.dispose();
	}, "mcp-servers: settings bridge");
}
//#endregion
export { Config, MCP_SERVERS_NAMESPACE, McpServersSchema, apply, inject };
