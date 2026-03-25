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
		<div className="flex h-screen flex-col overflow-hidden bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--gold)] selection:text-[var(--background)]">

			{/* ── Header ── */}
			<header className="z-50 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur-md sm:px-6">
				<div className="flex items-center gap-3">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/40 bg-[var(--surface-elevated)] sm:h-10 sm:w-10">
						<svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--gold)] sm:h-5 sm:w-5">
							<circle cx="12" cy="12" r="3" fill="currentColor" />
							<circle cx="12" cy="5" r="1.5" fill="currentColor" opacity="0.6" />
							<circle cx="12" cy="19" r="1.5" fill="currentColor" opacity="0.6" />
							<circle cx="5" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
							<circle cx="19" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
						</svg>
					</div>
					<div>
						<h1 className="font-heritage text-lg text-[var(--ivory)] sm:text-xl">Kolam</h1>
						<p className="font-elegant text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] sm:text-[10px]">
							Sacred Geometry
						</p>
					</div>
				</div>

				<nav className="flex items-center gap-1.5 sm:gap-2">
					<Link
						href="/continuous"
						className="rounded border border-[var(--muted)]/30 bg-[var(--muted)]/10 px-2.5 py-1.5 font-elegant text-xs text-[var(--muted)] transition-all hover:bg-[var(--muted)]/20 sm:px-3 sm:py-2"
					>
						Continuous
					</Link>
					<Link
						href="/analyze"
						className="rounded border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-2.5 py-1.5 font-elegant text-xs text-[var(--accent)] transition-all hover:bg-[var(--accent)]/20 sm:px-3 sm:py-2"
					>
						Analyze
					</Link>
					<Link
						href="/game"
						className="rounded border border-[var(--temple-red)]/40 bg-[var(--temple-red)]/10 px-2.5 py-1.5 font-elegant text-xs text-[var(--temple-red)] transition-all hover:bg-[var(--temple-red)]/20 sm:px-3 sm:py-2"
					>
						Play
					</Link>
				</nav>
			</header>

			{/* ── Body: sidebar + canvas ── */}
			<div className="flex min-h-0 flex-1 flex-col lg:flex-row">

				{/* ── Controls Sidebar ── */}
				{/* Mobile: fixed bottom bar | lg: left sidebar */}
				<aside className="
					shrink-0
					border-t border-[var(--border-subtle)] bg-[var(--surface)]
					lg:border-t-0 lg:border-r
					lg:w-64 xl:w-72
					lg:flex lg:flex-col lg:overflow-y-auto
					/* mobile: collapsed strip at bottom */
					order-2 lg:order-1
				">
					{/* Mobile Controls: horizontal strip */}
					<div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4 lg:hidden">
						{/* Size */}
						<div className="flex flex-1 flex-col gap-1 min-w-0">
							<div className="flex items-center justify-between">
								<span className="font-elegant text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">Size</span>
								<span className="rounded border border-[var(--gold)]/30 bg-[var(--obsidian)] px-1.5 py-0.5 font-elegant text-[10px] text-[var(--gold-light)]">
									{size}×{size}
								</span>
							</div>
							<input
								type="range" min="3" max="15" value={size}
								onChange={(e) => setSize(parseInt(e.target.value))}
								className="w-full"
							/>
						</div>

						{/* Speed */}
						<div className="flex flex-1 flex-col gap-1 min-w-0">
							<div className="flex items-center justify-between">
								<span className="font-elegant text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">Speed</span>
								<span className="rounded border border-[var(--saffron)]/30 bg-[var(--obsidian)] px-1.5 py-0.5 font-elegant text-[10px] text-[var(--saffron)]">
									{animationSpeed}
								</span>
							</div>
							<input
								type="range" min="1" max="10" value={animationSpeed}
								onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
								className="w-full"
							/>
						</div>

						{/* Action buttons */}
						<div className="flex shrink-0 flex-col gap-1.5">
							<button
								onClick={() => generatePattern()}
								className="btn-shine rounded border border-[var(--gold)]/40 bg-gradient-to-r from-[var(--gold)]/15 to-[var(--saffron)]/10 px-3 py-1.5 font-heritage text-xs text-[var(--ivory)] transition-all hover:border-[var(--gold)]/60 whitespace-nowrap"
							>
								Generate
							</button>
							{currentPattern && (
								<button
									onClick={() => setAnimationState((prev) => (prev === 'playing' ? 'stopped' : 'playing'))}
									className={`rounded border px-3 py-1.5 font-heritage text-xs transition-all whitespace-nowrap ${animationState === 'playing'
											? 'border-[var(--saffron)]/50 bg-[var(--saffron)]/15 text-[var(--saffron)]'
											: 'border-[var(--gold)]/30 bg-transparent text-[var(--gold)]'
										}`}
								>
									{animationState === 'playing' ? '◼ Stop' : '▶ Animate'}
								</button>
							)}
						</div>
					</div>

					{/* Desktop Controls: vertical card */}
					<div className="hidden lg:flex lg:flex-1 lg:flex-col lg:gap-4 lg:p-5">
						<div className="heritage-card rounded-lg p-5">
							<h2 className="font-heritage text-base text-[var(--ivory)] mb-5">Controls</h2>

							{/* Size Control */}
							<div className="mb-5">
								<div className="flex items-center justify-between mb-2">
									<label className="font-elegant text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">
										Pattern Size
									</label>
									<span className="rounded border border-[var(--gold)]/30 bg-[var(--obsidian)] px-2 py-0.5 font-elegant text-xs text-[var(--gold-light)]">
										{size}×{size}
									</span>
								</div>
								<input
									type="range" min="3" max="15" value={size}
									onChange={(e) => setSize(parseInt(e.target.value))}
									className="w-full"
								/>
							</div>

							{/* Speed Control */}
							<div className="mb-5">
								<div className="flex items-center justify-between mb-2">
									<label className="font-elegant text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">
										Speed
									</label>
									<span className="rounded border border-[var(--saffron)]/30 bg-[var(--obsidian)] px-2 py-0.5 font-elegant text-xs text-[var(--saffron)]">
										{animationSpeed}
									</span>
								</div>
								<input
									type="range" min="1" max="10" value={animationSpeed}
									onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
									className="w-full"
								/>
							</div>

							{/* Buttons */}
							<div className="space-y-2">
								<button
									onClick={() => generatePattern()}
									className="btn-shine w-full rounded-lg border border-[var(--gold)]/40 bg-gradient-to-r from-[var(--gold)]/15 to-[var(--saffron)]/10 py-3 font-heritage text-sm text-[var(--ivory)] transition-all hover:border-[var(--gold)]/60"
								>
									Generate Pattern
								</button>

								{currentPattern && (
									<button
										onClick={() => setAnimationState((prev) => (prev === 'playing' ? 'stopped' : 'playing'))}
										className={`w-full rounded-lg border py-3 font-heritage text-sm transition-all ${animationState === 'playing'
												? 'border-[var(--saffron)]/50 bg-[var(--saffron)]/15 text-[var(--saffron)]'
												: 'border-[var(--gold)]/30 bg-transparent text-[var(--gold)]'
											}`}
									>
										{animationState === 'playing' ? '◼ Stop' : '▶ Animate'}
									</button>
								)}
							</div>
						</div>
					</div>

					{/* Desktop Footer */}
					<footer className="hidden lg:block shrink-0 border-t border-[var(--border-subtle)] px-5 py-3">
						<div className="flex items-center justify-between font-elegant text-[10px] text-[var(--muted)]">
							<span>© 2026 Kolam</span>
							<span>Tradition</span>
						</div>
					</footer>
				</aside>

				{/* ── Canvas Area ── */}
				<main className="
					order-1 lg:order-2
					relative flex flex-1 min-h-0
					items-center justify-center overflow-hidden
					bg-[var(--obsidian)]
				">
					{/* Background dots */}
					<div className="pointer-events-none absolute inset-0 kolam-dots-bg opacity-30" />

					{/* Corner ornaments — scale to viewport */}
					<div className="pointer-events-none absolute left-3 top-3 h-8 w-8 border-l border-t border-[var(--gold)]/20 sm:h-12 sm:w-12 sm:left-5 sm:top-5 lg:h-16 lg:w-16 lg:left-6 lg:top-6" />
					<div className="pointer-events-none absolute right-3 top-3 h-8 w-8 border-r border-t border-[var(--gold)]/20 sm:h-12 sm:w-12 sm:right-5 sm:top-5 lg:h-16 lg:w-16 lg:right-6 lg:top-6" />
					<div className="pointer-events-none absolute bottom-3 left-3 h-8 w-8 border-b border-l border-[var(--gold)]/20 sm:h-12 sm:w-12 sm:bottom-5 sm:left-5 lg:h-16 lg:w-16 lg:bottom-6 lg:left-6" />
					<div className="pointer-events-none absolute bottom-3 right-3 h-8 w-8 border-b border-r border-[var(--gold)]/20 sm:h-12 sm:w-12 sm:bottom-5 sm:right-5 lg:h-16 lg:w-16 lg:bottom-6 lg:right-6" />

					{/* Download Button */}
					<div className="absolute right-3 top-3 z-20 sm:right-5 sm:top-5">
						<div className="relative">
							<button
								onClick={() => setShowDownloadMenu(!showDownloadMenu)}
								disabled={isExporting}
								className="flex items-center gap-1.5 rounded-lg border border-[var(--gold)]/30 bg-[var(--surface)]/90 px-2.5 py-1.5 font-elegant text-xs text-[var(--gold)] backdrop-blur-sm transition-all hover:border-[var(--gold)]/50 sm:gap-2 sm:px-3 sm:py-2"
							>
								{isExporting ? <span className="animate-spin">⟳</span> : '↓'}
								<span className="hidden sm:inline">Save</span>
							</button>

							{showDownloadMenu && (
								<div className="absolute right-0 mt-1.5 min-w-[120px] overflow-hidden rounded-lg border border-[var(--border-medium)] bg-[var(--surface-elevated)] shadow-xl">
									<button
										onClick={() => { exportPattern('svg'); setShowDownloadMenu(false); }}
										className="w-full px-4 py-2 text-left font-elegant text-xs text-[var(--muted)] transition-colors hover:bg-[var(--gold)]/10 hover:text-[var(--gold)]"
									>
										SVG
									</button>
									<button
										onClick={() => { exportPattern('png'); setShowDownloadMenu(false); }}
										className="w-full px-4 py-2 text-left font-elegant text-xs text-[var(--muted)] transition-colors hover:bg-[var(--saffron)]/10 hover:text-[var(--saffron)]"
									>
										PNG
									</button>
								</div>
							)}
						</div>
					</div>

					{/* Kolam Display */}
					{currentPattern ? (
						<div ref={kolamRef} className="animate-fade-in-up flex h-full w-full items-center justify-center p-4 sm:p-6 lg:p-8">
							<KolamDisplay
								pattern={currentPattern}
								animate={animationState === 'playing'}
								animationState={animationState}
								animationTiming={animationDuration}
								className="drop-shadow-[0_0_40px_rgba(201,162,39,0.15)]"
							/>
						</div>
					) : (
						<HeritageLoader message="Generating Pattern..." />
					)}
				</main>
			</div>
		</div>
	);
};