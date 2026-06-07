import { Head, Link } from '@inertiajs/react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ScoreGuage from '@/components/reporting/score-guage';
import { Stack } from '@/components/stack';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TeaserReportProps = {
    report: {
        auditId: string;
    };
}

function Breadcrumbs({ auditId }: { auditId: string }) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/">Scan</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/">{auditId}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Accessibility Report</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export default function TeaserReport({
    report,
}: TeaserReportProps) {
    return (
        <>
            <Head title="Welcome" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Breadcrumbs auditId={report.auditId} />
                <Card>
                    <CardContent>
                        <Stack direction="row" gap="md">
                            <ScoreGuage
                                value={80}
                                min={0}
                                max={100}
                                className="border rounded-xl"
                                aria-label={`Accessibility score: ${50} out of 100`}
                            />
                            <div className="flex-1 grid grid-cols-4 gap-4">
                                <div className="col-span-3 grid grid-cols-2 gap-4">
                                    <div className="grid grid-rows-2 gap-4">
                                        <div className="border rounded-xl flex flex-col justify-around p-4">
                                            <div className="text-lg font-medium text-chart-5/80">
                                                Critical
                                            </div>
                                            <div className="flex">
                                                <div className="text-4xl self-center flex-1 justify-center">
                                                    5
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border rounded-xl flex flex-col justify-around p-4">
                                            <div className="text-lg font-medium text-chart-3/80">
                                                Serious
                                            </div>
                                            <div className="flex">
                                                <div className="text-4xl self-center flex-1 justify-center">
                                                    5
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-rows-2 gap-4">
                                        <div className="border rounded-xl flex flex-col justify-around p-4">
                                            <div className="text-lg font-medium text-chart-1/80">
                                                Moderate
                                            </div>
                                            <div className="flex">
                                                <div className="text-4xl self-center flex-1 justify-center">
                                                    5
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border rounded-xl flex flex-col justify-around p-4">
                                            <div className="text-lg font-medium text-chart-2/80">
                                                Minor
                                            </div>
                                            <div className="flex">
                                                <div className="text-4xl self-center flex-1 justify-center">
                                                    5
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="border rounded-xl text-center p-4 flex">
                                    <div className="flex-1 self-center justify-center">
                                        <Button>Download</Button>
                                        <p className="mt-2 text-sm">
                                            Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Stack>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Remediation Workflow</CardTitle>
                        <CardDescription>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="overview" className="flex flex-col">
                            <TabsList variant="line" className="">
                                <TabsTrigger value="overview">All</TabsTrigger>
                                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overview">Make changes to your account here.</TabsContent>
                            <TabsContent value="analytics">Change your password here.</TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
