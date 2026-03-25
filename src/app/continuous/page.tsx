'use client';

import { Footer } from '@/components/Footer';
import { KolamDisplay } from '@/components/KolamDisplay';
import { KolamPattern } from '@/types/kolam';
import { KolamGenerator } from '@/utils/kolamGenerator';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function ContinuousPage() {
	const [currentPattern, setCurrentPattern] = useState<KolamPattern | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [animationSpeed, setAnimationSpeed] = useState(3000);
	const [patternSize, setPatternSize] = useState(5);
	const [isAnimating, setIsAnimating] = useState(false);

	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const animationRef = useRef<NodeJS.Timeout | null>(null);

	const generateNewPattern = useCallback(() => {
		try {
			const newPattern = KolamGenerator.generateKolam1D(patternSize);
			setCurrentPattern(newPattern);
		} catch (error) {
			console.error('Failed to generate pattern:', error);
			setCurrentPattern(null);
		}
	}, [patternSize]);

	const togglePlayback = useCallback(() => {
		if (isPlaying) {
			setIsPlaying(false);
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			if (animationRef.current) {
				clearTimeout(animationRef.current);
				animationRef.current = null;
			}
			setIsAnimating(false);
		} else {
			setIsPlaying(true);
			generateNewPattern();
		}
	}, [isPlaying, generateNewPattern]);

	useEffect(() => {
		if (!isPlaying || !currentPattern) return;

		setIsAnimating(true);

		const animationDuration = Math.floor(animationSpeed * 0.8);

		animationRef.current = setTimeout(() => {
			setIsAnimating(false);
		}, animationDuration);

		timeoutRef.current = setTimeout(() => {
			if (isPlaying) {
				generateNewPattern();
			}
		}, animationSpeed);

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			if (animationRef.current) {
				clearTimeout(animationRef.current);
			}
		};
	}, [isPlaying, currentPattern, animationSpeed, generateNewPattern]);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			if (animationRef.current) {
				clearTimeout(animationRef.current);
			}
		};
	}, []);

	return (
		<div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
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
						<span className="ml-2 hidden font-elegant text-xs text-[var(--muted)] sm:inline">/ Continuous Flow</span>
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
			
			<div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
				{/* Kolam Display Area */}
				<div className="relative mb-8">
					<div className="heritage-card rounded-lg overflow-hidden">
						{/* Corner ornaments */}
						<div className="pointer-events-none absolute left-4 top-4 h-10 w-10 border-l border-t border-[var(--gold)]/20"></div>
						<div className="pointer-events-none absolute right-4 top-4 h-10 w-10 border-r border-t border-[var(--gold)]/20"></div>
						<div className="pointer-events-none absolute bottom-4 left-4 h-10 w-10 border-b border-l border-[var(--gold)]/20"></div>
						<div className="pointer-events-none absolute bottom-4 right-4 h-10 w-10 border-b border-r border-[var(--gold)]/20"></div>
						
						<div className="flex min-h-[300px] items-center justify-center bg-[var(--obsidian)] p-4 sm:min-h-[400px] sm:p-8 lg:p-12">
							{currentPattern ? (
								<>
									<KolamDisplay
										pattern={currentPattern}
										animate={isAnimating}
										animationState={isAnimating ? 'playing' : 'stopped'}
										animationTiming={Math.floor(animationSpeed * 0.8)}
										className="drop-shadow-[0_0_40px_rgba(201,162,39,0.15)]"
									/>
									
									{/* Status indicators */}
									<div className="absolute top-4 left-4 rounded border bg-[var(--surface)]/80 px-3 py-1.5 backdrop-blur-sm sm:px-4 sm:py-2">
										<div className="flex items-center gap-2">
											<span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-[var(--gold)] animate-pulse' : 'bg-[var(--muted)]'}`}></span>
											<span className="font-elegant text-xs text-[var(--ivory)] sm:text-sm">
												{isPlaying ? 'Playing' : 'Paused'}
											</span>
										</div>
									</div>

									<div className="absolute top-4 right-4 hidden rounded border border-[var(--border-subtle)] bg-[var(--surface)]/80 px-3 py-1.5 backdrop-blur-sm sm:block sm:px-4 sm:py-2">
										<span className="font-elegant text-xs text-[var(--muted)] sm:text-sm">
											{currentPattern.dots.length} dots • {currentPattern.curves.length} curves
										</span>
									</div>
								</>
							) : (
								<div className="flex flex-col items-center text-[var(--muted)]">
									<div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent mb-4"></div>
									<span className="font-elegant">Generating pattern...</span>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Controls */}
				<div className="heritage-card rounded-lg p-4 sm:p-6">
					<div className="grid gap-6 sm:grid-cols-2 lg:gap-8 mb-6 sm:mb-8">
						{/* Animation Speed */}
						<div>
							<label className="mb-3 block font-elegant text-sm text-[var(--muted)]">
								Animation Duration (seconds)
							</label>
							<div className="flex items-center gap-4">
								<input
									type="range"
									min="1"
									max="10"
									step="0.5"
									value={animationSpeed / 1000}
									onChange={(e) => setAnimationSpeed(parseFloat(e.target.value) * 1000)}
									disabled={isPlaying}
									className="flex-1"
								/>
								<span className="w-14 rounded border border-[var(--gold)]/30 bg-[var(--obsidian)] px-3 py-1 font-elegant text-sm text-[var(--gold)] text-center">
									{(animationSpeed / 1000).toFixed(1)}s
								</span>
							</div>
						</div>

						{/* Pattern Size */}
						<div>
							<label className="mb-3 block font-elegant text-sm text-[var(--muted)]">
								Pattern Size (grid)
							</label>
							<select
								value={patternSize}
								onChange={(e) => setPatternSize(parseInt(e.target.value))}
								disabled={isPlaying}
								className="w-full rounded border border-[var(--gold)]/30 bg-[var(--surface)] px-4 py-2 font-elegant text-[var(--ivory)] disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<option value={3}>3 × 3</option>
								<option value={4}>4 × 4</option>
								<option value={5}>5 × 5</option>
								<option value={6}>6 × 6</option>
								<option value={7}>7 × 7</option>
							</select>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-wrap justify-center gap-3 sm:gap-4">
						<button
							onClick={togglePlayback}
							className={`rounded border px-6 py-3 font-heritage text-base tracking-wide transition-all sm:px-8 ${
								isPlaying 
									? 'border-[var(--temple-red)]/50 bg-[var(--temple-red)]/20 text-[var(--temple-red)]' 
									: 'border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold)] hover:bg-[var(--gold)]/20'
							}`}
						>
							{isPlaying ? '◼ Stop' : '▶ Start Flow'}
						</button>

						<button
							onClick={generateNewPattern}
							disabled={isPlaying}
							className="rounded border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-6 py-3 font-heritage text-base text-[var(--accent)] transition-all hover:bg-[var(--accent)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Generate Pattern
						</button>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
