import { useState, useEffect, useCallback } from 'react'
import { Button, IconEditOutlineRegular, IconPlusOutlineRegular, IconTrashOutlineRegular, Modal, Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import type { McpKey } from './locales.ts'
import styles from './McpSection.module.css'

interface McpServer {
  name: string
  command: string
  args: string[]
  env: Record<string, string>
  transport: 'stdio' | 'streamable-http'
  url: string
  headers: Record<string, string>
  enabled: boolean
  extra: Record<string, unknown>
}

export interface McpSectionInjected {
  load: () => unknown[]
  save: (servers: unknown[]) => Promise<void>
  t: (key: McpKey) => string
}

export type McpSectionProps = Partial<McpSectionInjected>

/** Keys this plugin models itself; any other JSON key round-trips through `extra`. */
const KNOWN_KEYS = new Set(['command', 'args', 'env', 'transport', 'url', 'headers', 'enabled'])

/** Coerce one settings entry (possibly written by an older version) into a full record. */
function normalizeServer(raw: Partial<McpServer>): McpServer {
  const asStrings = (value: unknown): Record<string, string> =>
    value !== null && typeof value === 'object'
      ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, String(v)]))
      : {}
  return {
    name: String(raw.name ?? ''),
    command: String(raw.command ?? ''),
    args: Array.isArray(raw.args) ? raw.args.map(String) : [],
    env: asStrings(raw.env),
    transport: raw.transport === 'streamable-http' ? 'streamable-http' : 'stdio',
    url: String(raw.url ?? ''),
    headers: asStrings(raw.headers),
    enabled: raw.enabled !== false,
    extra: raw.extra !== null && typeof raw.extra === 'object' ? { ...raw.extra } : {},
  }
}

function serversToJson(servers: McpServer[]): string {
  const mcpServers: Record<string, Record<string, unknown>> = {}
  for (const s of servers) {
    // Unknown keys first, so the modelled ones below always win on a collision.
    const entry: Record<string, unknown> = { ...s.extra }
    if (s.transport === 'streamable-http') {
      entry.url = s.url
      if (Object.keys(s.headers).length > 0) entry.headers = s.headers
    } else {
      entry.command = s.command
      if (s.args.length > 0) entry.args = s.args
      if (Object.keys(s.env).length > 0) entry.env = s.env
      // A stdio entry normally has no url, but keep one if it was written by hand.
      if (s.url) entry.url = s.url
    }
    if (!s.enabled) entry.enabled = false
    mcpServers[s.name] = entry
  }
  return JSON.stringify({ mcpServers }, null, 2)
}

/**
 * Parse the editor text into server entries. An explicit `transport` always wins;
 * otherwise a config carrying a `url` and no `command` is the standard MCP way of
 * declaring a remote Streamable HTTP server, while everything else stays stdio so
 * existing command-based entries keep their meaning.
 */
function jsonToServers(text: string): McpServer[] {
  const parsed = JSON.parse(text)
  const map = parsed.mcpServers
  if (!map || typeof map !== 'object') throw new Error('Missing "mcpServers" key')
  return Object.entries(map).map(([name, config]) => {
    const c = config !== null && typeof config === 'object' ? config as Record<string, unknown> : {}
    const asStrings = (value: unknown): Record<string, string> =>
      value !== null && typeof value === 'object'
        ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, String(v)]))
        : {}
    const command = String(c.command ?? '')
    const url = String(c.url ?? '')
    const transport: McpServer['transport'] = c.transport === 'streamable-http'
      ? 'streamable-http'
      : c.transport === 'stdio'
        ? 'stdio'
        : url !== '' && command === ''
          ? 'streamable-http'
          : 'stdio'
    const extra: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(c)) {
      if (!KNOWN_KEYS.has(key)) extra[key] = value
    }
    return {
      name,
      command,
      args: Array.isArray(c.args) ? c.args.map(String) : [],
      env: asStrings(c.env),
      transport,
      url,
      headers: asStrings(c.headers),
      enabled: c.enabled !== false,
      extra,
    }
  })
}

const EMPTY_TEMPLATE = JSON.stringify({
  mcpServers: {
    'my-server': {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/path'],
    },
  },
}, null, 2)

