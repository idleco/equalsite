import type { ServerityBreakdown } from "@equalsite/types";
import { ImpactLevel, type ImpactLevelKey, type ScannedUrl } from "@/types";

export const sortSeverityBreakdown = (breakdown: ServerityBreakdown): ImpactLevelKey[] => {
    const impactLevels = Object.keys(breakdown) as ImpactLevelKey[];
    return impactLevels.sort((a, b) => ImpactLevel[a] - ImpactLevel[b]);
}

export const normalizeUrls = (urls: Record<string, ScannedUrl>) => {
    return Object.keys(urls).reverse().map(i => ({
        ...urls[i],
        url: i,
    }));
}
