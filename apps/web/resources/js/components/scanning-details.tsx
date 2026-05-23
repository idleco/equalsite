import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Ban, Calendar, Check, CheckCircle, CircleDot, CircleSmall, CircleX, Clock, ExternalLink, Hourglass, Layers, Play } from "lucide-react";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from './ui/item';
import { Badge } from "./ui/badge";
import { Spinner } from "./ui/spinner";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Stack } from "./stack";
import { usePage, usePoll } from "@inertiajs/react";
import { useEffect } from "react";

// surface dark-bg #0e1523
// card dark-bg #1a2330

function QueuePosition() {
    const { stats } = usePage<{
        stats: {
            position: number;
            waiting: number;
        }
    }>().props;

    const { start, stop } = usePoll(2000, { only: ['stats']}, {
        autoStart: false,
    });

    useEffect(() => {
        if (stats.position !== -1) {
            start();
        }
        return stop;
    });

    console.log(stats)
    return (
        <Item variant="outline">
            <ItemMedia variant="icon">
                <Layers className="size-4" />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>Your place in queue</ItemTitle>
                <ItemTitle className="text-2xl">{stats.position} / {stats.waiting}</ItemTitle>
                <ItemDescription>Jobs ahead of you: 4</ItemDescription>
            </ItemContent>
        </Item>
    )
}

function StatusBadge() {
    return (
        <Badge className="bg-chart-3/20 text-chart-3 leading-normal font-semibold">
            <CircleSmall className="text-chart-3 fill-chart-3" data-icon="inline-start" />
            QUEUED
        </Badge>
    )
}

export default function ScanningDetails() {
    return (
        <Card>
            <CardHeader>
                <StatusBadge />
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-2 min-h-24">
                <div className="border flex flex-col justify-between rounded-md py-2 px-3">
                    <CardTitle className="font-bold text-2xl tracking-wider">Scan #8882</CardTitle>
                    <div>
                        <div className="text-xs">Target URL</div>
                        <Button size="sm" variant="link" className="text-indigo-500">
                            https://example.com
                            <ExternalLink data-icon="inline-end" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <QueuePosition />
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
                <Item variant="outline">
                    <ItemMedia variant="icon">
                        <Clock className="size-4" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Time Elapsed</ItemTitle>
                        <ItemDescription>00:00:00</ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="outline">
                    <ItemMedia variant="icon">
                        <CircleDot className="size-4" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Status</ItemTitle>
                        <ItemDescription>
                            <span className="inline-flex gap-1">
                                <CircleSmall className="text-chart-3 size-3 fill-chart-3 self-center" data-icon="inline-start" />
                                <span>Queued</span>
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
                            {(new Date()).toDateString()}
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
                            {(new Date()).toDateString()}
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
                            {(new Date()).toDateString()}
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
                            {(new Date()).toDateString()}
                        </ItemDescription>
                    </ItemContent>
                </Item>
            </CardFooter>
        </Card>
    )
}
