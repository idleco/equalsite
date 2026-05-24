import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ProgressWebSocketEvent, Stats, UpdatedWebSocketEvent } from "@equalsite/types";
import type { Audit, ProcessedUrl } from "./types";
import { useEchoPublic } from "@laravel/echo-react";

type ScanningContextValue = {
    onCancel: () => void;
    audit: {
        details: Audit;
        stats: Stats;
        processedUrls: ProcessedUrl[];
    };
};

const ScanningContext = createContext<ScanningContextValue | undefined>(undefined);

type Props = {
    audit: Audit;
    stats: Stats;
    processedUrls: ProcessedUrl[];
    children: React.ReactNode
};

function unique(urls: ProcessedUrl[]) {
    return [...new Map(urls.map((i) => [i.url, i])).values()];
}

export function ScanningContextProvider(props: Props) {
    const [audit, setAudit] = useState<ScanningContextValue['audit']>({
        stats: props.stats,
        processedUrls: props.processedUrls,
        details: { ...props.audit,
            id: String(props.audit.id).padStart(6, '0')
        },
    });

    useEchoPublic<UpdatedWebSocketEvent | ProgressWebSocketEvent>(
        `audits.${audit.details.crawlId}`,
        ['.audit.updated', '.audit.progress'],
        (e) => {
            if (e.event === 'audit.updated') {
                const data = e.data as UpdatedWebSocketEvent['data'];
                setAudit(prev => ({
                    ...prev,
                    stats: { ...prev.stats, ...data.stats },
                    details: { ...prev.details, ...{
                        failureReason: data.failureReason,
                        cancelledAt: data.cancelledAt,
                        completedAt: data.completedAt,
                        startedAt: data.startedAt,
                        status: data.status
                    }},
                }));
            }

            else if (e.event === 'audit.progress') {
                const data = e.data as ProgressWebSocketEvent['data'];
                setAudit(prev => ({
                    ...prev,
                    stats: { ...prev.stats, ...data.stats },
                    processedUrls: unique([
                        ...prev.processedUrls,
                        {
                            url: data.url,
                            violations: data.violations,
                            timestamp: data.timestamp,
                            severityBreakdown: data.severityBreakdown
                        }
                    ])
                }));
            }
        },
        [audit]
    );

    const handleCancel = useCallback(() => {
        console.log('cancel button pressed');
    }, [])

    const value = useMemo(
        () => ({
            audit,
            onCancel: handleCancel,
        }),
        [audit, handleCancel]
    )

    return (
        <ScanningContext.Provider value={value}>
            {props.children}
        </ScanningContext.Provider>
    )
}

export function useScanningContext(): ScanningContextValue {
    const context = useContext(ScanningContext);
    if (! context) {
        throw new Error('useScanningContext must be wrapped by ScanningContextProvider.');
    }
    return context;
}
