import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Ban, Calendar, Check, CheckCircle, CircleDot, CircleSmall, CircleX, Clock, ExternalLink, Hourglass, Play } from "lucide-react";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from './ui/item';
import { Badge } from "./ui/badge";
import { Spinner } from "./ui/spinner";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";

// surface dark-bg #0e1523
// card dark-bg #1a2330

function StatusBadge() {
    return (
        <Badge className="bg-chart-3/20 text-chart-3">
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
                        <h2 className="font-bold tracking-wider">Scan #8882</h2>
                        <div>
                            <div className="text-xs">Target URL</div>
                            <Button size="sm" variant="link" className="text-indigo-500">
                                https://example.com
                                <ExternalLink data-icon="inline-end" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Item variant="outline">
                            <ItemMedia>
                                <Hourglass className="size-4" />
                            </ItemMedia>
                            <ItemContent>
                                <ItemTitle>Your place in queue</ItemTitle>
                                <ItemTitle className="text-2xl">4 / 12</ItemTitle>
                                <ItemDescription>Jobs ahead of you: 4</ItemDescription>
                            </ItemContent>
                        </Item>
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
                    <ItemMedia>
                        <Clock className="size-4" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Time Elapsed</ItemTitle>
                        <ItemDescription>00:00:00</ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="outline">
                    <ItemMedia>
                        <CircleDot className="size-4" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Status</ItemTitle>
                        <ItemDescription>
                            <StatusBadge />
                        </ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="outline">
                    <ItemMedia>
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
                    <ItemMedia>
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
                    <ItemMedia>
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
                    <ItemMedia>
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

            {/* <CardHeader>
                <CardTitle>https://techysaccty.mode</CardTitle>
                <CardDescription>
                    <Badge className="bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                        Running
                    </Badge>
                    <Badge>
                        Cancelled
                    </Badge>
                    <Badge variant="outline">
                        Queued
                    </Badge>
                    <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                        Completed
                    </Badge>
                    <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                        Failed
                    </Badge>
                </CardDescription>
                <CardAction>
                    <Button variant="destructive">Cancel</Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-4 gap-4">
                    <Item variant="outline">
                        <ItemMedia>
                            <Clock className="size-4" />
                        </ItemMedia>
                        <ItemContent>
                            00:00:00
                        </ItemContent>
                        <ItemActions>
                            Elapsed
                        </ItemActions>
                    </Item>
                    <Item variant="outline">
                        <ItemContent>
                            <Progress value={50} />
                        </ItemContent>
                        <ItemActions>
                            4/10 (50%)
                        </ItemActions>
                    </Item>
                    <Item variant="outline">
                        <ItemContent>
                            5th of 200 requests in the queue
                        </ItemContent>
                    </Item>
                    <Item variant="outline">
                        <ItemContent>
                            Grid
                        </ItemContent>
                    </Item>
                </div>
            </CardContent>
            <CardFooter>
                <Progress value={50} />
            </CardFooter> */}
        </Card>
    )
}
