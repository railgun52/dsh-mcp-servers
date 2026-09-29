import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import { McpSection } from './McpSection.tsx'
import type { McpSectionInjected } from './McpSection.tsx'
import { en, zh, type McpKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'settings.mcp': McpKey
  }
}
const NS = 'settings.mcp'
const NAMESPACE = 'mcp-servers'

interface McpServersConfig {
  servers: unknown[]
}

export const inject = ['slots', 'locale', 'configForms']

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-settings-mcp: copy dictionaries')
  const form = ctx.configForms.get<McpServersConfig>(NAMESPACE)
  const t = ctx.locale.bind(NS) as McpSectionInjected['t']
  const load = (): unknown[] => form.getSnapshot().value?.servers ?? []
  const save = async (servers: unknown[]): Promise<void> => { await form.set('servers', servers) }
  ctx.effect(() => ctx.configForms.whileServed([NAMESPACE], () => ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'mcp',
    order: 25,
    label: () => t('nav'),
    locale: NS,
    inject: (): McpSectionInjected => ({ load, save, t }),
  }, McpSection))), 'ui-settings-mcp: page')
}
