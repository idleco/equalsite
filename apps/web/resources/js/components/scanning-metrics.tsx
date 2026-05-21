import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Clock } from "lucide-react";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from './ui/item';
import { Badge } from "./ui/badge";
import { Spinner } from "./ui/spinner";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";

// surface dark-bg #0e1523
// card dark-bg #1a2330

export default function ScanningMetrics() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>https://techysaccty.mode</CardTitle>
                <CardDescription>
                    <Badge className="bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                        Running
                    </Badge>
                    {/* <Badge>
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
                    </Badge> */}
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
            </CardFooter>
        </Card>
    )
}
