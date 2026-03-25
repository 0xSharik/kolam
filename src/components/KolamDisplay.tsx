import { CurvePoint, KolamPattern } from '@/types/kolam';
import { generateSVGPath } from '@/utils/svgPathGenerator';
import React from 'react';

interface KolamDisplayProps {
	pattern: KolamPattern;
	animate?: boolean;
	animationState?: 'stopped' | 'playing' | 'paused';
	animationTiming?: number;
	className?: string;
	interactive?: boolean;
	onCellClick?: (row: number, col: number) => void;
	cellStatus?: Record<string, 'corrupted' | 'fixed' | 'normal'>;
}

export const KolamDisplay: React.FC<KolamDisplayProps> = ({
	pattern,
	animate = false,
	animationState = 'stopped',
	animationTiming = 150,
	className = '',
	interactive = false,
	onCellClick,
	cellStatus = {},
}) => {
	const { dimensions, dots, curves } = pattern;

	const calculatePathLength = (curvePoints?: CurvePoint[]): number => {
		if (!curvePoints || curvePoints.length < 2) return 100;
		let length = 0;
		for (let i = 1; i < curvePoints.length; i++) {
			const dx = curvePoints[i].x - curvePoints[i - 1].x;
			const dy = curvePoints[i].y - curvePoints[i - 1].y;
			length += Math.sqrt(dx * dx + dy * dy);
		}
		return Math.max(length, 50);
	};

	return (
		<div className={`kolam-container w-full flex justify-center ${className}`}>
			<svg
				viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
				className="kolam-svg w-full h-auto"
				style={{
					maxWidth: Math.min(dimensions.width, 900),
					'--animation-duration': `${animationTiming}ms`
				} as React.CSSProperties}
			>
				{/* Interactive cell overlays for game mode */}
				{interactive && pattern.grid.cells.map((row, i) => 
					row.map((cell, j) => {
						const status = cellStatus[`${i}-${j}`] || 'normal';
						return (
							<rect
								key={`hitbox-${i}-${j}`}
								x={cell.dotCenter.x - 30}
								y={cell.dotCenter.y - 30}
								width={60}
								height={60}
								fill={status === 'corrupted' ? 'rgba(255, 0, 0, 0.1)' : 'transparent'}
								stroke={status === 'corrupted' ? 'rgba(255, 0, 0, 0.3)' : 'transparent'}
								strokeWidth={1}
								className={`transition-colors hover:fill-white/10 ${status === 'corrupted' ? 'animate-pulse' : ''}`}
								onClick={() => onCellClick?.(i, j)}
							/>
						);
					})
				)}

				{/* Render dots */}
				{dots.map((dot, index) => {
					const cellX = Math.round(dot.center.x / 60) - 1;
					const cellY = Math.round(dot.center.y / 60) - 1;
					const status = cellStatus[`${cellY}-${cellX}`] || 'normal';
					
					return (
						<circle
							key={dot.id}
							cx={dot.center.x}
							cy={dot.center.y}
							r={dot.radius || 3}
							fill={status === 'corrupted' ? 'rgba(255,0,0,0.2)' : (dot.filled ? (dot.color || 'var(--secondary)') : 'none')}
							stroke={status === 'corrupted' ? 'rgba(255,0,0,0.5)' : (dot.color || 'var(--secondary)')}
							strokeWidth={dot.filled ? 0 : 1}
							className={animate ? 'kolam-dot-animated' : 'kolam-dot'}
							style={
								animate
									? {
										animationDelay: `${(index / dots.length) * animationTiming * 0.9}ms`,
										animationDuration: `${animationTiming / dots.length}ms`,
										opacity: 0,
										animationPlayState: animationState === 'paused' ? 'paused' : 'running',
									}
									: animationState === 'stopped'
										? { opacity: 1 }
										: {}
							}
						/>
					);
				})}

				{/* Render curves with per-curve colors */}
				{curves.map((curve, index) => {
					const cellX = Math.round(curve.start.x / 60) - 1;
					const cellY = Math.round(curve.start.y / 60) - 1;
					const status = cellStatus[`${cellY}-${cellX}`] || 'normal';

					const lineAnimTime = (animationTiming / curves.length) * 3;
					const curveDelay = lineAnimTime * index / 3;
					const curveColor = curve.color || 'var(--primary)';

					if (curve.curvePoints && curve.curvePoints.length > 1) {
						const pathLength = calculatePathLength(curve.curvePoints);

						return (
							<path
								key={curve.id}
								d={generateSVGPath(curve.curvePoints)}
								stroke={status === 'corrupted' ? 'rgba(255,0,0,0.3)' : curveColor}
								strokeWidth={curve.strokeWidth || 2}
								fill="none"
								strokeLinecap="round"
								strokeLinejoin="round"
								className={animate ? 'kolam-path-animated' : 'kolam-path'}
								style={
									animate || status === 'corrupted'
										? {
											animationDelay: `${curveDelay}ms`,
											animationDuration: `${lineAnimTime}ms`,
											strokeDasharray: `${pathLength}`,
											strokeDashoffset: `${pathLength}`,
											animationPlayState: animationState === 'paused' ? 'paused' : 'running',
											filter: status === 'corrupted' ? 'none' : `drop-shadow(0 0 4px ${curveColor})`,
											opacity: status === 'corrupted' ? 0.3 : 1
										}
										: animationState === 'stopped'
											? { strokeDasharray: 'none', strokeDashoffset: '0', opacity: 1, filter: `drop-shadow(0 0 4px ${curveColor})` }
											: {}
								}
							/>
						);
					}
					return null;
				})}
			</svg>

			<style jsx>{`
        .kolam-dot-animated {
          animation: fadeIn ease-in-out forwards;
        }
        .kolam-line-animated,
        .kolam-path-animated {
          animation: drawPath ease-in-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes drawPath {
          to { stroke-dashoffset: 0; }
        }
        .kolam-svg {
          filter: drop-shadow(0 0 15px rgba(201, 162, 39, 0.08));
        }
        .kolam-path,
        .kolam-line {
          transition: all 0.2s ease;
        }
        .kolam-path:hover,
        .kolam-line:hover {
          stroke-width: 4;
        }
      `}</style>
		</div>
	);
};