export function McpSection({ load, save, t: t_ }: McpSectionProps) {
  const t = t_ ?? ((key: string) => key)
  const [servers, setServers] = useState<McpServer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editJson, setEditJson] = useState('')
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ name: string; index: number } | null>(null)

  const loadConfig = useCallback(() => {
    setLoading(true)
    setError(null)
    try {
      const loaded = load?.() ?? []
      setServers((loaded as Partial<McpServer>[]).map(normalizeServer))
    } catch (e) {
      setError(t('loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [load, t])

  useEffect(() => { loadConfig() }, [loadConfig])

  const saveConfig = async (newServers: McpServer[]) => {
    setSaving(true)
    setError(null)
    try {
      await save?.(newServers)
      setServers(newServers)
    } catch (e) {
      setError(t('saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = () => {
    setEditJson(EMPTY_TEMPLATE)
    setEditIndex(null)
    setEditError(null)
    setShowEditModal(true)
  }

  const handleEdit = (index: number) => {
    const server = servers[index]
    if (!server) return
    setEditJson(serversToJson([server]))
    setEditIndex(index)
    setEditError(null)
    setShowEditModal(true)
  }

  const handleSaveJson = async () => {
    try {
      const parsed = jsonToServers(editJson)
      if (parsed.length === 0) {
        setEditError('No servers found in JSON')
        return
      }
      if (editIndex !== null) {
        const newServers = [...servers]
        newServers[editIndex] = parsed[0]!
        await saveConfig(newServers)
      } else {
        const merged = new Map(servers.map(s => [s.name, s]))
        for (const s of parsed) merged.set(s.name, s)
        await saveConfig(Array.from(merged.values()).filter((s): s is McpServer => s !== undefined))
      }
      setShowEditModal(false)
    } catch (e) {
      setEditError(e instanceof Error ? e.message : String(e))
    }
  }

  const handleToggle = async (index: number, enabled: boolean) => {
    const newServers = servers.map((s, i) => (i === index ? { ...s, enabled } : s))
    await saveConfig(newServers)
  }

  const handleDelete = async (index: number) => {
    const newServers = servers.filter((_, i) => i !== index)
    await saveConfig(newServers)
    setDeleteTarget(null)
  }

  if (loading) {
    return <div className={styles.section}><div className={styles.loading}>Loading...</div></div>
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('title')}</h2>
        <p className={styles.intro}>{t('intro')}</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.toolbar}>
        <Button onClick={handleAdd} disabled={saving}>
          <IconPlusOutlineRegular /> {t('add')}
        </Button>
      </div>

      {servers.length === 0 && (
        <div className={styles.empty}>{t('noServers')}</div>
      )}

      <div className={styles.list}>
        {servers.map((server, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardBody}>
              <div className={styles.cardName}>
                <span className={server.enabled ? styles.statusOn : styles.statusOff} />
                {server.name}
              </div>
              <div className={styles.cardMeta}>
                <code>
                  {server.transport === 'streamable-http'
                    ? server.url
                    : `${server.command} ${server.args.join(' ')}`.trim()}
                </code>
              </div>
            </div>
            <div className={styles.cardActions}>
              <Switch
                checked={server.enabled}
                onChange={enabled => handleToggle(i, enabled)}
                label={`${server.name} ${server.enabled ? t('enabled') : t('disabled')}`}
                title={server.enabled ? t('enabled') : t('disabled')}
                className={styles.enableSwitch}
                disabled={saving}
              />
              <button
                className={styles.iconBtn}
                title={t('edit')}
                aria-label={t('edit')}
                onClick={() => handleEdit(i)}
              >
                <IconEditOutlineRegular />
              </button>
              <button className={styles.deleteBtn} onClick={() => setDeleteTarget({ name: server.name, index: i })}>
                <IconTrashOutlineRegular />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showEditModal && (
        <Modal
          open
          onClose={() => setShowEditModal(false)}
          title={editIndex !== null ? t('edit') : t('add')}
          closeLabel={t('close')}
          className={styles.dialogMcp ?? ''}
          footer={(
            <>
              <Button onClick={handleSaveJson} disabled={saving}>{t('save')}</Button>
              <Button onClick={() => setShowEditModal(false)}>{t('cancel')}</Button>
            </>
          )}
        >
          <div className={styles.modalBody}>
            {editError && <div className={styles.error}>{editError}</div>}
            <textarea
              className={styles.jsonEditor}
              value={editJson}
              onChange={e => setEditJson(e.target.value)}
              rows={16}
              spellCheck={false}
            />
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          open
          onClose={() => setDeleteTarget(null)}
          title={t('remove')}
          closeLabel={t('close')}
          className={styles.dialogMcp ?? ''}
          footer={(
            <>
              <Button onClick={() => handleDelete(deleteTarget.index)}>{t('remove')}</Button>
              <Button onClick={() => setDeleteTarget(null)}>{t('cancel')}</Button>
            </>
          )}
        >
          <div className={styles.modalBody}>
            <p>{t('deleteConfirm').replace('{server}', deleteTarget.name)}</p>
            <p>{t('deleteDescription')}</p>
          </div>
        </Modal>
      )}
    </div>
  )
}


