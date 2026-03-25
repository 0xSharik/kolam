'use client';

import { Header } from '@/components/Header';
import { NeuralRecovery } from '@/components/NeuralRecovery';
import { Suspense } from 'react';

export default function GamePage() {
	return (
		<main className="min-h-screen chaos-mode flex flex-col bg-[#0e0e0e]">
			<div className="absolute top-0 w-full z-50">
				<Header 
					title="NEURAL RECOVERY" 
					subtitle="Operational Objective: Pattern Restoration"
					showBackButton={true}
					backButtonHref="/"
					backButtonText="Back To Home"
					className="!border-b-[0] bg-transparent backdrop-blur-none"
				/>
			</div>
			
			<div className="w-full h-full relative">
				<Suspense fallback={<div className="w-full h-full flex items-center justify-center headline animate-pulse text-[var(--primary)] text-sm tracking-[0.5em] uppercase">Synchronizing Neural Grid...</div>}>
					<NeuralRecovery />
				</Suspense>
			</div>

			<footer className="absolute bottom-4 right-8 z-50 text-[8px] font-mono opacity-20 uppercase tracking-[0.3em] flex gap-12 pointer-events-none">
				<span>GRID_X: 0x449F</span>
				<span>LINK: ENCRYPTED</span>
			</footer>

		</main>
	);
}
