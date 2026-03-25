'use client';

import { NeuralRecovery } from '@/components/NeuralRecovery';
import Link from 'next/link';
import { Suspense } from 'react';

export default function GamePage() {
	return (
		<main className="min-h-screen bg-[var(--background)]">
			{/* Top Navigation */}
			<header className="heritage-border-top sticky top-0 z-50 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface)]/95 px-6 py-4 backdrop-blur-md">
				<Link href="/" className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--gold)]/30 bg-[var(--surface-elevated)]">
						<svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--gold)]">
							<circle cx="12" cy="12" r="3" fill="currentColor" />
							<circle cx="12" cy="5" r="1.5" fill="currentColor" opacity="0.6" />
							<circle cx="12" cy="19" r="1.5" fill="currentColor" opacity="0.6" />
							<circle cx="5" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
							<circle cx="19" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
						</svg>
					</div>
					<span className="font-heritage text-lg text-[var(--ivory)]">Kolam</span>
				</Link>
				<Link href="/" className="font-elegant text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors">
					← Back to Studio
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
