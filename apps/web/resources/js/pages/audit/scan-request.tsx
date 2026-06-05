import { Stack } from '@/components/stack';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldDescription } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Separator } from '@/components/ui/separator';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Bug, ChartArea, Dot, FileCheck, Globe, Info, Lock, Shield } from 'lucide-react';
import { store } from '@/actions/App/Http/Controllers/Audit/ScanningController';
import type { ChangeEventHandler, SubmitEventHandler} from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { useEchoPublic } from '@laravel/echo-react';

export default function ScanRequest() {
    const form = useForm({
        url: ''
    });
    useEchoPublic(
        `audit`,
        '.sample-event',
        (e) => {
            console.log(e)
        }
    );
    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        const key = e.target.id;
        const value = e.target.value;
        form.setData({ [key]: value });
    }
    const handleSubmit: SubmitEventHandler = (e) => {
        e.preventDefault();
        form.submit(store());
    }
    return (
        <>
            <Head title="Scan Request" />

            <div className="space-y-6">
                <Card className="max-w-5xl mx-auto my-10">
                    <CardHeader>
                        <Stack direction="row" align="center">
                            <div className="border p-2 rounded-full bg-chart-4/70">
                                <Globe className="size-5" />
                            </div>
                            <div>
                                <CardTitle>Start a New Scan</CardTitle>
                                <CardDescription>
                                    Enter a website URL to analyze its accessibility
                                </CardDescription>
                            </div>
                        </Stack>
                    </CardHeader>
                    <Stack direction="row" gap="xs">
                        <CardContent className="flex-1 space-y-4">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid gap-2">
                                    <Label htmlFor="url">Website URL</Label>
                                    <InputGroup>
                                        <InputGroupInput
                                            id="url"
                                            autoFocus
                                            placeholder="https://example.com"
                                            value={form.data.url}
                                            onChange={handleChange}
                                            disabled={form.processing}
                                            required
                                        />
                                        <InputGroupAddon>
                                            <Globe />
                                        </InputGroupAddon>
                                    </InputGroup>
                                    <FieldDescription>Enter the full URL including https://</FieldDescription>
                                    <InputError message={form.errors.url} />
                                </div>

                                <Item variant="muted" className="py-6 px-8">
                                    <ItemMedia variant="icon" >
                                        <Info className="size-5" />
                                    </ItemMedia>
                                    <ItemContent >
                                        <ItemTitle>What we scan</ItemTitle>
                                        <ItemDescription>
                                            We'll crawl your site, analyze pages, and check for accessibility issues based on WCAG 2.2 standards.
                                        </ItemDescription>
                                        <Link className="mt-4 hover:text-indigo-700">
                                            Learn more about our scanning process
                                            <ArrowRight className="size-3 inline-flex ml-1 self-center" />
                                        </Link>
                                    </ItemContent>
                                </Item>

                                <Button
                                    type="submit"
                                    variant="secondary"
                                    className="w-full"
                                    disabled={form.processing}
                                >
                                    Start Scan
                                </Button>
                            </form>

                            <Stack direction="row" align="center" gap="xs">
                                <Shield className="size-4" />
                                <span className="text-sm">No account required</span>
                                <Dot className="size-3" />
                                <span className="text-sm">Free to try</span>
                                <Dot className="size-3" />
                                <span className="text-sm">Results in minutes</span>
                            </Stack>
                        </CardContent>

                        <div>
                            <Separator orientation="vertical" />
                        </div>

                        <CardContent className="space-y-6 max-w-md">
                            <CardTitle>What happens next?</CardTitle>
                            <Stack direction="col" gap="xs">
                                <Item>
                                    <ItemMedia variant="icon" className="p-3 rounded-md bg-indigo-200 text-indigo-800">
                                        <Bug className="size-5" />
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle>1. We crawl your site</ItemTitle>
                                        <ItemDescription>
                                            Our crawler discovers and analyzes all accessible pages.
                                        </ItemDescription>
                                    </ItemContent>
                                </Item>
                                <Item>
                                    <ItemMedia variant="icon" className="p-3 rounded-md bg-blue-200 text-blue-800">
                                        <FileCheck className="size-5" />
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle>2. Analyze & detect issues</ItemTitle>
                                        <ItemDescription>
                                            We check for WCAG 2.2 violations and accessibility best practices.
                                        </ItemDescription>
                                    </ItemContent>
                                </Item>
                                <Item>
                                    <ItemMedia variant="icon" className="p-3 rounded-md bg-green-200 text-green-800">
                                        <ChartArea className="size-5" />
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle>3. Get results & reports</ItemTitle>
                                        <ItemDescription>
                                            View detailed results with prioritized issues and how to fix them.
                                        </ItemDescription>
                                    </ItemContent>
                                </Item>
                            </Stack>

                            <Item variant="muted" className="py-4 px-6">
                                <ItemMedia variant="icon" >
                                    <Lock className="size-5" />
                                </ItemMedia>
                                <ItemContent>
                                    <ItemTitle>Your data is private</ItemTitle>
                                    <ItemDescription>
                                        Scans are public by default. No personal data is collected or stored.
                                    </ItemDescription>
                                </ItemContent>
                            </Item>
                        </CardContent>
                    </Stack>
                </Card>
            </div>
        </>
    );
}
