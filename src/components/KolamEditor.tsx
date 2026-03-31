'use client';

import { KolamPattern } from '@/types/kolam';
import { KolamExporter } from '@/utils/kolamExporter';
import { KolamGenerator } from '@/utils/kolamGenerator';
import { durationToSpeed, speedToDuration, updateURL, useKolamURLParams } from '@/utils/urlParams';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KolamDisplay } from './KolamDisplay';
import { HeritageLoader } from './HeritageLoader';

export const KolamEditor: React.FC<{ compactHeader?: boolean }> = ({ compactHeader = false }) => {
	const [currentPattern, setCurrentPattern] = useState<KolamPattern | null>(null);
	const [isExporting, setIsExporting] = useState(false);
	const [showDownloadMenu, setShowDownloadMenu] = useState(false);
	const [animationState, setAnimationState] = useState<'stopped' | 'playing' | 'paused'>('stopped');
	const kolamRef = useRef<HTMLDivElement>(null);

	const urlParams = useKolamURLParams();
	const [size, setSize] = useState(urlParams.size || 5);
	const [animationSpeed, setAnimationSpeed] = useState(durationToSpeed(urlParams.duration || 3000));
	const [animationDuration, setAnimationDuration] = useState(urlParams.duration || 3000);
	const [initialAutoAnimate] = useState(urlParams.initialAutoAnimate);

	useEffect(() => {
		updateURL({ size, duration: animationDuration, initialAutoAnimate });
	}, [size, animationDuration, initialAutoAnimate]);

	useEffect(() => {
		setAnimationDuration(speedToDuration(animationSpeed));
	}, [animationSpeed]);

	useEffect(() => {
		if (animationState === 'playing' && currentPattern) {
			const timer = setTimeout(() => {
				setAnimationState('stopped');
			}, animationDuration);
			return () => clearTimeout(timer);
		}
	}, [animationState, currentPattern, animationDuration]);

	const generatePattern = useCallback(() => {
		try {
			const pattern = KolamGenerator.generateKolam1D(size);
			setCurrentPattern(pattern);
			setAnimationState('stopped');
			if (initialAutoAnimate) {
				setTimeout(() => setAnimationState('playing'), 100);
			}
		} catch (error) {
			console.error('Error generating pattern:', error);
		}
	}, [size, initialAutoAnimate]);

	useEffect(() => {
		generatePattern();
	}, [generatePattern]);

	const exportPattern = async (format: 'svg' | 'png') => {
		if (!currentPattern || !kolamRef.current) return;
		setIsExporting(true);
		try {
			if (format === 'svg') {
				await KolamExporter.downloadSVG(currentPattern);
			} else {
				await KolamExporter.downloadPNG(kolamRef.current, currentPattern.name);
			}
		} catch (error) {
			console.error('Export failed:', error);
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div className={`flex flex-col w-full bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--gold)] selection:text-[var(--background)] `}>
			
	{/* ── Header ── */}
			{!compactHeader && (
				<header className="z-50 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface)]/95 px-6 py-4 backdrop-blur-md lg:px-12">
					<div className="flex items-center gap-4">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[var(--gold)]/40 bg-[var(--surface-elevated)]">
							<svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--gold)]">
								<circle cx="12" cy="12" r="3" fill="currentColor" />
								<circle cx="12" cy="5" r="1.5" fill="currentColor" opacity="0.6" />
								<circle cx="12" cy="19" r="1.5" fill="currentColor" opacity="0.6" />
								<circle cx="5" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
								<circle cx="19" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
							</svg>
						</div>
						<div>
							<h1 className="font-heritage text-2xl text-[var(--foreground)]">Kolam</h1>
							<p className="font-elegant text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
								Sacred Geometry
							</p>
						</div>
					</div>

					<nav className="flex items-center gap-2">
						<Link href="/continuous" className="px-4 py-2 font-elegant text-xs uppercase tracking-widest text-[var(--muted)] transition-colors hover:text-[var(--primary)]">
							Continuous
						</Link>
						<Link href="/analyze" className="px-4 py-2 font-elegant text-xs uppercase tracking-widest text-[var(--muted)] transition-colors hover:text-[var(--primary)]">
							Analyze
						</Link>
						<Link href="/game" className="px-4 py-2 font-elegant text-xs uppercase tracking-widest text-[var(--muted)] transition-colors hover:text-[var(--primary)]">
							Play
						</Link>
					</nav>
				</header>
			)}

			<div className="mx-auto flex w-full max-w-[1400px] flex-col lg:flex-row py-8 lg:py-16 px-4 sm:px-8 lg:px-12 gap-12 lg:gap-24">

				{/* ── Controls Sidebar ── */}
				<aside className="order-2 w-full shrink-0 flex flex-col gap-12 lg:order-1 lg:w-80 border-t lg:border-t-0 border-[var(--border-subtle)] pt-12 lg:pt-0">
					
					{/* Header */}
					<div>
						<h2 className="font-heritage text-4xl text-[var(--foreground)]">Generator</h2>
						<p className="mt-4 font-elegant text-xs uppercase tracking-[0.2em] text-[var(--muted)] leading-relaxed">
							Configure synthetic kolam matrix
						</p>
					</div>

					{/* Parameters */}
					<div className="flex flex-col gap-10">
						
						{/* Size Control */}
						<div className="flex flex-col gap-4">
							<div className="flex items-end justify-between border-b border-[var(--border-subtle)] pb-2">
								<span className="font-elegant text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Complexity Size</span>
								<span className="font-mono text-sm text-[var(--primary)]">{size}×{size}</span>
							</div>
							<input
								type="range" min="3" max="15" value={size}
								onChange={(e) => setSize(parseInt(e.target.value))}
								className="w-full accent-[var(--primary)]"
							/>
						</div>

						{/* Speed Control */}
						<div className="flex flex-col gap-4">
							<div className="flex items-end justify-between border-b border-[var(--border-subtle)] pb-2">
								<span className="font-elegant text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Draw Speed</span>
								<span className="font-mono text-sm text-[var(--gold)]">{animationSpeed}</span>
							</div>
							<input
								type="range" min="1" max="10" value={animationSpeed}
								onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
								className="w-full accent-[var(--gold)]"
							/>
						</div>
					</div>

					{/* Primary Actions */}
					<div className="flex flex-col gap-4">
						<button
							onClick={() => generatePattern()}
							className="group relative flex w-full items-center justify-between rounded-md bg-[var(--primary)] text-[var(--background)] px-8 py-5 font-elegant text-sm uppercase tracking-widest shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--primary)]/30"
						>
							<span className="font-semibold">Synthesize New</span>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 transition-transform group-hover:rotate-180">
								<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" strokeLinecap="round" strokeLinejoin="round"/>
								<path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
						</button>

						{currentPattern && (
							<button
								onClick={() => setAnimationState((prev) => (prev === 'playing' ? 'stopped' : 'playing'))}
								className={`group flex w-full items-center justify-between rounded-md px-8 py-5 font-elegant text-sm uppercase tracking-widest shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
									animationState === 'playing'
										? 'bg-[var(--gold)] text-[var(--background)] border border-transparent shadow-[var(--gold)]/20'
										: 'bg-[var(--surface-elevated)] text-[var(--foreground)] border border-[var(--border-medium)] hover:border-[var(--primary)]/50 hover:text-[var(--primary)]'
								}`}
							>
								<span>{animationState === 'playing' ? 'Halt Sequence' : 'Animate Sequence'}</span>
								{animationState === 'playing' ? (
									<span className="h-2 w-2 rounded-full bg-[var(--gold)] animate-pulse" />
								) : (
									<svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3"><path d="M5 3l14 9-14 9V3z"/></svg>
								)}
							</button>
						)}
					</div>

					{/* Export Area */}
					<div className="mt-8 border-t border-[var(--border-subtle)] pt-8">
						<div className="mb-4 font-elegant text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Archive Format</div>
						<div className="flex gap-4">
							<button
								onClick={() => exportPattern('svg')}
								disabled={isExporting}
								className="flex-1 rounded-md border border-[var(--border-medium)] bg-[var(--surface-elevated)] px-4 py-3 text-center font-elegant text-xs tracking-widest text-[var(--muted)] hover:bg-[var(--primary)] hover:text-[var(--background)] hover:border-[var(--primary)] transition-all"
							>
								VECTOR (SVG)
							</button>
							<button
								onClick={() => exportPattern('png')}
								disabled={isExporting}
								className="flex-1 rounded-md border border-[var(--border-medium)] bg-[var(--surface-elevated)] px-4 py-3 text-center font-elegant text-xs tracking-widest text-[var(--muted)] hover:bg-[var(--primary)] hover:text-[var(--background)] hover:border-[var(--primary)] transition-all"
							>
								BITMAP (PNG)
							</button>
						</div>
					</div>

				</aside>

				{/* ── Main Canvas Area ── */}
				<main className="order-1 flex min-h-[500px] w-full flex-1 flex-col items-center justify-center lg:order-2 lg:min-h-[700px] xl:min-h-[800px] bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-none relative overflow-hidden">
					
					{/* Decorative Ornaments */}
					<div className="absolute left-6 top-6 h-12 w-12 border-l border-t border-[var(--primary)]/20 opacity-50" />
					<div className="absolute right-6 top-6 h-12 w-12 border-r border-t border-[var(--primary)]/20 opacity-50" />
					<div className="absolute bottom-6 left-6 h-12 w-12 border-b border-l border-[var(--primary)]/20 opacity-50" />
					<div className="absolute bottom-6 right-6 h-12 w-12 border-b border-r border-[var(--primary)]/20 opacity-50" />

					{currentPattern ? (
						<div ref={kolamRef} className="animate-fade-in flex h-full w-full items-center justify-center p-8 mix-blend-multiply">
							<KolamDisplay
								pattern={currentPattern}
								animate={animationState === 'playing'}
								animationState={animationState}
								animationTiming={animationDuration}
								className="max-w-full drop-shadow-xl"
							/>
						</div>
					) : (
						<div className="flex flex-col items-center gap-6 text-[var(--muted)]">
							<span className="h-10 w-10 flex items-center justify-center rounded-sm border border-[var(--border-medium)] bg-[var(--surface)]">
								<span className="h-2 w-2 rounded-sm bg-[var(--primary)] animate-ping" />
							</span>
							<span className="font-elegant text-xs uppercase tracking-widest">Awaiting Generation</span>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};


