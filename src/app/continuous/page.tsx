'use client';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { KolamDisplay } from '@/components/KolamDisplay';
import { KolamPattern } from '@/types/kolam';
import { KolamGenerator } from '@/utils/kolamGenerator';
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
			<Header 
				title="Continuous Flow" 
				subtitle="Seamless Pattern Animation" 
				showBackButton={true}
				backButtonHref="/"
				backButtonText="Back to Studio"
			/>
			
			<div className="mx-auto max-w-6xl p-6 lg:p-8">
				{/* Kolam Display Area */}
				<div className="relative mb-8">
					<div className="heritage-card rounded-lg overflow-hidden">
						{/* Corner ornaments */}
						<div className="pointer-events-none absolute left-4 top-4 h-10 w-10 border-l border-t border-[var(--gold)]/20"></div>
						<div className="pointer-events-none absolute right-4 top-4 h-10 w-10 border-r border-t border-[var(--gold)]/20"></div>
						<div className="pointer-events-none absolute bottom-4 left-4 h-10 w-10 border-b border-l border-[var(--gold)]/20"></div>
						<div className="pointer-events-none absolute bottom-4 right-4 h-10 w-10 border-b border-r border-[var(--gold)]/20"></div>
						
						<div className="flex min-h-[400px] items-center justify-center bg-[var(--obsidian)] p-8 lg:p-12">
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
									<div className="absolute top-4 left-4 rounded border bg-[var(--surface)]/80 px-4 py-2 backdrop-blur-sm">
										<div className="flex items-center gap-2">
											<span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-[var(--gold)] animate-pulse' : 'bg-[var(--muted)]'}`}></span>
											<span className="font-elegant text-sm text-[var(--ivory)]">
												{isPlaying ? 'Playing' : 'Paused'}
											</span>
										</div>
									</div>

									<div className="absolute top-4 right-4 rounded border border-[var(--border-subtle)] bg-[var(--surface)]/80 px-4 py-2 backdrop-blur-sm">
										<span className="font-elegant text-sm text-[var(--muted)]">
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
				<div className="heritage-card rounded-lg p-6">
					<div className="grid gap-6 md:grid-cols-2 lg:gap-8 mb-8">
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
					<div className="flex flex-wrap justify-center gap-4">
						<button
							onClick={togglePlayback}
							className={`rounded border px-8 py-3 font-heritage text-base tracking-wide transition-all ${
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
