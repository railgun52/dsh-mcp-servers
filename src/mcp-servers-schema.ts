/** MCP servers settings schema (host + browser shared). */

import type { Volatile } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'

/** Settings namespace owned by the MCP servers settings bridge. */
export const MCP_SERVERS_NAMESPACE = 'mcp-servers'

/** One MCP server declaration as stored in the user-settings document. */
export interface McpServerConfig {
  name: string
  command: string
  args: string[]
  env: Record<string, string>
  transport: 'stdio' | 'streamable-http'
  url: string
  enabled: boolean
}

/** Durable MCP servers section shared by the Host schema and the browser scope. */
export interface McpServersSettings {
  servers: McpServerConfig[]
}

const McpServerSchema = z.object({
  name: z.string().required(),
  command: z.string(),
  args: z.array(String).default([]),
  env: z.dict(String).default({}),
  transport: z.union(['stdio', 'streamable-http']).default('stdio'),
  url: z.string().default(''),
  enabled: z.boolean().default(true),
})

/**
 * Durable MCP servers schema. `servers` is volatile so the profile-config
 * settings model exposes it as a live-editable field (the plugin is not
 * remounted on edit; the bridge re-syncs on `loader/volatile-update`).
 */
export const McpServersSchema = z.object({
  servers: z.array(McpServerSchema).default([]).volatile(),
})

/** Resolved Host config; the volatile field is read through its live reference. */
export type McpServersHostConfig = { servers: Volatile<McpServerConfig[]> }
