'use client';

import { KOLAM_CURVE_PATTERNS } from '@/data/kolamPatterns';
import { KolamPattern } from '@/types/kolam';
import { KolamGenerator } from '@/utils/kolamGenerator';
import { generateSVGPath } from '@/utils/svgPathGenerator';
import React, { useCallback, useState } from 'react';
import { KolamDisplay } from './KolamDisplay';

export const NeuralRecovery: React.FC = () => {
	const [gridSize, setGridSize] = useState(5);
	const [pattern, setPattern] = useState<KolamPattern | null>(null);
	const [correctIds, setCorrectIds] = useState<number[][]>([]);
	const [currentIds, setCurrentIds] = useState<number[][]>([]);
	const [corruptedIndices, setCorruptedIndices] = useState<string[]>([]);
	const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
	const [isSolved, setIsSolved] = useState(false);
	const [status, setStatus] = useState<'idle' | 'playing' | 'won'>('idle');

	const updatePatternDisplay = (ids: number[][], base: KolamPattern) => {
		const newPattern = KolamGenerator.reconstructPattern(ids, base);
		setPattern(newPattern);
	};

	const startNewGame = useCallback(() => {
		const basePattern = KolamGenerator.generateKolam1D(gridSize);
		setPattern(basePattern);

		const ids: number[][] = basePattern.grid.cells.map((row) => row.map((cell) => cell.patternId));
		setCorrectIds(ids);

		const corrupted = JSON.parse(JSON.stringify(ids));
		const corruptedList: string[] = [];
		const corruptionCount = Math.floor((gridSize * gridSize) / 4);

		for (let i = 0; i < corruptionCount; i++) {
			const r = Math.floor(Math.random() * gridSize);
			const c = Math.floor(Math.random() * gridSize);
			if (!corruptedList.includes(`${r}-${c}`)) {
				corrupted[r][c] = 1;
				corruptedList.push(`${r}-${c}`);
			}
		}

		setCurrentIds(corrupted);
		setCorruptedIndices(corruptedList);
		setSelectedCell(null);
		setIsSolved(false);
		setStatus('playing');

		updatePatternDisplay(corrupted, basePattern);
	}, [gridSize]);

	const handleCellClick = (r: number, c: number) => {
		if (status !== 'playing') return;
		setSelectedCell({ r, c });
	};

	const checkWinCondition = (ids: number[][]) => {
		let solved = true;
		for (let r = 0; r < gridSize; r++) {
			for (let c = 0; c < gridSize; c++) {
				if (ids[r][c] !== correctIds[r][c]) {
					solved = false;
					break;
				}
			}
		}
		if (solved) {
			setIsSolved(true);
			setStatus('won');
		}
	};

	const handleTileSelect = (tileId: number) => {
		if (!selectedCell || status !== 'playing') return;

		const { r, c } = selectedCell;
		const newIds = [...currentIds];
		newIds[r][c] = tileId;
		setCurrentIds(newIds);

		if (pattern) {
			updatePatternDisplay(newIds, pattern);
		}

		checkWinCondition(newIds);
	};

	const cellStatus: Record<string, 'corrupted' | 'fixed' | 'normal'> = {};
	corruptedIndices.forEach((idx) => {
		const [r, c] = idx.split('-').map(Number);
		if (currentIds[r]?.[c] === 1) {
			cellStatus[idx] = 'corrupted';
		} else if (currentIds[r]?.[c] === correctIds[r]?.[c]) {
			cellStatus[idx] = 'fixed';
		} else {
			cellStatus[idx] = 'corrupted';
		}
	});

	if (selectedCell) {
		cellStatus[`${selectedCell.r}-${selectedCell.c}`] = 'normal';
	}

	return (
		<div className="w-full">
			<div className="mx-auto w-full max-w-[1400px]">

				{status === 'idle' ? (
					<div className="flex w-full items-center justify-center py-24 sm:py-32 lg:py-40">
						<div className="flex max-w-3xl flex-col items-center gap-12 text-center">
							<div className="grid grid-cols-5 gap-2 opacity-30">
								{Array.from({ length: 25 }).map((_, i) => (
									<div
										key={i}
										className="h-10 w-10 rounded-sm sm:h-12 sm:w-12"
										style={{ backgroundColor: i % 7 === 0 ? 'var(--primary)' : 'var(--border-subtle)' }}
									/>
								))}
							</div>
							
							<div>
								<h2 className="font-heritage text-5xl text-[var(--foreground)] sm:text-6xl lg:text-7xl">
									Recover Sequence
								</h2>
								<p className="mt-6 font-elegant text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
									Restore the geometric integrity of the system
								</p>
							</div>

							<div className="mt-4 flex flex-col items-center gap-8">
								<button
									onClick={startNewGame}
									className="group relative flex items-center justify-center gap-4 rounded-md bg-[var(--foreground)] px-12 py-5 font-elegant text-sm uppercase tracking-widest text-[var(--background)] transition-all hover:-translate-y-1 hover:bg-[var(--primary)] hover:shadow-xl hover:shadow-[var(--primary)]/20"
								>
									<span>Initialize</span>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 transition-transform group-hover:translate-x-1">
										<path d="M5 12h14m-7-7l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
									</svg>
								</button>
								
								<div className="flex flex-wrap items-center justify-center gap-4">
									<span className="font-elegant text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Complexity Matrix:</span>
									<div className="flex gap-2">
										{[3, 5, 7].map((size) => (
											<button
												key={size}
												onClick={() => setGridSize(size)}
												className={`rounded-md px-4 py-2 font-elegant text-xs transition-all ${
													gridSize === size
														? 'bg-[var(--border-subtle)] text-[var(--foreground)] shadow-sm'
														: 'text-[var(--muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]'
												}`}
											>
												{size} × {size}
											</button>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="flex flex-col gap-16 lg:gap-24">
						
						{/* Header */}
						<div className="flex flex-col items-start justify-between gap-6 border-b border-[var(--border-subtle)] pb-8 pt-8 lg:flex-row lg:items-end lg:pt-0">
							<div>
								<h2 className="font-heritage text-4xl text-[var(--foreground)] lg:text-5xl">Grid Interface</h2>
								<p className="mt-4 flex items-center gap-4 font-elegant text-xs uppercase tracking-widest text-[var(--muted)]">
									<span className="h-px w-8 bg-[var(--primary)]"></span>
									{status === 'playing' ? 'Session Active' : 'Sequence Complete'}
								</p>
							</div>
							<div className="flex flex-wrap items-center gap-6 font-elegant text-xs uppercase tracking-widest">
								<div className="flex items-center gap-2">
									<span className="text-[var(--muted)]">Corruptions:</span>
									<span className="font-mono text-[var(--temple-red)] text-sm">{corruptedIndices.length}</span>
								</div>
								<div className="h-4 w-px bg-[var(--border-subtle)]"></div>
								<div className="flex items-center gap-2">
									<span className="text-[var(--muted)]">Resolved:</span>
									<span className="font-mono text-[var(--gold)] text-sm">
										{corruptedIndices.filter((idx) => {
											const [r, c] = idx.split('-').map(Number);
											return currentIds[r]?.[c] === correctIds[r]?.[c];
										}).length}/{corruptedIndices.length}
									</span>
								</div>
							</div>
						</div>

						{/* Main Layout */}
						<div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16 xl:gap-24">
							
							{/* Left: DNA Toolbox */}
							<div className="lg:col-span-3 xl:col-span-3">
								<h3 className="mb-8 font-elegant text-xs uppercase tracking-[0.3em] text-[var(--primary)]">Neural DNA</h3>
								
								<div className="grid grid-cols-4 gap-3">
									{KOLAM_CURVE_PATTERNS.slice(0, 16).map((tile) => (
										<button
											key={tile.id}
											onClick={() => handleTileSelect(tile.id)}
											disabled={!selectedCell}
											title={`Tile 0x0${tile.id.toString(16)}`}
											className={`group relative flex aspect-square w-full items-center justify-center transition-all duration-300 ${
												selectedCell
													? 'cursor-pointer hover:bg-[var(--surface-elevated)]'
													: 'cursor-not-allowed opacity-30'
											}`}
										>
											<div className="absolute inset-0 border border-[var(--border-subtle)] transition-opacity group-hover:opacity-0" />
											<div className="absolute inset-0 border border-[var(--primary)]/30 bg-[var(--primary)]/5 opacity-0 transition-opacity group-hover:opacity-100" />
											<svg viewBox="-1.35 -1.35 2.7 2.7" className="relative h-full w-full opacity-70 transition-opacity group-hover:opacity-100">
												<path
													d={generateSVGPath(tile.points)}
													stroke="currentColor"
													strokeWidth="0.16"
													fill="none"
													strokeLinecap="round"
													strokeLinejoin="round"
													className={selectedCell ? 'text-[var(--foreground)] group-hover:text-[var(--primary)]' : 'text-[var(--muted)]'}
												/>
												<circle cx="0" cy="0" r="0.1" fill="var(--secondary)" opacity="0.4" />
											</svg>
										</button>
									))}
								</div>
								
								{selectedCell ? (
									<div className="mt-8 border-l border-[var(--primary)] pl-4">
										<p className="font-elegant text-[10px] uppercase tracking-widest text-[var(--muted)]">Target Selected</p>
										<p className="mt-1 font-mono text-xs text-[var(--foreground)]">[{selectedCell.r}, {selectedCell.c}]</p>
									</div>
								) : (
									<div className="mt-8 border-l border-[var(--border-medium)] pl-4">
										<p className="font-elegant text-[10px] uppercase tracking-widest text-[var(--muted)]">No Target</p>
										<p className="mt-1 font-elegant text-xs text-[var(--muted)]">Select node from grid</p>
									</div>
								)}
							</div>

							{/* Center: Interactive Canvas */}
							<div className="lg:col-span-6 xl:col-span-6">
								<div className="relative flex min-h-[400px] w-full items-center justify-center sm:min-h-[500px] lg:min-h-[600px] mix-blend-multiply">
									{pattern ? (
										<KolamDisplay
											pattern={pattern}
											interactive={status === 'playing'}
											onCellClick={handleCellClick}
											cellStatus={cellStatus}
											className={`max-w-full transition-all duration-1000 ${status === 'won' ? 'scale-105 opacity-80' : ''}`}
										/>
									) : (
										<div className="flex flex-col items-center gap-6 text-[var(--muted)]">
											<span className="h-8 w-8 rounded-full border-2 border-[var(--border-medium)] border-t-[var(--primary)] animate-spin"></span>
											<span className="font-elegant text-xs uppercase tracking-widest">Generating Pattern...</span>
										</div>
									)}

									{status === 'won' && (
										<div className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--background)]/80 backdrop-blur-sm transition-opacity duration-1000">
											<div className="flex flex-col items-center gap-8 text-center p-8">
												<div className="flex items-center justify-center h-20 w-20 rounded-md border border-[var(--gold)]/30 bg-[var(--gold)]/5 text-[var(--gold)]">
													<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-10 w-10">
														<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
														<polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
													</svg>
												</div>
												<div>
													<p className="font-elegant text-xs uppercase tracking-[0.4em] text-[var(--gold)]">Sequence 100%</p>
													<h3 className="mt-3 font-heritage text-5xl text-[var(--foreground)]">Restored</h3>
												</div>
												<button
													onClick={startNewGame}
													className="mt-4 rounded-md border border-[var(--border-subtle)] px-10 py-4 font-elegant text-xs uppercase tracking-widest text-[var(--foreground)] transition-all hover:border-[var(--gold)] hover:text-[var(--gold)]"
												>
													Next Sequence
												</button>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Right: Operations & Log */}
							<div className="lg:col-span-3 xl:col-span-3">
								<h3 className="mb-8 font-elegant text-xs uppercase tracking-[0.3em] text-[var(--primary)]">Operations</h3>
								
								<ol className="flex flex-col gap-6">
									{[
										{ label: 'Identify', text: 'Locate pulsing red nodes within grid' },
										{ label: 'Target', text: 'Select corrupted node to arm toolbox' },
										{ label: 'Execute', text: 'Inject correct neural tile pattern' },
										{ label: 'Verify', text: 'Restore symmetric flow' }
									].map((step, i) => (
										<li key={i} className="flex gap-4">
											<span className="font-mono text-xs text-[var(--muted)] pt-0.5">0{i + 1}</span>
											<div>
												<p className="font-elegant text-xs tracking-widest text-[var(--foreground)]">{step.label}</p>
												<p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{step.text}</p>
											</div>
										</li>
									))}
								</ol>

								<div className="mt-16 flex flex-col gap-4 border-t border-[var(--border-subtle)] pt-12">
									<button
										onClick={startNewGame}
										className="w-full rounded-md border border-[var(--primary)]/30 bg-[var(--surface-elevated)] px-6 py-4 font-elegant text-xs uppercase tracking-widest text-[var(--primary)] transition-all hover:bg-[var(--primary)] hover:text-[var(--background)] shadow-sm"
									>
										Restart Matrix
									</button>
									<button
										onClick={() => setStatus('idle')}
										className="w-full rounded-md border border-[var(--border-medium)] bg-transparent px-6 py-4 font-elegant text-xs uppercase tracking-widest text-[var(--muted)] transition-all hover:border-[var(--temple-red)]/50 hover:bg-[var(--temple-red)]/5 hover:text-[var(--temple-red)]"
									>
										Terminate
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
