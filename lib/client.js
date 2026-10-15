window.__ModuleLoader__.load({
	id: "@railgun52/dsh-mcp-servers",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:G:\DSH2026\deepseek-harness-master\packages\client\ui-settings-mcp\src\client\McpSection.module.css.mjs
		const css = ".gZZtfG_section{max-width:800px;padding:24px}.gZZtfG_header{margin-bottom:24px}.gZZtfG_title{margin:0 0 8px;font-size:20px;font-weight:600}.gZZtfG_intro{color:var(--text-secondary);margin:0;font-size:14px}.gZZtfG_toolbar{margin-bottom:16px}.gZZtfG_list{flex-direction:column;gap:8px;display:flex}.gZZtfG_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:10px;justify-content:space-between;align-items:center;padding:12px 16px;transition:box-shadow .15s;display:flex}.gZZtfG_card:hover{box-shadow:0 1px 4px #0000000f}.gZZtfG_cardBody{flex:1;min-width:0}.gZZtfG_cardName{align-items:center;gap:8px;font-weight:500;display:flex}.gZZtfG_cardMeta{color:var(--text-secondary);text-overflow:ellipsis;white-space:nowrap;margin-top:4px;font-size:12px;overflow:hidden}.gZZtfG_cardMeta code{font-size:12px}.gZZtfG_cardActions{flex-shrink:0;align-items:center;gap:8px;display:flex}.gZZtfG_enableSwitch{margin-right:4px}.gZZtfG_iconBtn{cursor:pointer;color:var(--text-secondary);background:0 0;border:none;border-radius:4px;align-items:center;padding:4px;display:flex}.gZZtfG_iconBtn:hover{background:var(--bg-hover);color:var(--text-primary)}.gZZtfG_statusOn{background:#22c55e;border-radius:50%;width:8px;height:8px;display:inline-block}.gZZtfG_statusOff{background:#888;border-radius:50%;width:8px;height:8px;display:inline-block}.gZZtfG_deleteBtn{cursor:pointer;color:var(--text-secondary);background:0 0;border:none;border-radius:4px;align-items:center;padding:4px;display:flex}.gZZtfG_deleteBtn:hover{background:var(--bg-hover);color:var(--text-error)}.gZZtfG_empty{text-align:center;color:var(--text-secondary);padding:40px}.gZZtfG_error{background:var(--bg-error);color:var(--text-error);border-radius:6px;margin-bottom:16px;padding:8px 12px;font-size:13px}.gZZtfG_loading{text-align:center;color:var(--text-secondary);padding:40px}.gZZtfG_modalBody{padding:0}.gZZtfG_modalBody p{padding:0 16px}.gZZtfG_modalActions{justify-content:flex-end;gap:8px;padding:16px;display:flex}.gZZtfG_jsonEditor{resize:vertical;background:var(--bg-input);width:100%;color:var(--text-primary);box-sizing:border-box;border:none;outline:none;min-height:300px;padding:12px;font-family:monospace;font-size:13px;line-height:1.5}.gZZtfG_jsonEditor:focus{background:var(--bg-input-focus)}.gZZtfG_dialogMcp{width:min(720px,100%)}";
		const tagId = "@railgun52/dsh-mcp-servers/McpSection.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@railgun52/dsh-mcp-servers";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var McpSection_module_css_default = {
			"card": "gZZtfG_card",
			"cardActions": "gZZtfG_cardActions",
			"cardBody": "gZZtfG_cardBody",
			"cardMeta": "gZZtfG_cardMeta",
			"cardName": "gZZtfG_cardName",
			"deleteBtn": "gZZtfG_deleteBtn",
			"dialogMcp": "gZZtfG_dialogMcp",
			"empty": "gZZtfG_empty",
			"enableSwitch": "gZZtfG_enableSwitch",
			"error": "gZZtfG_error",
			"header": "gZZtfG_header",
			"iconBtn": "gZZtfG_iconBtn",
			"intro": "gZZtfG_intro",
			"jsonEditor": "gZZtfG_jsonEditor",
			"list": "gZZtfG_list",
			"loading": "gZZtfG_loading",
			"modalActions": "gZZtfG_modalActions",
			"modalBody": "gZZtfG_modalBody",
			"section": "gZZtfG_section",
			"statusOff": "gZZtfG_statusOff",
			"statusOn": "gZZtfG_statusOn",
			"title": "gZZtfG_title",
			"toolbar": "gZZtfG_toolbar"
		};
		//#endregion
		//#region src/client/McpSection.tsx
		function serversToJson(servers) {
			const mcpServers = {};
			for (const s of servers) {
				const entry = { command: s.command };
				if (s.args.length > 0) entry.args = s.args;
				if (Object.keys(s.env).length > 0) entry.env = s.env;
				if (s.transport === "streamable-http") entry.transport = "streamable-http";
				if (s.url) entry.url = s.url;
				if (!s.enabled) entry.enabled = false;
				mcpServers[s.name] = entry;
			}
			return JSON.stringify({ mcpServers }, null, 2);
		}
		function jsonToServers(text) {
			const map = JSON.parse(text).mcpServers;
			if (!map || typeof map !== "object") throw new Error("Missing \"mcpServers\" key");
			return Object.entries(map).map(([name, config]) => {
				const c = config;
				const args = Array.isArray(c.args) ? c.args.map(String) : [];
				const env = c.env && typeof c.env === "object" ? Object.fromEntries(Object.entries(c.env).map(([k, v]) => [k, String(v)])) : {};
				return {
					name,
					command: String(c.command ?? ""),
					args,
					env,
					transport: c.transport === "streamable-http" ? "streamable-http" : "stdio",
					url: String(c.url ?? ""),
					enabled: c.enabled !== false
				};
			});
		}
		const EMPTY_TEMPLATE = JSON.stringify({ mcpServers: { "my-server": {
			command: "npx",
			args: [
				"-y",
				"@modelcontextprotocol/server-filesystem",
				"/path"
			]
		} } }, null, 2);
		function McpSection({ load, save, t: t_ }) {
			const t = t_ ?? ((key) => key);
			const [servers, setServers] = (0, react.useState)([]);
			const [loading, setLoading] = (0, react.useState)(true);
			const [saving, setSaving] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const [editJson, setEditJson] = (0, react.useState)("");
			const [editIndex, setEditIndex] = (0, react.useState)(null);
			const [showEditModal, setShowEditModal] = (0, react.useState)(false);
			const [editError, setEditError] = (0, react.useState)(null);
			const [deleteTarget, setDeleteTarget] = (0, react.useState)(null);
			const loadConfig = (0, react.useCallback)(() => {
				setLoading(true);
				setError(null);
				try {
					setServers(load?.() ?? []);
				} catch (e) {
					setError(t("loadFailed"));
				} finally {
					setLoading(false);
				}
			}, [load, t]);
			(0, react.useEffect)(() => {
				loadConfig();
			}, [loadConfig]);
			const saveConfig = async (newServers) => {
				setSaving(true);
				setError(null);
				try {
					await save?.(newServers);
					setServers(newServers);
				} catch (e) {
					setError(t("saveFailed"));
				} finally {
					setSaving(false);
				}
			};
			const handleAdd = () => {
				setEditJson(EMPTY_TEMPLATE);
				setEditIndex(null);
				setEditError(null);
				setShowEditModal(true);
			};
			const handleEdit = (index) => {
				const server = servers[index];
				if (!server) return;
				setEditJson(serversToJson([server]));
				setEditIndex(index);
				setEditError(null);
				setShowEditModal(true);
			};
			const handleSaveJson = async () => {
				try {
					const parsed = jsonToServers(editJson);
					if (parsed.length === 0) {
						setEditError("No servers found in JSON");
						return;
					}
					if (editIndex !== null) {
						const newServers = [...servers];
						newServers[editIndex] = parsed[0];
						await saveConfig(newServers);
					} else {
						const merged = new Map(servers.map((s) => [s.name, s]));
						for (const s of parsed) merged.set(s.name, s);
						await saveConfig(Array.from(merged.values()).filter((s) => s !== void 0));
					}
					setShowEditModal(false);
				} catch (e) {
					setEditError(e instanceof Error ? e.message : String(e));
				}
			};
			const handleToggle = async (index, enabled) => {
				await saveConfig(servers.map((s, i) => i === index ? {
					...s,
					enabled
				} : s));
			};
			const handleDelete = async (index) => {
				await saveConfig(servers.filter((_, i) => i !== index));
				setDeleteTarget(null);
			};
			if (loading) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: McpSection_module_css_default.section,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: McpSection_module_css_default.loading,
					children: "Loading..."
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: McpSection_module_css_default.section,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: McpSection_module_css_default.header,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
							className: McpSection_module_css_default.title,
							children: t("title")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: McpSection_module_css_default.intro,
							children: t("intro")
						})]
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: McpSection_module_css_default.error,
						children: error
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: McpSection_module_css_default.toolbar,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							onClick: handleAdd,
							disabled: saving,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, {}),
								" ",
								t("add")
							]
						})
					}),
					servers.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: McpSection_module_css_default.empty,
						children: t("noServers")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: McpSection_module_css_default.list,
						children: servers.map((server, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: McpSection_module_css_default.card,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: McpSection_module_css_default.cardBody,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: McpSection_module_css_default.cardName,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: server.enabled ? McpSection_module_css_default.statusOn : McpSection_module_css_default.statusOff }), server.name]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: McpSection_module_css_default.cardMeta,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("code", { children: [
										server.command,
										" ",
										server.args.join(" ")
									] })
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: McpSection_module_css_default.cardActions,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
										checked: server.enabled,
										onChange: (enabled) => handleToggle(i, enabled),
										label: `${server.name} ${server.enabled ? t("enabled") : t("disabled")}`,
										title: server.enabled ? t("enabled") : t("disabled"),
										className: McpSection_module_css_default.enableSwitch,
										disabled: saving
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: McpSection_module_css_default.iconBtn,
										title: t("edit"),
										"aria-label": t("edit"),
										onClick: () => handleEdit(i),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular, {})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										className: McpSection_module_css_default.deleteBtn,
										onClick: () => setDeleteTarget({
											name: server.name,
											index: i
										}),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, {})
									})
								]
							})]
						}, i))
					}),
					showEditModal && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: true,
						onClose: () => setShowEditModal(false),
						title: editIndex !== null ? t("edit") : t("add"),
						closeLabel: t("close"),
						className: McpSection_module_css_default.dialogMcp ?? "",
						footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							onClick: handleSaveJson,
							disabled: saving,
							children: t("save")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							onClick: () => setShowEditModal(false),
							children: t("cancel")
						})] }),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: McpSection_module_css_default.modalBody,
							children: [editError && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: McpSection_module_css_default.error,
								children: editError
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								className: McpSection_module_css_default.jsonEditor,
								value: editJson,
								onChange: (e) => setEditJson(e.target.value),
								rows: 16,
								spellCheck: false
							})]
						})
					}),
					deleteTarget && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: true,
						onClose: () => setDeleteTarget(null),
						title: t("remove"),
						closeLabel: t("close"),
						className: McpSection_module_css_default.dialogMcp ?? "",
						footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							onClick: () => handleDelete(deleteTarget.index),
							children: t("remove")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							onClick: () => setDeleteTarget(null),
							children: t("cancel")
						})] }),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: McpSection_module_css_default.modalBody,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("deleteConfirm").replace("{server}", deleteTarget.name) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("deleteDescription") })]
						})
					})
				]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		const en = {
			nav: "MCP Servers",
			title: "MCP Configuration",
			intro: "Manage your MCP servers by editing the JSON configuration below.",
			add: "Add server",
			edit: "Edit MCP config",
			enabled: "Enabled",
			disabled: "Disabled",
			remove: "Delete",
			deleteConfirm: "Delete {server}?",
			deleteDescription: "This will remove the MCP server configuration.",
			save: "Save",
			cancel: "Cancel",
			close: "Close",
			noServers: "No MCP servers configured. Click \"Add server\" to get started.",
			loadFailed: "Failed to load MCP configuration.",
			saveFailed: "Failed to save MCP configuration.",
			saved: "Configuration saved."
		};
		const zh = {
			nav: "MCP 服务器",
			title: "MCP 配置",
			intro: "通过编辑下方的 JSON 配置来管理 MCP 服务器。",
			add: "添加服务器",
			edit: "编辑 MCP 配置",
			enabled: "已启用",
			disabled: "已禁用",
			remove: "删除",
			deleteConfirm: "删除 {server}？",
			deleteDescription: "这将移除 MCP 服务器配置。",
			save: "保存",
			cancel: "取消",
			close: "关闭",
			noServers: "还没有配置 MCP 服务器，点击\"添加服务器\"开始配置。",
			loadFailed: "加载 MCP 配置失败。",
			saveFailed: "保存 MCP 配置失败。",
			saved: "配置已保存。"
		};
		//#endregion
		//#region src/client/index.ts
		const NS = "settings.mcp";
		const NAMESPACE = "mcp-servers";
		const inject = [
			"slots",
			"locale",
			"configForms"
		];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-settings-mcp: copy dictionaries");
			const form = ctx.configForms.get(NAMESPACE);
			const t = ctx.locale.bind(NS);
			const load = () => form.getSnapshot().value?.servers ?? [];
			const save = async (servers) => {
				await form.set("servers", servers);
			};
			ctx.effect(() => ctx.configForms.whileServed([NAMESPACE], () => ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "mcp",
				order: 25,
				label: () => t("nav"),
				locale: NS,
				inject: () => ({
					load,
					save,
					t
				})
			}, McpSection))), "ui-settings-mcp: page");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map