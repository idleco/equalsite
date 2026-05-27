import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Ban, Calendar, CheckCircle, CircleDot, CircleSmall, CircleX, ExternalLink, Layers, Play } from "lucide-react";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePage, usePoll } from "@inertiajs/react";
import { useEffect } from "react";
import TimeElapsed from "./time-elapsed";
import { cn, str } from "@/lib/utils";
import type { Audit } from "./types";
import type { QueueStatus } from "@equalsite/types";

function QueuePosition(
    props: { queueStatus: QueueStatus }
) {
    const {
        position,
        waiting,
        ahead
    } = props.queueStatus;
    const { start, stop } = usePoll(2000, { only: ['queueStatus'] }, {
        autoStart: false,
    });
    useEffect(() => {
        if (position > 0) {
            start();
        }
        return () => {
            stop();
        }
    }, [position, start, stop]);
    return (
        <Item variant="outline">
            <ItemMedia variant="icon">
                <Layers className="size-4" />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>Your place in queue</ItemTitle>
                {position > 0 ? (
                    <ItemTitle className="text-2xl">
                        {position} / {waiting}
                    </ItemTitle>
                ) : (
                    <ItemTitle className="text-2xl">
                        Next
                    </ItemTitle>
                )}
                <ItemDescription>Jobs ahead of you: {ahead}</ItemDescription>
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

type Props = {
    audit: Audit;
    queueStatus: QueueStatus;
};

export default function ScanDetails({
    audit,
    queueStatus
}: Props) {
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
                        })[audit.status]
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
                        })[audit.status]}
                    />
                    {audit.status.toUpperCase()}
                </Badge>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-2 min-h-24">
                <div className="border flex flex-col justify-between rounded-md py-2 px-3">
                    <CardTitle className="font-bold text-2xl tracking-wider">
                        {`Scan #${String(audit.id).padStart(6, '0')}`}
                    </CardTitle>
                    <div>
                        <div className="text-xs">Target URL</div>
                        <Button size="sm" variant="link" className="text-indigo-500">
                            {audit.siteUrl}
                            <ExternalLink data-icon="inline-end" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <QueuePosition queueStatus={queueStatus} />
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
                <TimeElapsed createdAt={audit.createdAt} startedAt={audit.startedAt} />
                <Item variant="outline">
                    <ItemMedia variant="icon">
                        <CircleDot className="size-4" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Status</ItemTitle>
                        <ItemDescription>
                            <span className="inline-flex gap-1">
                                <CircleSmall className="text-chart-3 size-3 fill-chart-3 self-center" data-icon="inline-start" />
                                <span>{str.title(audit.status)}</span>
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
                            {formatDate(audit.createdAt)}
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
                            {formatDate(audit.startedAt)}
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
                            {formatDate(audit.completedAt)}
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
                            {formatDate(audit.cancelledAt)}
                        </ItemDescription>
                    </ItemContent>
                </Item>
            </CardFooter>
        </Card>
    )
}
