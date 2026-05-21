import { CircleCheck, CircleX, Globe, Hourglass } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Item, ItemContent, ItemDescription, ItemFooter, ItemMedia, ItemSeparator, ItemTitle } from "./ui/item";
import { Progress } from "./ui/progress";
import { Stack } from "./stack";
import { Field, FieldDescription, FieldLabel } from "./ui/field";

export default function ScanningCrawlOverview() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Crawl Overview</CardTitle>
                <CardDescription>Real-time statistics about this crawl job.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-4 gap-2">
                <Item variant="outline">
                    <ItemMedia>
                        <Globe className="size-4 text-blue-500" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Total Requests</ItemTitle>
                        <ItemTitle className="text-2xl">0</ItemTitle>
                        <ItemDescription>All URLs discovered</ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="outline">
                    <ItemMedia>
                        <Hourglass className="size-4 text-indigo-500" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Pending Requests</ItemTitle>
                        <ItemTitle className="text-2xl">0</ItemTitle>
                        <ItemDescription>In queue / waiting</ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="outline">
                    <ItemMedia>
                        <CircleCheck className="size-4 text-green-500" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Processed Requests</ItemTitle>
                        <ItemTitle className="text-2xl">0</ItemTitle>
                        <ItemDescription>Successfully processed</ItemDescription>
                    </ItemContent>
                </Item>
                <Item variant="outline">
                    <ItemMedia>
                        <CircleX className="size-4 text-red-500" />
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Failed Requests</ItemTitle>
                        <ItemTitle className="text-2xl">0</ItemTitle>
                        <ItemDescription>Errors / Failed</ItemDescription>
                    </ItemContent>
                </Item>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Field>
                    <FieldLabel htmlFor="progress-upload">
                        <span>Progress</span>
                        <span className="ml-auto">66%</span>
                    </FieldLabel>
                    <Progress value={66} id="progress-upload" />
                    <FieldDescription>
                        0 of 0 requests processed
                    </FieldDescription>
                </Field>
            </CardFooter>
        </Card>
    )
}
