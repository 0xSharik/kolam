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

			{/* Mobile Header */}
			<div className="heritage-border-top sticky top-0 z-20 flex flex-col border-b border-[var(--gold)]/15 bg-[var(--background)]/90 px-5 pb-3 pt-6 backdrop-blur-xl lg:hidden">
				<div className="mb-3 flex items-center justify-between gap-4">
					<h1 className="font-heritage text-2xl font-bold tracking-wide text-[var(--ivory)]">Kolam</h1>
					<Link
						href="/game"
						className="border border-[var(--temple-red)]/30 bg-[var(--temple-red)]/5 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-[var(--temple-red)] transition-colors hover:bg-[var(--temple-red)]/10"
					>
						Play Game
					</Link>
				</div>
				<p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--gold)] opacity-50">Sacred Geometry Engine</p>
			</div>

			<div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:min-h-screen lg:px-8 xl:grid xl:grid-cols-[420px_minmax(0,1fr)] xl:items-stretch xl:gap-0">

				{/* Left Sidebar / Controls */}
				<div className="order-2 flex min-w-0 flex-col border border-[var(--gold)]/10 bg-[var(--obsidian)] shadow-[10px_0_40px_rgba(0,0,0,0.4)] xl:order-1 xl:min-h-[calc(100vh-3rem)]">

					{/* Desktop Header */}
					<div className="heritage-border-top hidden border-b border-[var(--gold)]/10 px-8 pb-8 pt-10 lg:block">
						<div className="flex items-center gap-3 mb-4">
							{/* Decorative Kolam dot */}
							<svg viewBox="0 0 24 24" className="h-6 w-6 text-[var(--gold)] animate-kolam-pulse">
								<circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.8" />
								<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
								<circle cx="12" cy="4" r="2" fill="currentColor" opacity="0.5" />
								<circle cx="12" cy="20" r="2" fill="currentColor" opacity="0.5" />
								<circle cx="4" cy="12" r="2" fill="currentColor" opacity="0.5" />
								<circle cx="20" cy="12" r="2" fill="currentColor" opacity="0.5" />
							</svg>
							<h1 className="font-heritage text-5xl font-bold tracking-wide text-[var(--ivory)] xl:text-6xl">Kolam</h1>
						</div>
						<p className="font-mono text-[11px] uppercase tracking-[0.4em] text-[var(--gold)] opacity-60">
							Sacred Geometry Engine
						</p>
					</div>

					{/* Heritage Alert Bar */}
					<div className="hidden shrink-0 items-center justify-between border-b border-[var(--saffron)]/20 bg-gradient-to-r from-[var(--saffron)]/10 to-transparent px-8 py-3 font-mono text-[10px] font-bold text-[var(--saffron)] lg:flex">
						<span className="flex items-center gap-2">
							<span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--saffron)]"></span>
							Pattern Ready
						</span>
						<Link href="/game" className="border border-[var(--temple-red)]/30 bg-[var(--temple-red)]/10 px-3 py-1 tracking-widest text-[var(--temple-red)] transition-all hover:bg-[var(--temple-red)]/20">
							PLAY GAME
						</Link>
					</div>

					{/* Controls */}
					<div className="flex flex-1 flex-col gap-8 p-5 sm:p-6 lg:gap-10 lg:p-8">
						<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
							{/* Size Control */}
							<div className="group relative">
								<div className="absolute -inset-1 bg-gradient-to-r from-[var(--gold)]/10 to-transparent opacity-0 blur transition-opacity group-hover:opacity-100"></div>
								<div className="relative flex h-full flex-col gap-5 border border-[var(--gold)]/8 bg-[var(--surface)] p-5">
									<div className="flex items-center justify-between gap-3">
										<label className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]/70">
											<span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--gold)]"></span>
											Pattern Complexity
										</label>
										<div className="border border-[var(--gold)]/25 bg-[var(--obsidian)] px-3 py-1 font-mono text-sm font-bold text-[var(--gold)]">
											{size}
										</div>
									</div>
									<input
										type="range"
										min="3"
										max="15"
										value={size}
										onChange={(e) => setSize(parseInt(e.target.value))}
										className="h-1 w-full appearance-none rounded-full bg-[var(--gold)]/15"
										style={{ accentColor: '#D4A574' }}
									/>
								</div>
							</div>

							{/* Speed Control */}
							<div className="group relative">
								<div className="absolute -inset-1 bg-gradient-to-r from-[var(--saffron)]/10 to-transparent opacity-0 blur transition-opacity group-hover:opacity-100"></div>
								<div className="relative flex h-full flex-col gap-5 border border-[var(--saffron)]/8 bg-[var(--surface)] p-5">
									<div className="flex items-center justify-between gap-3">
										<label className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--saffron)]/70">
											<span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--saffron)]"></span>
											Rhythm
										</label>
										<div className="border border-[var(--saffron)]/25 bg-[var(--obsidian)] px-3 py-1 font-mono text-sm font-bold text-[var(--saffron)]">
											{animationSpeed}
										</div>
									</div>
									<input
										type="range"
										min="1"
										max="10"
										value={animationSpeed}
										onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
										className="h-1 w-full appearance-none rounded-full bg-[var(--saffron)]/15"
										style={{ accentColor: '#E8A328' }}
									/>
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col gap-4 sm:flex-row xl:mt-auto xl:flex-col 2xl:flex-row">
							<button
								onClick={() => generatePattern()}
								className="animate-gentle-glow flex-1 border border-[var(--gold)]/30 bg-gradient-to-r from-[var(--gold)]/15 to-[var(--saffron)]/10 py-4 font-heritage text-sm font-bold tracking-[0.15em] text-[var(--ivory)] transition-all hover:from-[var(--gold)]/25 hover:to-[var(--saffron)]/20 hover:text-[var(--warm-white)]"
							>
								Generate Pattern
							</button>

							{currentPattern && (
								<button
									onClick={() => setAnimationState((prev) => (prev === 'playing' ? 'stopped' : 'playing'))}
									className={`flex flex-1 items-center justify-center gap-2 border py-4 font-heritage text-sm font-bold tracking-[0.15em] transition-all ${
										animationState === 'playing'
											? 'border-[var(--saffron)]/40 bg-[var(--saffron)]/15 text-[var(--saffron)] shadow-[inset_0_0_20px_rgba(232,163,40,0.1)]'
											: 'border-[var(--gold)]/15 bg-transparent text-[var(--gold)]/70 hover:border-[var(--gold)]/30 hover:text-[var(--gold)]'
									}`}
								>
									{animationState === 'playing' ? '◼ Pause' : '▶ Animate'}
								</button>
							)}
						</div>

						{/* Navigation Links */}
						<Link
							href="/game"
							className="flex items-center justify-center border border-[var(--temple-red)]/25 bg-[var(--temple-red)]/5 py-4 font-heritage text-sm font-bold tracking-[0.15em] text-[var(--temple-red)] transition-all hover:bg-[var(--temple-red)]/10"
						>
							Neural Recovery Game
						</Link>

						<Link
							href="/analyze"
							className="flex items-center justify-center border border-[var(--secondary)]/20 bg-[var(--secondary)]/5 py-4 font-heritage text-sm font-bold tracking-[0.15em] text-[var(--secondary)] transition-all hover:bg-[var(--secondary)]/10"
						>
							Analyze Pattern
						</Link>
					</div>

					{/* Footer */}
					<footer className="hidden shrink-0 justify-between border-t border-[var(--gold)]/10 bg-[var(--obsidian)] p-8 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--gold)]/30 lg:flex">
						<div>&copy; 2026 Kolam Heritage Project</div>
						<div className="flex gap-4">
							<span>Sacred Geometry</span>
						</div>
					</footer>
				</div>

				{/* Right Canvas */}
				<div className="order-1 kolam-dots-bg relative flex min-h-[52vh] min-w-0 items-center justify-center overflow-hidden border border-[var(--gold)]/10 bg-[var(--obsidian)] sm:min-h-[60vh] xl:order-2 xl:min-h-[calc(100vh-3rem)] xl:border-l-0">

					{/* Subtle corner ornaments */}
					<div className="pointer-events-none absolute left-4 top-4 h-12 w-12 border-l-2 border-t-2 border-[var(--gold)]/15" />
					<div className="pointer-events-none absolute right-4 top-4 h-12 w-12 border-r-2 border-t-2 border-[var(--gold)]/15" />
					<div className="pointer-events-none absolute bottom-4 left-4 h-12 w-12 border-b-2 border-l-2 border-[var(--gold)]/15" />
					<div className="pointer-events-none absolute bottom-4 right-4 h-12 w-12 border-b-2 border-r-2 border-[var(--gold)]/15" />

					{/* Download Menu */}
					<div className="absolute right-4 top-4 z-20 flex gap-2 lg:right-8 lg:top-8">
						<div className="download-menu relative">
							<button
								onClick={() => setShowDownloadMenu(!showDownloadMenu)}
								disabled={isExporting}
								className="flex h-10 items-center gap-2 border border-[var(--gold)]/20 bg-[var(--obsidian)]/80 px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]/70 backdrop-blur-xl transition-all hover:border-[var(--gold)]/40 hover:text-[var(--gold)] disabled:opacity-50"
							>
								{isExporting ? <span className="animate-spin">⟳</span> : '↓'} Save
							</button>

							{showDownloadMenu && (
								<div className="absolute right-0 mt-3 min-w-[200px] border border-[var(--gold)]/15 bg-[var(--obsidian)] py-2 shadow-2xl backdrop-blur-3xl">
									<button
										onClick={() => { exportPattern('svg'); setShowDownloadMenu(false); }}
										className="w-full border-b border-[var(--gold)]/10 px-5 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[var(--gold)]/60 transition-colors hover:bg-[var(--gold)]/10 hover:text-[var(--gold)]"
									>
										Save as SVG
									</button>
									<button
										onClick={() => { exportPattern('png'); setShowDownloadMenu(false); }}
										className="w-full px-5 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-[var(--gold)]/60 transition-colors hover:bg-[var(--saffron)]/10 hover:text-[var(--saffron)]"
									>
										Save as PNG
									</button>
								</div>
							)}
						</div>
					</div>

					{/* The Kolam Pattern */}
					{currentPattern ? (
						<div ref={kolamRef} className="animate-fade-in-up flex h-full w-full items-center justify-center p-4 sm:p-6 lg:p-10">
							<div className="flex w-full max-w-[88vw] justify-center transition-transform duration-1000 sm:max-w-[80vw] xl:max-w-full xl:scale-[0.94] 2xl:scale-100">
								<KolamDisplay
									pattern={currentPattern}
									animate={animationState === 'playing'}
									animationState={animationState}
									animationTiming={animationDuration}
									className="drop-shadow-[0_0_40px_rgba(212,165,116,0.1)] transition-all"
								/>
							</div>
						</div>
					) : (
						<HeritageLoader message="Tracing Sacred Geometry..." />
					)}
				</div>
			</div>
		</div>
	);
};
