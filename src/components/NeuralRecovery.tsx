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
		<div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-4 pb-8 pt-28 sm:px-6 sm:pb-10 sm:pt-32 lg:gap-10 lg:px-8">
			<div className="flex max-w-3xl flex-col items-center gap-3 text-center">
				<h2 className="headline text-3xl tracking-tight text-[var(--secondary)] sm:text-4xl">
					Neural Recovery Engine
				</h2>
				<p className="text-[11px] font-light uppercase tracking-[0.38em] opacity-50 sm:text-xs">
					Restore geometric integrity // Status: {status.toUpperCase()}
				</p>
			</div>

			{status === 'idle' ? (
				<div className="flex w-full items-center justify-center py-16 sm:py-24">
					<div className="flex max-w-2xl flex-col items-center gap-8 text-center">
						<div className="grid grid-cols-5 gap-1 opacity-20">
							{Array.from({ length: 25 }).map((_, i) => (
								<div
									key={i}
									className="h-8 w-8 border border-white/20"
									style={{ background: i % 7 === 0 ? 'var(--primary)' : 'transparent' }}
								/>
							))}
						</div>
						<button
							onClick={startNewGame}
							className="headline bg-white/5 px-8 py-5 text-xl tracking-[0.18em] text-[var(--primary)] border-2 border-[var(--primary)] transition-all duration-300 hover:bg-[var(--primary)] hover:text-black sm:px-12 sm:text-2xl"
						>
							Initialize Recovery Sequence
						</button>
						<div className="flex flex-wrap items-center justify-center gap-4">
							{[3, 5, 7].map((size) => (
								<button
									key={size}
									onClick={() => setGridSize(size)}
									className={`border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all ${
										gridSize === size
											? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
											: 'border-white/20 text-white/40 hover:border-white/40 hover:text-white/60'
									}`}
								>
									{size}x{size}
								</button>
							))}
						</div>
					</div>
				</div>
			) : (
				<div className="grid w-full gap-6 xl:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_minmax(260px,320px)] xl:items-start">
					<div className="order-2 w-full xl:order-1">
						<div className="border border-white/10 bg-white/5 p-4 sm:p-5 xl:sticky xl:top-28">
							<div className="mb-4 text-center font-mono text-[10px] uppercase tracking-[0.4em] opacity-40">
								Neural DNA Toolbox
							</div>
							<div className="grid grid-cols-4 gap-2 sm:gap-3">
								{KOLAM_CURVE_PATTERNS.slice(0, 16).map((tile) => (
									<button
										key={tile.id}
										onClick={() => handleTileSelect(tile.id)}
										disabled={!selectedCell}
										title={`Tile 0x0${tile.id.toString(16)}`}
										className={`group flex aspect-square w-full items-center justify-center border p-3 transition-all duration-200 ${
											selectedCell
												? 'border-white/20 opacity-100 hover:border-[var(--primary)] hover:bg-[var(--primary)]/10'
												: 'border-white/5 opacity-35'
										}`}
									>
										<svg viewBox="-1.35 -1.35 2.7 2.7" className="h-full w-full opacity-80 transition-opacity group-hover:opacity-100">
											<path
												d={generateSVGPath(tile.points)}
												stroke="currentColor"
												strokeWidth="0.16"
												fill="none"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
											<circle cx="0" cy="0" r="0.1" fill="var(--secondary)" opacity="0.5" />
										</svg>
									</button>
								))}
							</div>
						</div>
					</div>

					<div className="order-1 flex min-w-0 flex-col items-center gap-4 xl:order-2">
						<div className="relative flex min-h-[360px] w-full items-center justify-center overflow-hidden border border-white/10 bg-black/30 p-3 sm:min-h-[520px] sm:p-6">
							{pattern ? (
								<KolamDisplay
									pattern={pattern}
									interactive={true}
									onCellClick={handleCellClick}
									cellStatus={cellStatus}
									className={`max-w-full ${isSolved ? 'animate-pulse' : ''}`}
								/>
							) : (
								<div className="headline flex h-96 w-96 items-center justify-center border border-white/10 opacity-20 animate-pulse">
									Loading Grid...
								</div>
							)}

							{status === 'won' && (
								<div className="absolute inset-0 z-50 flex flex-col items-center justify-center border-2 border-[var(--secondary)] bg-black/85">
									<div className="flex flex-col items-center gap-6 px-8 text-center">
										<div className="font-mono text-[10px] uppercase tracking-[0.5em] text-[var(--secondary)] opacity-70">
											System Integrity: 100%
										</div>
										<h3 className="headline animate-bounce text-3xl text-[var(--secondary)]">
											Neural Integrity Restored
										</h3>
										<button
											onClick={startNewGame}
											className="headline border-2 border-[var(--secondary)] px-8 py-4 text-lg tracking-widest text-[var(--secondary)] transition-all duration-300 hover:bg-[var(--secondary)] hover:text-black"
										>
											Next Level
										</button>
									</div>
								</div>
							)}
						</div>
					</div>

					<div className="order-3 flex w-full flex-col gap-4 font-mono text-[10px] uppercase xl:sticky xl:top-28">
						<div className="space-y-3 border border-white/10 bg-white/5 p-4">
							<div className="mb-1 text-[10px] tracking-[0.3em] text-[var(--primary)]">Instructions</div>
							<div className="space-y-2 leading-relaxed opacity-60">
								<div className="flex gap-2">
									<span className="shrink-0 text-[var(--secondary)]">01</span>
									<span>Click a corrupted cell (red pulse)</span>
								</div>
								<div className="flex gap-2">
									<span className="shrink-0 text-[var(--secondary)]">02</span>
									<span>Select correct tile from DNA toolbox</span>
								</div>
								<div className="flex gap-2">
									<span className="shrink-0 text-[var(--secondary)]">03</span>
									<span>Match all adjacency points</span>
								</div>
								<div className="flex gap-2">
									<span className="shrink-0 text-[var(--secondary)]">04</span>
									<span>Restore geometric symmetry</span>
								</div>
							</div>
						</div>

						<div className="space-y-2 border border-white/10 p-4 opacity-60">
							<div className="flex justify-between">
								<span>Complexity</span>
								<span className="text-[var(--primary)]">{gridSize}x{gridSize}</span>
							</div>
							<div className="flex justify-between">
								<span>Corruptions</span>
								<span className="text-[var(--secondary)]">{corruptedIndices.length}</span>
							</div>
							<div className="flex justify-between">
								<span>Resolved</span>
								<span className="text-green-400">
									{
										corruptedIndices.filter((idx) => {
											const [r, c] = idx.split('-').map(Number);
											return currentIds[r]?.[c] === correctIds[r]?.[c];
										}).length
									}
									/{corruptedIndices.length}
								</span>
							</div>
							<div className="flex justify-between">
								<span>Selected</span>
								<span className="text-white/80">{selectedCell ? `[${selectedCell.r}, ${selectedCell.c}]` : '--'}</span>
							</div>
						</div>

						<div className="space-y-2 border border-white/10 p-4 opacity-50">
							<div className="mb-2 tracking-[0.3em] text-[var(--primary)]">Cell States</div>
							<div className="flex items-center gap-2">
								<div className="h-3 w-3 border border-red-500 bg-red-500/20" />
								<span>Corrupted</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-3 w-3 border border-[var(--secondary)] bg-[var(--secondary)]/20" />
								<span>Selected</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="h-3 w-3 border border-green-500 bg-green-500/20" />
								<span>Fixed</span>
							</div>
						</div>

						<div className="flex flex-col gap-2">
							<button
								onClick={startNewGame}
								className="w-full border border-white/20 py-3 tracking-widest text-white/50 transition-all duration-200 hover:border-[var(--primary)] hover:text-[var(--primary)]"
							>
								Restart Session
							</button>
							<button
								onClick={() => setStatus('idle')}
								className="w-full border border-white/10 py-2 text-[9px] tracking-widest text-white/30 transition-colors hover:text-white/50"
							>
								Terminate Session
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
