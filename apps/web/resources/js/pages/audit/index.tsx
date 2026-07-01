import { Head, useForm } from '@inertiajs/react';
import { PublicHeader } from '@/components/public-header';
import { store } from '@/routes/audit';
import InputError from '@/components/input-error';
import type { ChangeEventHandler, FormEventHandler } from 'react';

const NAV_LINKS = [
    { label: 'How it works', href: '#how' },
    { label: 'Docs', href: '#' },
    { label: 'GitHub', href: 'https://github.com/freepeace13/equalsite', external: true },
];

export default function Index() {
    const form = useForm({ url: '' });

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        form.setData('url', e.target.value);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        form.submit(store());
    };

    return (
        <>
            <Head title="Free WCAG accessibility audit" />

            <PublicHeader navLinks={NAV_LINKS} />

            <main>
                {/* Hero */}
                <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-3 py-1.5 mb-6">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="5" y="11" width="14" height="9" rx="2" />
                            <path d="M8 11V7a4 4 0 018 0v4" />
                        </svg>
                        no sign up needed
                    </span>

                    <h1 className="font-display text-3xl sm:text-4xl font-medium leading-tight max-w-xl mx-auto">
                        see your site the way everyone does
                    </h1>
                    <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                        free WCAG 2.2 AA scan. enter a URL, get a plain-english accessibility report in minutes.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto flex gap-2">
                        <label htmlFor="url" className="sr-only">Website URL</label>
                        <input
                            id="url"
                            name="url"
                            type="url"
                            required
                            autoFocus
                            placeholder="https://yoursite.com"
                            value={form.data.url}
                            onChange={handleChange}
                            disabled={form.processing}
                            className="flex-1 h-11 px-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                        />
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="h-11 px-5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-medium whitespace-nowrap flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 dark:focus:ring-offset-slate-950 disabled:opacity-60"
                        >
                            {form.processing ? 'starting…' : 'run free audit'}
                            {!form.processing && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M5 12h14M13 6l6 6-6 6" />
                                </svg>
                            )}
                        </button>
                    </form>

                    {form.errors.url && (
                        <div className="mt-2 max-w-md mx-auto text-left">
                            <InputError message={form.errors.url} />
                        </div>
                    )}

                    <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                        scans up to 25 pages · results in ~2 minutes
                    </p>
                </section>

                {/* Feature cards */}
                <section id="how" className="border-t border-slate-200 dark:border-slate-800">
                    <div className="max-w-5xl mx-auto grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
                        <div className="p-8">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600 dark:text-indigo-400">
                                <circle cx="11" cy="11" r="7" />
                                <path d="M21 21l-4.3-4.3" />
                            </svg>
                            <h3 className="font-medium mt-3 mb-1 text-sm">real browser scans</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                crawls your site like a visitor would, running axe-core on every page.
                            </p>
                        </div>
                        <div className="p-8">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600 dark:text-indigo-400">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                            </svg>
                            <h3 className="font-medium mt-3 mb-1 text-sm">grouped by who's affected</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                not raw rule IDs — keyboard, screen reader, and low-vision users.
                            </p>
                        </div>
                        <div className="p-8">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-600 dark:text-indigo-400">
                                <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
                            </svg>
                            <h3 className="font-medium mt-3 mb-1 text-sm">fix priority, not a wall of text</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                quick wins vs structural work, ranked first in every list.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="max-w-5xl mx-auto px-6 py-10 text-xs text-slate-400 dark:text-slate-600">
                equalsite — an open accessibility diagnostic.{' '}
                <a
                    href="https://github.com/freepeace13/equalsite"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-slate-600 dark:hover:text-slate-400"
                >
                    source on GitHub
                </a>
            </footer>
        </>
    );
}
