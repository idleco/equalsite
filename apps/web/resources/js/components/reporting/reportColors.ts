type Tone = 'slate' | 'amber' | 'blue' | 'emerald' | 'rose';

const toneClasses: Record<Tone, string> = {
    slate: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:ring-slate-700',
    amber: 'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
    blue: 'bg-blue-100 text-blue-800 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/30',
    emerald: 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
    rose: 'bg-rose-100 text-rose-800 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30',
};

export function statusToneClasses(tone: string): string {
    return toneClasses[(tone as Tone) || 'slate'] ?? toneClasses.slate;
}

export function impactToneClasses(impact: string): string {
    return statusToneClasses(impactToTone(impact));
}

export function impactTextClasses(impact: string): string {
    return {
        critical: 'dark:text-rose-700 text-rose-300',
        serious: 'dark:text-amber-700 text-amber-300',
        moderate: 'dark:text-blue-700 text-blue-300',
        minor: 'dark:text-emerald-700 text-emerald-300',
    }[impact] ?? 'dark:text-slate-700 text-slate-200';
}

export function impactToTone(impact: string): Tone {
    switch (impact.toLowerCase()) {
        case 'critical':
            return 'rose';
        case 'serious':
            return 'amber';
        case 'moderate':
            return 'blue';
        case 'minor':
            return 'emerald';
        default:
            return 'slate';
    }
}
