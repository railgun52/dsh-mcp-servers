import { McpSection } from "./McpSection.js";
import { en, zh } from "./locales.js";
const NS = 'settings.mcp';
const NAMESPACE = 'mcp-servers';
export const inject = ['slots', 'locale', 'configForms'];
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-settings-mcp: copy dictionaries');
    const form = ctx.configForms.get(NAMESPACE);
    const t = ctx.locale.bind(NS);
    const load = () => form.getSnapshot().value?.servers ?? [];
    const save = async (servers) => { await form.set('servers', servers); };
    ctx.effect(() => ctx.configForms.whileServed([NAMESPACE], () => ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'mcp',
        order: 25,
        label: () => t('nav'),
        locale: NS,
        inject: () => ({ load, save, t }),
    }, McpSection))), 'ui-settings-mcp: page');
}
//# sourceMappingURL=index.js.map