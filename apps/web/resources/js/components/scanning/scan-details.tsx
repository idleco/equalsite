import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Ban, Calendar, CheckCircle, CircleDot, CircleSmall, CircleX, ExternalLink, Layers, Play } from "lucide-react";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePoll } from "@inertiajs/react";
import { useEffect } from "react";
import TimeElapsed from "./time-elapsed";
import { cn, str } from "@/lib/utils";
import type { ScanInfo, ScanQueue } from "@/types";

function QueuePosition({
    scanQueue
}:{
    scanQueue: ScanQueue
}) {
    const { start, stop } = usePoll(2000, { only: ['queueStatus'] }, {
        autoStart: false,
    });
    useEffect(() => {
        if (scanQueue.position > 0) {
            start();
        }
        return () => {
            stop();
        }
    }, [scanQueue, start, stop]);
    return (
        <Item variant="outline">
            <ItemMedia variant="icon">
                <Layers className="size-4" />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>Your place in queue</ItemTitle>
                {scanQueue.position > 0 ? (
                    <ItemTitle className="text-2xl">
                        {scanQueue.position} / {scanQueue.waiting}
                    </ItemTitle>
                ) : (
                    <ItemTitle className="text-2xl">
                        Next
                    </ItemTitle>
                )}
                <ItemDescription>Jobs ahead of you: {scanQueue.ahead}</ItemDescription>
            </ItemContent>
        </Item>
    )
}

function formatDate(dateString?: string): string {
    if (!dateString) {
        return '-';
    }
    const date = new Date(dateString);
    // const today = new Date();
    // const includeYear = date.getFullYear() !== today.getFullYear();
    return date.toLocaleString('default', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        year: 'numeric'
    });
}

type ScanDetailsProps = {
    scanInfo: ScanInfo;
    scanQueue: ScanQueue;
};

export default function ScanDetails({
    scanInfo,
    scanQueue
}: ScanDetailsProps) {
    return (
        <Card>
            <CardHeader>
                <Badge
                    className={cn(
                        'leading-normal font-semibold',
                        ({
                            'queued': 'bg-chart-3/20 text-chart-3',
                            'started': 'bg-chart-1/20 text-chart-1',
                            'completed': 'bg-chart-2/20 text-chart-2',
                            'cancelled': 'bg-chart-5/20 text-chart-5',
                            'failed': 'bg-chart-5/20 text-chart-5'
                        })[scanInfo.status]
                    )}
                >
                    <CircleSmall
                        data-icon="inline-start"
                        className={({
                            'queued': 'fill-chart-3',
                            'started': 'fill-chart-1',
                            'completed': 'fill-chart-2',
                            'cancelled': 'fill-chart-5',
                            'failed': 'fill-chart-5'
                        })[scanInfo.status]}
                    />
                    {scanInfo.status.toUpperCase()}
                </Badge>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-2 min-h-24">
                <div className="border flex flex-col justify-between rounded-md py-2 px-3">
                    <CardTitle className="font-bold text-2xl tracking-wider">
                        {`Scan #${String(scanInfo.auditId).padStart(6, '0')}`}
                    </CardTitle>
                    <div>
                        <div className="text-xs">Target URL</div>
                        <Button size="sm" variant="link" className="text-indigo-500">
                            {scanInfo.siteUrl}
                            <ExternalLink data-icon="inline-end" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <QueuePosition scanQueue={scanQueue} />
                    <div className="rounded-md border text-center text-xs flex flex-col justify-center gap-2 py-2 px-3">
                        <div>
                            <Button variant="destructive">
                                <Ban data-icon="inline-start" />
                                Cancel
                            </Button>
                        </div>
                        <p>
                            This will remove the job from the queue.
                        </p>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="grid grid-cols-6 gap-2">
                <TimeElapsed createdAt={scanInfo.createdAt} startedAt={scanInfo.startedAt} />
                <Item variant="outline">
                    <ItemMedia variant="icon">
                        <CircleDot className="size-4" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Status</ItemTitle>
                        <ItemDescription>
                            <span className="inline-flex gap-1">
                                <CircleSmall className="text-chart-3 size-3 fill-chart-3 self-center" data-icon="inline-start" />
                                <span>{str.title(scanInfo.status)}</span>
                            </span>
                        </ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="outline">
                    <ItemMedia variant="icon">
                        <Calendar className="size-4" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Created At</ItemTitle>
                        <ItemDescription>
                            {formatDate(scanInfo.createdAt)}
                        </ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="outline">
                    <ItemMedia variant="icon">
                        <Play className="size-4" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Started At</ItemTitle>
                        <ItemDescription>
                            {formatDate(scanInfo.startedAt)}
                        </ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="outline">
                    <ItemMedia variant="icon">
                        <CheckCircle className="size-4" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Completed At</ItemTitle>
                        <ItemDescription>
                            {formatDate(scanInfo.completedAt)}
                        </ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="outline">
                    <ItemMedia variant="icon">
                        <CircleX className="size-4" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Cancelled At</ItemTitle>
                        <ItemDescription>
                            {formatDate(scanInfo.cancelledAt)}
                        </ItemDescription>
                    </ItemContent>
                </Item>
            </CardFooter>
        </Card>
    )
}
