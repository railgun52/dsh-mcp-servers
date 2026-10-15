/**
 * Node-half build for the self-contained host bundle.
 *
 * The dsh host does not expose its own @deepseek-ai packages to plugins, so a
 * published plugin must carry its runtime dependencies itself. Everything except
 * schemastery is therefore inlined into lib/index.js; schemastery stays external
 * because schema objects cross the settings-service boundary and must keep the
 * single shared identity the host already loaded.
 *
 * The browser half (lib/client.js) and the tsc output (lib/types) are unchanged
 * since 0.1.2 and are not rebuilt here.
 */
import { isBuiltin } from 'node:module'

const SCHEMASTERY = /^@deepseek-ai\/schemastery(\/|$)/

export default {
  name: '@railgun52/dsh-mcp-servers',
  entry: ['lib/types/index.js', 'lib/types/invariant.js'],
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  clean: false,
  deps: {
    neverBundle: (specifier: string) => SCHEMASTERY.test(specifier),
    alwaysBundle: (specifier: string) =>
      !isBuiltin(specifier) && !SCHEMASTERY.test(specifier),
  },
}
