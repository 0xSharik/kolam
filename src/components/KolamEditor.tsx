'use client';

import { KolamPattern } from '@/types/kolam';
import { KolamExporter } from '@/utils/kolamExporter';
import { KolamGenerator } from '@/utils/kolamGenerator';
import { durationToSpeed, speedToDuration, updateURL, useKolamURLParams } from '@/utils/urlParams';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KolamDisplay } from './KolamDisplay';
import { HeritageLoader } from './HeritageLoader';

export const KolamEditor: React.FC = () => {
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
		<div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--gold)] selection:text-[var(--background)]">
			
			{/* Top Navigation Bar */}
			<header className="heritage-border-top sticky top-0 z-50 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface)]/95 px-6 py-4 backdrop-blur-md">
				<div className="flex items-center gap-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--gold)]/40 bg-[var(--surface-elevated)] shadow-lg">
						<svg viewBox="0 0 24 24" className="h-6 w-6 text-[var(--gold)] animate-kolam-pulse">
							<circle cx="12" cy="12" r="4" fill="currentColor" />
							<circle cx="12" cy="5" r="2" fill="currentColor" opacity="0.6" />
							<circle cx="12" cy="19" r="2" fill="currentColor" opacity="0.6" />
							<circle cx="5" cy="12" r="2" fill="currentColor" opacity="0.6" />
							<circle cx="19" cy="12" r="2" fill="currentColor" opacity="0.6" />
						</svg>
					</div>
					<div>
						<h1 className="font-heritage text-2xl font-semibold text-[var(--ivory)]">Kolam</h1>
						<p className="font-elegant text-xs uppercase tracking-[0.25em] text-[var(--muted)] hidden sm:block">Sacred Geometry Engine</p>
					</div>
				</div>
				
				<div className="flex items-center gap-3">
					<Link href="/analyze" className="hidden sm:flex items-center gap-2 rounded border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-2 font-elegant text-sm text-[var(--accent)] transition-all hover:bg-[var(--accent)]/20">
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
						Analyze
					</Link>
					<Link href="/game" className="flex items-center gap-2 rounded border border-[var(--temple-red)]/40 bg-[var(--temple-red)]/10 px-4 py-2 font-elegant text-sm text-[var(--temple-red)] transition-all hover:bg-[var(--temple-red)]/20">
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Play
					</Link>
				</div>
			</header>

			{/* Main Content */}
			<div className="mx-auto flex min-h-[calc(100vh-80px)] flex-col xl:flex-row">
				
				{/* Left Controls Panel */}
				<aside className="w-full border-b border-[var(--border-subtle)] bg-[var(--surface)] xl:w-[340px] xl:min-h-[calc(100vh-80px)] xl:border-b-0 xl:border-r">
					<div className="flex flex-col gap-6 p-6">
						
						{/* Controls Card */}
						<div className="heritage-card rounded-xl p-6">
							<h2 className="font-heritage text-lg text-[var(--ivory)] mb-6">Controls</h2>
							
							{/* Size Control */}
							<div className="mb-6">
								<div className="flex items-center justify-between mb-3">
									<label className="font-elegant text-xs font-medium uppercase tracking-[0.15em] text-[var(--muted)]">
										Pattern Size
									</label>
									<div className="rounded border border-[var(--gold)]/30 bg-[var(--obsidian)] px-3 py-1 font-elegant text-sm text-[var(--gold-light)]">
										{size} × {size}
									</div>
								</div>
								<input
									type="range"
									min="3"
									max="15"
									value={size}
									onChange={(e) => setSize(parseInt(e.target.value))}
									className="w-full"
								/>
							</div>

							{/* Speed Control */}
							<div className="mb-6">
								<div className="flex items-center justify-between mb-3">
									<label className="font-elegant text-xs font-medium uppercase tracking-[0.15em] text-[var(--muted)]">
										Animation Speed
									</label>
									<div className="rounded border border-[var(--saffron)]/30 bg-[var(--obsidian)] px-3 py-1 font-elegant text-sm text-[var(--saffron)]">
										{animationSpeed}
									</div>
								</div>
								<input
									type="range"
									min="1"
									max="10"
									value={animationSpeed}
									onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
									className="w-full"
								/>
							</div>

							{/* Generate Button */}
							<button
								onClick={() => generatePattern()}
								className="btn-shine w-full rounded-lg border border-[var(--gold)]/40 bg-gradient-to-r from-[var(--gold)]/15 to-[var(--saffron)]/10 py-4 font-heritage text-base font-medium tracking-wide text-[var(--ivory)] transition-all hover:border-[var(--gold)]/60 hover:from-[var(--gold)]/25 hover:to-[var(--saffron)]/20"
							>
								Generate New Pattern
							</button>

							{/* Animate Button */}
							{currentPattern && (
								<button
									onClick={() => setAnimationState((prev) => (prev === 'playing' ? 'stopped' : 'playing'))}
									className={`mt-3 w-full rounded-lg border py-4 font-heritage text-base font-medium tracking-wide transition-all ${
										animationState === 'playing'
											? 'border-[var(--saffron)]/50 bg-[var(--saffron)]/15 text-[var(--saffron)]'
											: 'border-[var(--gold)]/30 bg-transparent text-[var(--gold)] hover:border-[var(--gold)]/50'
									}`}
								>
									{animationState === 'playing' ? '◼ Stop Animation' : '▶ Animate Pattern'}
								</button>
							)}
						</div>

						{/* Quick Links */}
						<div className="grid grid-cols-2 gap-3">
							<Link href="/continuous" className="flex items-center justify-center gap-2 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/10 py-3 font-elegant text-sm text-[var(--accent)] transition-all hover:bg-[var(--accent)]/20">
								<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
								Continuous
							</Link>
							<Link href="/analyze" className="flex items-center justify-center gap-2 rounded-lg border border-[var(--muted)]/30 bg-[var(--muted)]/10 py-3 font-elegant text-sm text-[var(--muted)] transition-all hover:bg-[var(--muted)]/20 sm:hidden">
								Analyze
							</Link>
						</div>
					</div>

					{/* Footer */}
					<footer className="mt-auto border-t border-[var(--border-subtle)] px-6 py-4">
						<div className="flex items-center justify-between font-elegant text-[10px] text-[var(--muted)]">
							<span>© 2026 Kolam Heritage</span>
							<span className="tracking-widest">Preserving Tradition</span>
						</div>
					</footer>
				</aside>

				{/* Main Canvas Area */}
				<main className="relative flex flex-1 items-center justify-center overflow-hidden bg-[var(--obsidian)] p-4 sm:p-8 lg:p-12">
					
					{/* Background Pattern */}
					<div className="pointer-events-none absolute inset-0 kolam-dots-bg opacity-40"></div>
					
					{/* Corner Ornaments */}
					<div className="pointer-events-none absolute left-4 top-4 h-20 w-20 border-l border-t border-[var(--gold)]/25 sm:left-8 sm:top-8 sm:h-24 sm:w-24"></div>
					<div className="pointer-events-none absolute right-4 top-4 h-20 w-20 border-r border-t border-[var(--gold)]/25 sm:right-8 sm:top-8 sm:h-24 sm:w-24"></div>
					<div className="pointer-events-none absolute bottom-4 left-4 h-20 w-20 border-b border-l border-[var(--gold)]/25 sm:bottom-8 sm:left-8 sm:h-24 sm:w-24"></div>
					<div className="pointer-events-none absolute bottom-4 right-4 h-20 w-20 border-b border-r border-[var(--gold)]/25 sm:bottom-8 sm:right-8 sm:h-24 sm:w-24"></div>

					{/* Top Center Ornament */}
					<div className="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 sm:top-10">
						<svg width="60" height="24" viewBox="0 0 60 24" className="text-[var(--gold)]/40">
							<path d="M30 0 L30 24 M15 6 L30 0 L45 6 M7.5 12 L30 4 L52.5 12" stroke="currentColor" strokeWidth="1" fill="none"/>
						</svg>
					</div>

					{/* Download Button */}
					<div className="absolute right-4 top-4 z-20 sm:right-8 sm:top-8">
						<div className="relative">
							<button
								onClick={() => setShowDownloadMenu(!showDownloadMenu)}
								disabled={isExporting}
								className="flex items-center gap-2 rounded-lg border border-[var(--gold)]/30 bg-[var(--surface)]/90 px-5 py-2.5 font-elegant text-sm text-[var(--gold)] backdrop-blur-sm transition-all hover:border-[var(--gold)]/50 hover:bg-[var(--surface)]"
							>
								{isExporting ? (
									<span className="animate-spin">⟳</span>
								) : (
									<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
									</svg>
								)}
								Save
							</button>

							{showDownloadMenu && (
								<div className="absolute right-0 mt-2 min-w-[180px] overflow-hidden rounded-lg border border-[var(--border-medium)] bg-[var(--surface-elevated)] shadow-2xl">
									<button
										onClick={() => { exportPattern('svg'); setShowDownloadMenu(false); }}
										className="w-full px-5 py-3 text-left font-elegant text-sm text-[var(--muted)] transition-colors hover:bg-[var(--gold)]/10 hover:text-[var(--gold)]"
									>
										Save as SVG
									</button>
									<button
										onClick={() => { exportPattern('png'); setShowDownloadMenu(false); }}
										className="w-full px-5 py-3 text-left font-elegant text-sm text-[var(--muted)] transition-colors hover:bg-[var(--saffron)]/10 hover:text-[var(--saffron)]"
									>
										Save as PNG
									</button>
								</div>
							)}
						</div>
					</div>

					{/* Kolam Display */}
					{currentPattern ? (
						<div ref={kolamRef} className="animate-fade-in-up flex h-full w-full items-center justify-center">
							<div className="flex w-full max-w-[95%] justify-center lg:max-w-[90%]">
								<KolamDisplay
									pattern={currentPattern}
									animate={animationState === 'playing'}
									animationState={animationState}
									animationTiming={animationDuration}
									className="drop-shadow-[0_0_60px_rgba(201,162,39,0.2)]"
								/>
							</div>
						</div>
					) : (
						<HeritageLoader message="Generating Sacred Pattern..." />
					)}
				</main>
			</div>
		</div>
	);
};
