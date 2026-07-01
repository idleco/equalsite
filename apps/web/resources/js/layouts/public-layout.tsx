export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-stone-50 dark:bg-[#0B0D12] text-slate-900 dark:text-slate-100 antialiased">
            {children}
        </div>
    );
}
