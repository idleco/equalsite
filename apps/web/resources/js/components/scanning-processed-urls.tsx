import { Check, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./ui/table";
import { Stack } from "./stack";
import { ButtonGroup, ButtonGroupSeparator } from "./ui/button-group";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { str } from "@/lib/utils";

enum ImpactLevel {
    critical = 0,
    serious = 1,
    moderate = 2,
    minor = 3
}

type ImpactLevelKey = keyof typeof ImpactLevel;

interface Item {
    url: string;
    severityBreakdown: Record<ImpactLevelKey, number>
    successful: boolean;
}

const fakeRowItems: Item[] = [
    {
        url: 'https://example.com',
        successful: true,
        severityBreakdown: {
            critical: 2,
            minor: 0,
            moderate: 6,
            serious: 2
        },
    },
    {
        url: 'https://example.com/2',
        successful: true,
        severityBreakdown: {
            critical: 0,
            minor: 5,
            moderate: 0,
            serious: 2
        },
    },
    {
        url: 'https://example.com/3',
        successful: true,
        severityBreakdown: {
            critical: 5,
            minor: 0,
            moderate: 0,
            serious: 0
        },
    },
    {
        url: 'https://example.com/4/Loremipsumd/olorsitam/etconsectet/uradipisicingelitAc/cusamusetopt/ioquisquamneq/uevoluptatem.',
        successful: true,
        severityBreakdown: {
            critical: 0,
            minor: 0,
            moderate: 2,
            serious: 0
        },
    }
]

function sortSeverityBreakdown(breakdown: Item['severityBreakdown']): ImpactLevelKey[] {
    const impactLevels = Object.keys(breakdown) as ImpactLevelKey[];
    return impactLevels.sort((a, b) => ImpactLevel[a] - ImpactLevel[b]);
}

export default function ScanningProcessedUrls() {
    const renderSeverityBreakdown = (item: Item) => {
        return sortSeverityBreakdown(item.severityBreakdown).map(k => (
            <Badge key={k} className={({
                'critical': 'bg-chart-5/20 text-chart-5',
                'serious':  'bg-chart-3/20 text-chart-3',
                'moderate': 'bg-chart-1/20 text-chart-1',
                'minor': 'bg-chart-2/20 text-chart-2',
            })[k]}>
                <span className="font-medium w-2">
                    {item.severityBreakdown[k]}
                </span>
                {str.title(k)}
            </Badge>
        ));
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Processed URLs</CardTitle>
                <CardDescription>URLs that have been crawled and their violation summary.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden">
                <Table >
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-3">URL</TableHead>
                            <TableHead>Violations</TableHead>
                            <TableHead className="text-right">&nbsp;</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fakeRowItems.map(item => (
                            <TableRow key={item.url}>
                                <TableCell className="font-medium">
                                    <Stack direction="row" gap="xs" align="center">
                                        <CheckCircle className="size-4 text-green-500" />
                                        <div className="max-w-lg overflow-hidden text-ellipsis">{item.url}</div>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" gap="xs">
                                        {renderSeverityBreakdown(item)}
                                    </Stack>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Separator />
            </CardContent>
            <CardFooter className="flex flex-row justify-between align-middle">
                <CardDescription>Showing 5 of 0 processed URLs</CardDescription>
                <ButtonGroup>
                    <Button variant="secondary">
                        <ChevronLeft className="size-4" />
                    </Button>
                    <ButtonGroupSeparator />
                    <Button variant="secondary">
                        <ChevronRight className="size-4" />
                    </Button>
                </ButtonGroup>
            </CardFooter>
        </Card>
    )
}
