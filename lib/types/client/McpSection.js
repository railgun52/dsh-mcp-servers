import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Button, IconEditOutlineRegular, IconPlusOutlineRegular, IconTrashOutlineRegular, Modal, Switch } from '@deepseek-ai/dsh-client-ui-primitives';
import styles from './McpSection.module.css';
function serversToJson(servers) {
    const mcpServers = {};
    for (const s of servers) {
        const entry = { command: s.command };
        if (s.args.length > 0)
            entry.args = s.args;
        if (Object.keys(s.env).length > 0)
            entry.env = s.env;
        if (s.transport === 'streamable-http')
            entry.transport = 'streamable-http';
        if (s.url)
            entry.url = s.url;
        if (!s.enabled)
            entry.enabled = false;
        mcpServers[s.name] = entry;
    }
    return JSON.stringify({ mcpServers }, null, 2);
}
function jsonToServers(text) {
    const parsed = JSON.parse(text);
    const map = parsed.mcpServers;
    if (!map || typeof map !== 'object')
        throw new Error('Missing "mcpServers" key');
    return Object.entries(map).map(([name, config]) => {
        const c = config;
        const args = Array.isArray(c.args) ? c.args.map(String) : [];
        const env = c.env && typeof c.env === 'object'
            ? Object.fromEntries(Object.entries(c.env).map(([k, v]) => [k, String(v)]))
            : {};
        return {
            name,
            command: String(c.command ?? ''),
            args,
            env,
            transport: c.transport === 'streamable-http' ? 'streamable-http' : 'stdio',
            url: String(c.url ?? ''),
            enabled: c.enabled !== false,
        };
    });
}
const EMPTY_TEMPLATE = JSON.stringify({
    mcpServers: {
        'my-server': {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-filesystem', '/path'],
        },
    },
}, null, 2);
export function McpSection({ load, save, t: t_ }) {
    const t = t_ ?? ((key) => key);
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [editJson, setEditJson] = useState('');
    const [editIndex, setEditIndex] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editError, setEditError] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const loadConfig = useCallback(() => {
        setLoading(true);
        setError(null);
        try {
            const loaded = load?.() ?? [];
            setServers(loaded);
        }
        catch (e) {
            setError(t('loadFailed'));
        }
        finally {
            setLoading(false);
        }
    }, [load, t]);
    useEffect(() => { loadConfig(); }, [loadConfig]);
    const saveConfig = async (newServers) => {
        setSaving(true);
        setError(null);
        try {
            await save?.(newServers);
            setServers(newServers);
        }
        catch (e) {
            setError(t('saveFailed'));
        }
        finally {
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
        if (!server)
            return;
        setEditJson(serversToJson([server]));
        setEditIndex(index);
        setEditError(null);
        setShowEditModal(true);
    };
    const handleSaveJson = async () => {
        try {
            const parsed = jsonToServers(editJson);
            if (parsed.length === 0) {
                setEditError('No servers found in JSON');
                return;
            }
            if (editIndex !== null) {
                const newServers = [...servers];
                newServers[editIndex] = parsed[0];
                await saveConfig(newServers);
            }
            else {
                const merged = new Map(servers.map(s => [s.name, s]));
                for (const s of parsed)
                    merged.set(s.name, s);
                await saveConfig(Array.from(merged.values()).filter((s) => s !== undefined));
            }
            setShowEditModal(false);
        }
        catch (e) {
            setEditError(e instanceof Error ? e.message : String(e));
        }
    };
    const handleToggle = async (index, enabled) => {
        const newServers = servers.map((s, i) => (i === index ? { ...s, enabled } : s));
        await saveConfig(newServers);
    };
    const handleDelete = async (index) => {
        const newServers = servers.filter((_, i) => i !== index);
        await saveConfig(newServers);
        setDeleteTarget(null);
    };
    if (loading) {
        return _jsx("div", { className: styles.section, children: _jsx("div", { className: styles.loading, children: "Loading..." }) });
    }
    return (_jsxs("div", { className: styles.section, children: [_jsxs("div", { className: styles.header, children: [_jsx("h2", { className: styles.title, children: t('title') }), _jsx("p", { className: styles.intro, children: t('intro') })] }), error && _jsx("div", { className: styles.error, children: error }), _jsx("div", { className: styles.toolbar, children: _jsxs(Button, { onClick: handleAdd, disabled: saving, children: [_jsx(IconPlusOutlineRegular, {}), " ", t('add')] }) }), servers.length === 0 && (_jsx("div", { className: styles.empty, children: t('noServers') })), _jsx("div", { className: styles.list, children: servers.map((server, i) => (_jsxs("div", { className: styles.card, children: [_jsxs("div", { className: styles.cardBody, children: [_jsxs("div", { className: styles.cardName, children: [_jsx("span", { className: server.enabled ? styles.statusOn : styles.statusOff }), server.name] }), _jsx("div", { className: styles.cardMeta, children: _jsxs("code", { children: [server.command, " ", server.args.join(' ')] }) })] }), _jsxs("div", { className: styles.cardActions, children: [_jsx(Switch, { checked: server.enabled, onChange: enabled => handleToggle(i, enabled), label: `${server.name} ${server.enabled ? t('enabled') : t('disabled')}`, title: server.enabled ? t('enabled') : t('disabled'), className: styles.enableSwitch, disabled: saving }), _jsx("button", { className: styles.iconBtn, title: t('edit'), "aria-label": t('edit'), onClick: () => handleEdit(i), children: _jsx(IconEditOutlineRegular, {}) }), _jsx("button", { className: styles.deleteBtn, onClick: () => setDeleteTarget({ name: server.name, index: i }), children: _jsx(IconTrashOutlineRegular, {}) })] })] }, i))) }), showEditModal && (_jsx(Modal, { open: true, onClose: () => setShowEditModal(false), title: editIndex !== null ? t('edit') : t('add'), closeLabel: t('close'), className: styles.dialogMcp ?? '', footer: (_jsxs(_Fragment, { children: [_jsx(Button, { onClick: handleSaveJson, disabled: saving, children: t('save') }), _jsx(Button, { onClick: () => setShowEditModal(false), children: t('cancel') })] })), children: _jsxs("div", { className: styles.modalBody, children: [editError && _jsx("div", { className: styles.error, children: editError }), _jsx("textarea", { className: styles.jsonEditor, value: editJson, onChange: e => setEditJson(e.target.value), rows: 16, spellCheck: false })] }) })), deleteTarget && (_jsx(Modal, { open: true, onClose: () => setDeleteTarget(null), title: t('remove'), closeLabel: t('close'), className: styles.dialogMcp ?? '', footer: (_jsxs(_Fragment, { children: [_jsx(Button, { onClick: () => handleDelete(deleteTarget.index), children: t('remove') }), _jsx(Button, { onClick: () => setDeleteTarget(null), children: t('cancel') })] })), children: _jsxs("div", { className: styles.modalBody, children: [_jsx("p", { children: t('deleteConfirm').replace('{server}', deleteTarget.name) }), _jsx("p", { children: t('deleteDescription') })] }) }))] }));
}
//# sourceMappingURL=McpSection.js.map