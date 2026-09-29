const PACKAGE_NAME = '@deepseek-ai/dsh-client-ui-settings-mcp';
export const name = 'client-ui-settings-mcp-invariant';
export const inject = ['invariants'];
const install = () => { };
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//# sourceMappingURL=invariant.js.map