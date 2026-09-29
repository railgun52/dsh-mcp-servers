/** Settings -> mcp-client bridge: live-mounts MCP servers from the settings document. */

import type { Context } from '@deepseek-ai/cordis'
import * as McpClient from '@deepseek-ai/dsh-mcp-client'
import type { McpServerConfig } from './mcp-servers-schema.ts'

type PluginFiber = ReturnType<Context['plugin']>

interface LiveInstance {
  fiber: PluginFiber
  signature: string
}

/**
 * Build one mcp-client config from a settings entry. The settings service
 * deeply freezes published values, while Schemastery's config parse fills
 * defaults into the args array and env dict, so both are cloned first.
 * @param server - one entry of the mcp-servers settings value.
 * @returns validated mcp-client config for that server.
 */
function toClientConfig(server: McpServerConfig): McpClient.Config {
  if (server.transport === 'streamable-http') {
    return McpClient.Config({
      transport: 'streamable-http',
      serverName: server.name,
      url: server.url,
      headers: {},
      failOnStartupError: false,
    })
  }
  return McpClient.Config({
    transport: 'stdio',
    serverName: server.name,
    command: server.command,
    args: [...server.args],
    env: { ...server.env },
    cwd: '',
    failOnStartupError: false,
  })
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
export function applyMcpBridge(
  ctx: Context,
  getValue: () => { servers: McpServerConfig[] } | undefined,
): { sync: () => void; dispose: () => Promise<void> } {
  const instances = new Map<string, LiveInstance>()
  let chain: Promise<void> = Promise.resolve()

  const syncOnce = async (): Promise<void> => {
    const servers = getValue()?.servers ?? []
    const next = new Map<string, McpServerConfig>()
    for (const server of servers) {
      if (!server.enabled) continue
      if (next.has(server.name)) continue
      next.set(server.name, server)
    }
    for (const [name, server] of next) {
      const signature = JSON.stringify(server)
      const existing = instances.get(name)
      if (existing !== undefined && existing.signature === signature) continue
      if (existing !== undefined) {
        await existing.fiber.dispose()
        instances.delete(name)
      }
      let config: McpClient.Config
      try {
        config = toClientConfig(server)
      } catch (error: unknown) {
        ctx.logger.warn('mcp-bridge: invalid server config for "%s": %s', name, String(error))
        continue
      }
      const fiber = ctx.plugin(McpClient, config)
      instances.set(name, { fiber, signature })
    }
    for (const [name, { fiber }] of instances) {
      if (!next.has(name)) {
        await fiber.dispose()
        instances.delete(name)
      }
    }
  }

  const sync = (): void => {
    chain = chain.then(syncOnce).catch((error: unknown) => {
      ctx.logger.warn('mcp-bridge: sync failed: %s', String(error))
    })
  }

  const dispose = async (): Promise<void> => {
    chain = chain.finally(async () => {
      for (const [, { fiber }] of instances) {
        try { await fiber.dispose() } catch { /* instance already gone */ }
      }
      instances.clear()
    })
    await chain
  }

  sync()
  return { sync, dispose }
}
