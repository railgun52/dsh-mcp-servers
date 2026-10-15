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
  enabled: boolean
}

export interface McpSectionInjected {
  load: () => unknown[]
  save: (servers: unknown[]) => Promise<void>
  t: (key: McpKey) => string
}

export type McpSectionProps = Partial<McpSectionInjected>

function serversToJson(servers: McpServer[]): string {
  const mcpServers: Record<string, Record<string, unknown>> = {}
  for (const s of servers) {
    const entry: Record<string, unknown> = { command: s.command }
    if (s.args.length > 0) entry.args = s.args
    if (Object.keys(s.env).length > 0) entry.env = s.env
    if (s.transport === 'streamable-http') entry.transport = 'streamable-http'
    if (s.url) entry.url = s.url
    if (!s.enabled) entry.enabled = false
    mcpServers[s.name] = entry
  }
  return JSON.stringify({ mcpServers }, null, 2)
}

function jsonToServers(text: string): McpServer[] {
  const parsed = JSON.parse(text)
  const map = parsed.mcpServers
  if (!map || typeof map !== 'object') throw new Error('Missing "mcpServers" key')
  return Object.entries(map).map(([name, config]) => {
    const c = config as Record<string, unknown>
    const args = Array.isArray(c.args) ? c.args.map(String) : []
    const env = c.env && typeof c.env === 'object'
      ? Object.fromEntries(Object.entries(c.env).map(([k, v]) => [k, String(v)]))
      : {}
    return {
      name,
      command: String(c.command ?? ''),
      args,
      env,
      transport: c.transport === 'streamable-http' ? 'streamable-http' as const : 'stdio' as const,
      url: String(c.url ?? ''),
      enabled: c.enabled !== false,
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
      setServers(loaded as McpServer[])
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
                <code>{server.command} {server.args.join(' ')}</code>
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


