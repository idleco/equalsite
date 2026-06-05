import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Stack } from "@/components/stack";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { str } from "@/lib/utils";
import type { ServerityBreakdown } from "@equalsite/types";
import type { ScannedUrl } from "@/types";

enum ImpactLevel {
    critical = 0,
    serious = 1,
    moderate = 2,
    minor = 3
}

type ImpactLevelKey = keyof typeof ImpactLevel;

function sortSeverityBreakdown(breakdown: ServerityBreakdown): ImpactLevelKey[] {
    const impactLevels = Object.keys(breakdown) as ImpactLevelKey[];
    return impactLevels.sort((a, b) => ImpactLevel[a] - ImpactLevel[b]);
}

type ProcessedUrlsProps = {
    scanUrls: Record<string, ScannedUrl>;
}

export default function ProcessedUrls({
    scanUrls
}: ProcessedUrlsProps) {
    const renderSeverityBreakdown = (item?: ServerityBreakdown) => {
        return item ? sortSeverityBreakdown(item).map(k => (
            <Badge key={k} className={({
                'critical': 'bg-chart-5/20 text-chart-5',
                'serious':  'bg-chart-3/20 text-chart-3',
                'moderate': 'bg-chart-1/20 text-chart-1',
                'minor': 'bg-chart-2/20 text-chart-2',
            })[k]}>
                <span className="font-medium w-2">
                    {item[k]}
                </span>
                {str.title(k)}
            </Badge>
        )) : null;
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
                        {Object.keys(scanUrls).reverse().map(url => (
                            <TableRow key={url}>
                                <TableCell className="font-medium min-w-2xl">
                                    <Stack direction="row" gap="xs" align="center">
                                        <CheckCircle className="size-4 text-green-500" />
                                        <div className="max-w-lg overflow-hidden text-ellipsis">{url}</div>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" gap="xs">
                                        <Badge>{scanUrls[url]?.status}</Badge>
                                        {renderSeverityBreakdown(scanUrls[url]?.severityBreakdown)}
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
