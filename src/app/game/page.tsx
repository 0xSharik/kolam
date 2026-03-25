'use client';

import { NeuralRecovery } from '@/components/NeuralRecovery';
import Link from 'next/link';
import { Suspense } from 'react';

export default function GamePage() {
	return (
		<main className="min-h-screen bg-[var(--background)]">
			{/* Top Navigation - matching homepage style */}
			<header className="heritage-border-top sticky top-0 z-50 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
				<Link href="/" className="flex items-center gap-3">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/30 bg-[var(--surface-elevated)] sm:h-10 sm:w-10">
						<svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--gold)] sm:h-5 sm:w-5">
							<circle cx="12" cy="12" r="3" fill="currentColor" />
							<circle cx="12" cy="5" r="1.5" fill="currentColor" opacity="0.6" />
							<circle cx="12" cy="19" r="1.5" fill="currentColor" opacity="0.6" />
							<circle cx="5" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
							<circle cx="19" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
						</svg>
					</div>
					<div>
						<span className="font-heritage text-lg text-[var(--ivory)]">Kolam</span>
						<span className="ml-2 hidden font-elegant text-xs text-[var(--muted)] sm:inline">/ Neural Recovery</span>
					</div>
				</Link>
				<Link href="/" className="flex items-center gap-2 rounded border border-[var(--gold)]/20 bg-[var(--gold)]/5 px-4 py-2 font-elegant text-sm text-[var(--gold)] transition-all hover:bg-[var(--gold)]/10">
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					<span className="hidden sm:inline">Back to Studio</span>
					<span className="sm:hidden">Back</span>
				</Link>
			</header>

			<div className="relative">
				<Suspense fallback={
					<div className="flex h-[60vh] items-center justify-center">
						<div className="flex flex-col items-center gap-4">
							<div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent"></div>
							<span className="font-elegant text-sm text-[var(--muted)]">Loading game...</span>
						</div>
					</div>
				}>
					<NeuralRecovery />
				</Suspense>
			</div>
		</main>
	);
}
