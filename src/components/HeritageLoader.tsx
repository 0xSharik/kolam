'use client';

import React from 'react';

interface HeritageLoaderProps {
	message?: string;
	size?: 'sm' | 'md' | 'lg';
}

export const HeritageLoader: React.FC<HeritageLoaderProps> = ({
	message = 'Tracing Sacred Geometry...',
	size = 'md',
}) => {
	const dims = size === 'sm' ? 60 : size === 'md' ? 100 : 140;
	const dotR = size === 'sm' ? 2.5 : 3.5;

	return (
		<div className="flex flex-col items-center gap-6">
			<div className="relative" style={{ width: dims, height: dims }}>
				{/* Outer spinning ring of kolam dots */}
				<svg
					viewBox="0 0 100 100"
					className="animate-kolam-spin"
					style={{ width: dims, height: dims }}
				>
					{Array.from({ length: 8 }).map((_, i) => {
						const angle = (i * 45 * Math.PI) / 180;
						const cx = 50 + 38 * Math.cos(angle);
						const cy = 50 + 38 * Math.sin(angle);
						return (
							<circle
								key={`outer-${i}`}
								cx={cx}
								cy={cy}
								r={dotR}
								fill="var(--gold)"
								opacity={0.3 + (i / 8) * 0.7}
							/>
						);
					})}
					{/* Connecting arcs */}
					<circle
						cx="50"
						cy="50"
						r="38"
						fill="none"
						stroke="var(--gold)"
						strokeWidth="0.5"
						opacity="0.2"
						strokeDasharray="8 12"
					/>
				</svg>

				{/* Inner counter-spinning ring */}
				<svg
					viewBox="0 0 100 100"
					className="absolute inset-0"
					style={{
						width: dims,
						height: dims,
						animation: 'kolamDotSpin 2s linear infinite reverse',
					}}
				>
					{Array.from({ length: 4 }).map((_, i) => {
						const angle = (i * 90 * Math.PI) / 180;
						const cx = 50 + 20 * Math.cos(angle);
						const cy = 50 + 20 * Math.sin(angle);
						return (
							<circle
								key={`inner-${i}`}
								cx={cx}
								cy={cy}
								r={dotR * 0.8}
								fill="var(--saffron)"
								opacity={0.5 + (i / 4) * 0.5}
							/>
						);
					})}
					<circle
						cx="50"
						cy="50"
						r="20"
						fill="none"
						stroke="var(--saffron)"
						strokeWidth="0.5"
						opacity="0.15"
					/>
				</svg>

				{/* Center pulsing dot */}
				<div
					className="animate-kolam-pulse absolute rounded-full"
					style={{
						width: dotR * 4,
						height: dotR * 4,
						background: 'var(--temple-red)',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						boxShadow: '0 0 20px rgba(192, 57, 43, 0.4)',
					}}
				/>
			</div>

			{message && (
				<p className="font-heritage text-sm tracking-[0.3em] text-[var(--gold)] opacity-70 animate-pulse text-center">
					{message}
				</p>
			)}
		</div>
	);
};
