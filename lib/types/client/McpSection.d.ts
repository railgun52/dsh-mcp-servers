import type { McpKey } from './locales.ts';
export interface McpSectionInjected {
    load: () => unknown[];
    save: (servers: unknown[]) => Promise<void>;
    t: (key: McpKey) => string;
}
export type McpSectionProps = Partial<McpSectionInjected>;
export declare function McpSection({ load, save, t: t_ }: McpSectionProps): import("react").JSX.Element;
//# sourceMappingURL=McpSection.d.ts.map