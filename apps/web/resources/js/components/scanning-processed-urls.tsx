import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./ui/table";
import { Stack } from "./stack";
import { ButtonGroup, ButtonGroupSeparator } from "./ui/button-group";
import { Button } from "./ui/button";

export default function ScanningProcessedUrls() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Processed URLs</CardTitle>
                <CardDescription>URLs that have been crawled and their violation summary.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>URL</TableHead>
                            <TableHead>Violations</TableHead>
                            <TableHead className="text-right">&nbsp;</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">
                                https://example.com
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Badge variant="destructive">
                                        1 Critical
                                    </Badge>
                                    <Badge className="bg-chart-3/20 text-chart-3">
                                        1 Serious
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell>
                                <ChevronRight className="size-4" />
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="flex flex-row justify-between align-middle">
                <span className="text-sm">Showing 5 of 0 processed URLs</span>
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
