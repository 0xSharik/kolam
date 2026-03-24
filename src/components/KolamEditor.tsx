'use client';

import { KolamPattern } from '@/types/kolam';
import { KolamExporter } from '@/utils/kolamExporter';
import { KolamGenerator } from '@/utils/kolamGenerator';
import { durationToSpeed, speedToDuration, updateURL, useKolamURLParams } from '@/utils/urlParams';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KolamDisplay } from './KolamDisplay';

export const KolamEditor: React.FC = () => {
	const [currentPattern, setCurrentPattern] = useState<KolamPattern | null>(null);
	const [isExporting, setIsExporting] = useState(false);
	const [showDownloadMenu, setShowDownloadMenu] = useState(false);
	const [animationState, setAnimationState] = useState<'stopped' | 'playing' | 'paused'>('stopped');
	const kolamRef = useRef<HTMLDivElement>(null);

	const urlParams = useKolamURLParams();
	const [size, setSize] = useState(urlParams.size);
	const [animationSpeed, setAnimationSpeed] = useState(durationToSpeed(urlParams.duration));
	const [animationDuration, setAnimationDuration] = useState(urlParams.duration);
	const [initialAutoAnimate, setInitialAutoAnimate] = useState(urlParams.initialAutoAnimate);

	useEffect(() => {
		updateURL({ size, duration: animationDuration, initialAutoAnimate });
	}, [size, animationDuration, initialAutoAnimate]);

	useEffect(() => {
		const newDuration = speedToDuration(animationSpeed);
		setAnimationDuration(newDuration);
	}, [animationSpeed]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (showDownloadMenu && !(event.target as Element).closest('.download-menu')) {
				setShowDownloadMenu(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [showDownloadMenu]);

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

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (event.target instanceof HTMLElement && (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT')) return;
			switch (event.key.toLowerCase()) {
				case ' ':
				case 'p':
					event.preventDefault();
					setAnimationState(prev => prev === 'playing' ? 'stopped' : 'playing');
					break;
				case 'g':
					event.preventDefault();
					generatePattern();
					break;
			}
		};
		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [animationState, generatePattern]);

	const exportPattern = async (format: 'svg' | 'png' | 'gif') => {
		if (!currentPattern || !kolamRef.current) return;
		setIsExporting(true);
		try {
			if (format === 'svg') await KolamExporter.downloadSVG(currentPattern);
			else if (format === 'png') await KolamExporter.downloadPNG(kolamRef.current, currentPattern.name);
		} catch (error) {
			console.error('Export failed:', error);
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div className="kolam-editor bg-[#131313] text-[#e5e2e1] flex-1">
			<div className="max-w-6xl mx-auto p-8">
				{/* Display Area */}
				<div className="kolam-display-area">
					{currentPattern ? (
						<div
							ref={kolamRef}
							className="kolam-container relative flex justify-center items-center bg-[#0e0e0e] border border-white/5 p-8 shadow-[0_0_50px_rgba(255,0,255,0.05)]"
						>
							<KolamDisplay
								pattern={currentPattern}
								animate={animationState === 'playing'}
								animationState={animationState}
								animationTiming={animationDuration}
								className="kolam-main"
							/>

							{/* Save button overlaid on canvas */}
							<div className="absolute top-4 right-4">
								<div className="relative download-menu">
									<button
										onClick={() => setShowDownloadMenu(!showDownloadMenu)}
										disabled={isExporting}
										className="p-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50 backdrop-blur-sm"
										title="Download Options"
									>
										{isExporting ? '⏳' : '💾'}
									</button>

									{showDownloadMenu && (
										<div className="absolute right-0 mt-2 bg-[#1c1b1b] border border-white/10 shadow-2xl py-1 z-10 min-w-[200px]">
											<button
												onClick={() => { exportPattern('svg'); setShowDownloadMenu(false); }}
												className="w-full text-left px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors headline text-[10px] tracking-widest uppercase"
											>
												📄 Download SVG
											</button>
											<button
												onClick={() => { exportPattern('png'); setShowDownloadMenu(false); }}
												className="w-full text-left px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 transition-colors headline text-[10px] tracking-widest uppercase"
											>
												🖼️ Download PNG
											</button>
										</div>
									)}
								</div>
							</div>
						</div>
					) : (
						<div className="no-pattern text-center py-20 bg-[#0e0e0e] border border-white/5">
							<p className="text-white/30 headline text-xs tracking-widest animate-pulse">
								INITIALIZING NEURAL GRID...
							</p>
						</div>
					)}
				</div>

				{/* Controls */}
				<div className="bg-[#1c1b1b] p-8 mt-8 border border-white/5">
					<h2 className="text-sm font-bold mb-8 text-white/50 headline tracking-[0.3em] uppercase flex items-center">
						<span className="mr-3 block w-2 h-2 bg-[#00fbfb]" />
						Operational Parameters
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
						{/* Size Parameter */}
						<div className="parameter-group">
							<label htmlFor="size" className="block text-[10px] font-bold text-white/30 mb-4 headline tracking-widest uppercase">
								Neural Complexity (Grid Size)
							</label>
							<div className="flex items-center space-x-6">
								<input
									id="size"
									type="range"
									min="3"
									max="15"
									value={size}
									onChange={(e) => setSize(parseInt(e.target.value))}
									className="flex-1 h-1 bg-white/10 appearance-none cursor-pointer"
									style={{ accentColor: '#00fbfb' }}
								/>
								<div className="bg-white/5 px-4 py-2 text-[#00fbfb] headline text-xs font-bold border border-[#00fbfb]/20">
									{size}
								</div>
							</div>
						</div>

						{/* Animation Speed Parameter */}
						<div className="parameter-group">
							<label htmlFor="animationSpeed" className="block text-[10px] font-bold text-white/30 mb-4 headline tracking-widest uppercase">
								Pulse Velocity (Animation)
							</label>
							<div className="flex items-center space-x-6">
								<input
									id="animationSpeed"
									type="range"
									min="1"
									max="10"
									value={animationSpeed}
									onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
									className="flex-1 h-1 bg-white/10 appearance-none cursor-pointer"
									style={{ accentColor: '#00fbfb' }}
								/>
								<div className="bg-white/5 px-4 py-2 text-[#00fbfb] headline text-xs font-bold border border-[#00fbfb]/20">
									{animationSpeed}
								</div>
							</div>
						</div>
					</div>

					{/* Buttons */}
					<div className="flex justify-center items-center gap-8 mt-4">
						{currentPattern && (
							<button
								onClick={() => setAnimationState(prev => prev === 'playing' ? 'stopped' : 'playing')}
								className={`px-8 py-4 border transition-all headline text-xs tracking-widest uppercase flex items-center gap-3 ${
									animationState === 'playing' 
									? 'bg-[#00fbfb] text-[#131313] border-[#00fbfb] shadow-[0_0_20px_rgba(0,251,251,0.3)]' 
									: 'bg-white/5 border-white/10 text-white hover:border-[#00fbfb] hover:text-[#00fbfb]'
								}`}
							>
								{animationState === 'playing' ? 'Stop Pulse' : 'Initiate Pulse'}
							</button>
						)}

						<button
							onClick={() => generatePattern()}
							className="px-10 py-4 bg-[#ffabf3] text-[#5b005b] border border-[#ffabf3] headline text-xs font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all shadow-[0_0_30px_rgba(255,0,255,0.2)]"
						>
							Compute Pattern
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
