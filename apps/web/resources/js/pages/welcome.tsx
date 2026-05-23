import { Form, Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { Stack } from '@/components/stack';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { store } from '@/actions/App/Http/Controllers/WebsiteScanController';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;
    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0 border">
                    <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row">
                        <div className="flex-1 rounded-lg bg-white p-6 pb-12 text-[13px] leading-[20px] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                            <Stack direction="col">
                                <h2 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
                                    Test your site
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed sm:text-base">
                                    Enter your website to get a free accessibility report.
                                </p>
                                <Form action={store().url} method={store().method}>
                                    {({ processing, errors }) => (
                                        <Stack
                                            gap="lg"
                                            align="stretch"
                                            className="w-full"
                                        >
                                            <div className="grid gap-2">
                                                <Label htmlFor="url">Website URL</Label>
                                                <Input
                                                    id="url"
                                                    type="url"
                                                    name="url"
                                                    autoComplete="url"
                                                    autoFocus
                                                />
                                                <InputError message={errors.url} />
                                            </div>
                                            <Button
                                                type="submit"
                                                variant="default"
                                                size="lg"
                                                className="h-12 w-full rounded-xl text-base shadow-md min-[400px]:w-auto min-[400px]:min-w-56"
                                                disabled={processing}
                                            >
                                                {processing && (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                )}
                                                Start Scan
                                            </Button>
                                        </Stack>
                                    )}
                                </Form>
                            </Stack>
                        </div>
                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
