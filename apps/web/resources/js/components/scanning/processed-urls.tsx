import { CheckCircle, ChevronLeft, ChevronRight, CircleX, Minus, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Stack } from "@/components/stack";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, match, str } from "@/lib/utils";
import type { ServerityBreakdown } from "@equalsite/types";
import { ImpactLevel, type ImpactLevelKey, type ScannedUrl } from "@/types";
import { Spinner } from "../ui/spinner";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "../ui/popover";
import usePagination from "@/hooks/use-pagination";

type ProcessedUrlsProps = {
    scanUrls: Record<string, ScannedUrl>;
}

const sortSeverityBreakdown = (breakdown: ServerityBreakdown): ImpactLevelKey[] => {
    const impactLevels = Object.keys(breakdown) as ImpactLevelKey[];
    return impactLevels.sort((a, b) => ImpactLevel[a] - ImpactLevel[b]);
}

const normalizeUrls = (urls: ProcessedUrlsProps['scanUrls']) => {
    return Object.keys(urls).reverse().map(i => ({
        ...urls[i],
        url: i,
    }));
}

function EmptyMessage() {
    return (
        <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground">
                No records found
            </TableCell>
        </TableRow>
    );
}

export default function ProcessedUrls({
    scanUrls
}: ProcessedUrlsProps) {
    const {
        totalItems,
        currentItems,
        currentPage,
        nextPage,
        prevPage,
        perPage
    } = usePagination(normalizeUrls(scanUrls), 7);

    const displayedCount = Math.min(currentPage * perPage, totalItems);

    const renderErrorIcon = (errorMessage?: string) => {
        return errorMessage && (
            <Popover>
                <PopoverTrigger asChild>
                        <TriangleAlert className="size-4 text-red-500/90" />
                </PopoverTrigger>
                <PopoverContent align="end">
                    <PopoverHeader>
                        <PopoverTitle>URL Request Failed</PopoverTitle>
                        <PopoverDescription className="text-red-500/80">
                            {errorMessage}
                        </PopoverDescription>
                    </PopoverHeader>
                </PopoverContent>
            </Popover>
        )
    }

    const renderSeverityBreakdown = (severityBreakdown?: ServerityBreakdown) => {
        return severityBreakdown && sortSeverityBreakdown(severityBreakdown)
            .map(k => ((severityBreakdown[k] > 0) ? (
                <Badge key={k} className={({
                    'critical': 'bg-chart-5/20 text-chart-5',
                    'serious':  'bg-chart-3/20 text-chart-3',
                    'moderate': 'bg-chart-1/20 text-chart-1',
                    'minor': 'bg-chart-2/20 text-chart-2',
                })[k]}>
                    <span className="font-medium w-2">{severityBreakdown[k]}</span>
                    {str.title(k)}
                </Badge>
            ) : null));
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
                        {currentItems.map(i => (
                            <TableRow key={i.url}>
                                <TableCell className="font-medium min-w-2xl">
                                    <Stack direction="row" gap="xs" align="center">
                                        {i.status && match(i.status, {
                                            'started': <Spinner className="size-4" />,
                                            'failed': <CircleX className="size-4 text-red-500/90" />,
                                            'completed': <CheckCircle className="size-4 text-green-500" />,
                                            'default': <Minus className="size-4" />
                                        })}
                                        <div className={cn(
                                            'max-w-lg overflow-hidden text-ellipsis',
                                            i?.status !== 'started' && 'text-muted-foreground',
                                            i?.status === 'failed' && 'line-through'
                                        )}>
                                            {i.url}
                                        </div>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" gap="xs">
                                        {i?.status && match(i.status, {
                                            'started': 'Processing...',
                                            'failed': renderErrorIcon(i?.errorMessage),
                                            'completed': renderSeverityBreakdown(i?.severityBreakdown),
                                        })}
                                    </Stack>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!currentItems.length && <EmptyMessage />}
                    </TableBody>
                </Table>
                <Separator />
            </CardContent>
            <CardFooter className="flex flex-row justify-between align-middle">
                <CardDescription>
                    {`Showing ${displayedCount} of ${totalItems} processed URLs`}
                </CardDescription>
                <ButtonGroup>
                    <Button variant="secondary" onClick={prevPage}>
                        <ChevronLeft className="size-4" />
                    </Button>
                    <ButtonGroupSeparator />
                    <Button variant="secondary" onClick={nextPage}>
                        <ChevronRight className="size-4" />
                    </Button>
                </ButtonGroup>
            </CardFooter>
        </Card>
    )
}
