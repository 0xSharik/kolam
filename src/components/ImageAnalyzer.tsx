'use client';

import { analyzeKolamImage, type KolamEngineResult } from '@/utils/kolamImageAnalysis';
import React, { ChangeEvent, useState } from 'react';

type AnalysisResult = KolamEngineResult & {
	fileName: string;
	fileType: string;
	fileSizeLabel: string;
	width: number;
	height: number;
	aiStatus?: 'idle' | 'loading' | 'success' | 'error';
	aiError?: string;
	aiAnalysis?: {
		finalKolamType: string;
		finalRegion: string;
		finalGrid: string;
		finalNodes: number;
		confidence: string;
		motif: string;
		complexity: string;
		validity: string;
		verificationSummary: string;
		symmetryAssessment: string;
		structuralAssessment: string;
		culturalContext: {
			regionalTradition: string;
			possibleFestivals: string[];
			ritualSignificance: string;
			archivalTags: string[];
		};
		recreationGuide: string[];
		detailedSummary: string;
	};
};

const formatBytes = (bytes: number) => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const ImageAnalyzer: React.FC = () => {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		setError(null);
		setIsAnalyzing(true);
		if (previewUrl) URL.revokeObjectURL(previewUrl);

		try {
			const objectUrl = URL.createObjectURL(file);
			setPreviewUrl(objectUrl);

			const image = new Image();
			image.src = objectUrl;
			await new Promise<void>((resolve, reject) => {
				image.onload = () => resolve();
				image.onerror = () => reject(new Error('Image could not be loaded.'));
			});

			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');
			if (!context) throw new Error('Canvas analysis is not available.');

			const sampleWidth = 320;
			const sampleHeight = Math.max(240, Math.round((image.height / image.width) * sampleWidth));
			canvas.width = sampleWidth;
			canvas.height = sampleHeight;
			context.drawImage(image, 0, 0, sampleWidth, sampleHeight);

			const imageData = context.getImageData(0, 0, sampleWidth, sampleHeight);
			const engineResult = analyzeKolamImage(imageData.data, sampleWidth, sampleHeight);
			const baseAnalysis: AnalysisResult = {
				fileName: file.name,
				fileType: file.type || 'Unknown',
				fileSizeLabel: formatBytes(file.size),
				width: image.width,
				height: image.height,
				aiStatus: 'loading',
				...engineResult,
			};

			setAnalysis(baseAnalysis);
			setIsAiAnalyzing(true);

			const base64 = await new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => {
					const result = reader.result;
					if (typeof result !== 'string') { reject(new Error('Unable to read image as base64.')); return; }
					resolve(result.split(',')[1] || '');
				};
				reader.onerror = () => reject(new Error('Unable to read image as base64.'));
				reader.readAsDataURL(file);
			});

			const aiResponse = await fetch('/api/analyze-kolam', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					imageBase64: base64,
					mimeType: file.type || 'image/png',
					fileName: file.name,
					profile: 'Heritage Core',
					engine: engineResult,
				}),
			});

			if (!aiResponse.ok) {
				const failure = await aiResponse.json().catch(() => null);
				setAnalysis({ ...baseAnalysis, aiStatus: 'error', aiError: failure?.error || 'Model analysis failed.' });
				return;
			}

			const aiPayload = await aiResponse.json();
			setAnalysis({ ...baseAnalysis, aiStatus: 'success', aiAnalysis: aiPayload.analysis });
		} catch (analysisError) {
			const message = analysisError instanceof Error ? analysisError.message : 'Analysis failed.';
			setError(message);
			setAnalysis((current) => current ? { ...current, aiStatus: 'error', aiError: message } : null);
		} finally {
			setIsAnalyzing(false);
			setIsAiAnalyzing(false);
			event.target.value = '';
		}
	};

	return (
		<div className="w-full">
			<div className="mx-auto w-full max-w-[1400px]">
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-24">
					
					{/* ── LEFT PANEL: ACTIONS ── */}
					<div className="flex flex-col gap-16 lg:col-span-5">
						
						{/* Upload Section */}
						<div className="flex flex-col gap-6">
							<div>
								<h3 className="font-heritage text-3xl text-[var(--foreground)]">Analyze Pattern</h3>
								<p className="mt-2 font-elegant text-sm text-[var(--muted)] leading-relaxed">
									Upload a kolam photograph or digital drawing to determine structural validity.
								</p>
							</div>

							<label className="group relative flex min-h-[280px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden transition-all">
								<div className="absolute inset-0 border border-dashed border-[var(--border-medium)] transition-colors group-hover:border-[var(--primary)]/60"></div>
								<div className="absolute inset-0 bg-[var(--surface)] opacity-0 transition-opacity group-hover:opacity-40"></div>
								
								{previewUrl ? (
									<img
										src={previewUrl}
										alt="Preview"
										className="absolute inset-0 h-full w-full object-contain p-4 mix-blend-multiply opacity-80 transition-opacity group-hover:opacity-40"
									/>
								) : (
									<div className="relative z-10 flex flex-col items-center gap-4 text-center">
										<div className="flex h-16 w-16 items-center justify-center rounded-md bg-[var(--primary)]/10 text-[var(--primary)] transition-transform group-hover:-translate-y-1">
											<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
												<polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/>
												<line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
											</svg>
										</div>
										<div className="flex flex-col items-center gap-2 mt-4">
											<span className="rounded-md bg-[var(--primary)] px-10 py-6 font-elegant text-sm font-semibold uppercase tracking-widest text-[var(--background)] shadow-md transition-all group-hover:shadow-lg group-hover:-translate-y-0.5">Select File</span>
											<p className="mt-2 font-mono text-[10px] text-[var(--muted)]">JPG, PNG OR WEBP</p>
										</div>
									</div>
								)}
								<input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
							</label>

							{/* Status Feedback */}
							{isAnalyzing && (
								<div className="flex items-center gap-4 border-l-2 border-[var(--gold)] pl-4">
									<span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] animate-pulse"></span>
									<span className="font-elegant text-xs uppercase tracking-widest text-[var(--gold)]">Processing imagery...</span>
								</div>
							)}
							{isAiAnalyzing && (
								<div className="flex items-center gap-4 border-l-2 border-[var(--primary)] pl-4">
									<span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse"></span>
									<span className="font-elegant text-xs uppercase tracking-widest text-[var(--primary)]">Neural classification...</span>
								</div>
							)}
							{error && (
								<div className="border-l-2 border-[var(--temple-red)] pl-4 text-sm text-[var(--temple-red)]">
									{error}
								</div>
							)}
						</div>
					</div>

					{/* ── RIGHT PANEL: Output Report ── */}
					<div className="lg:col-span-7">
						{!analysis ? (
							<div className="flex h-full min-h-[400px] flex-col justify-center border-t border-[var(--border-subtle)] lg:border-l lg:border-t-0 lg:pl-16">
								<h2 className="font-heritage text-4xl text-[var(--foreground)] opacity-20 lg:text-5xl">Structural<br />Report</h2>
								<div className="mt-8 flex items-center gap-6 opacity-40">
									<div className="h-px w-16 bg-[var(--border-medium)]"></div>
									<span className="font-elegant text-xs tracking-widest text-[var(--muted)]">AWAITING INPUT</span>
								</div>
							</div>
						) : (
							<div className="flex h-full flex-col border-t border-[var(--border-subtle)] pt-12 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
								
								{/* Headers */}
								<div className="mb-12">
									<div className="mb-4 flex items-center justify-between">
										<span className="font-elegant text-xs uppercase tracking-[0.3em] text-[var(--primary)]">
											{analysis.aiAnalysis ? 'Neural Output' : 'Engine Output'}
										</span>
										<span className="font-mono text-[10px] text-[var(--muted)]">{analysis.fileName}</span>
									</div>
									<h2 className="font-heritage text-4xl text-[var(--foreground)] lg:text-5xl">
										{analysis.aiAnalysis ? analysis.aiAnalysis.finalKolamType : analysis.kolamType}
									</h2>
								</div>

								{/* Core Metrics */}
								{analysis.aiAnalysis && (
									<div className="mb-16 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
										{[
											{ label: 'Region', value: analysis.aiAnalysis.finalRegion },
											{ label: 'Grid', value: analysis.aiAnalysis.finalGrid },
											{ label: 'Nodes', value: String(analysis.aiAnalysis.finalNodes) },
											{ label: 'Confidence', value: analysis.aiAnalysis.confidence },
										].map(({ label, value }) => (
											<div key={label} className="border-l border-[var(--border-subtle)] pl-4">
												<div className="mb-2 font-elegant text-[10px] uppercase tracking-widest text-[var(--muted)]">
													{label}
												</div>
												<div className="font-mono text-sm text-[var(--foreground)]">{value}</div>
											</div>
										))}
									</div>
								)}

								{/* Narrative Analysis */}
								{analysis.aiAnalysis && (
									<div className="space-y-16">
										<div>
											<h4 className="mb-6 font-elegant text-xs uppercase tracking-widest text-[var(--gold)]">Detailed Summary</h4>
											<p className="text-base leading-loose text-[var(--foreground)] opacity-90 text-justify">
												{analysis.aiAnalysis.detailedSummary}
											</p>
										</div>

										<div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
											<div>
												<h4 className="mb-4 flex items-center gap-3 font-elegant text-xs uppercase tracking-widest text-[var(--muted)]">
													<span className="h-px w-6 bg-[var(--border-medium)]"></span> Structural Form
												</h4>
												<p className="text-sm leading-relaxed text-[var(--muted)]">
													{analysis.aiAnalysis.structuralAssessment}
												</p>
											</div>
											<div>
												<h4 className="mb-4 flex items-center gap-3 font-elegant text-xs uppercase tracking-widest text-[var(--muted)]">
													<span className="h-px w-6 bg-[var(--border-medium)]"></span> Symmetry Index
												</h4>
												<p className="text-sm leading-relaxed text-[var(--muted)]">
													{analysis.aiAnalysis.symmetryAssessment}
												</p>
											</div>
										</div>

										<div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 border-t border-[var(--border-subtle)] pt-12">
											<div>
												<h4 className="mb-6 font-elegant text-xs uppercase tracking-widest text-[var(--foreground)]">Regional Context</h4>
												<p className="text-sm leading-relaxed text-[var(--muted)]">
													{analysis.aiAnalysis.culturalContext.regionalTradition}
												</p>
												{analysis.aiAnalysis.culturalContext.possibleFestivals.length > 0 && (
													<div className="mt-4 flex flex-wrap gap-2">
														{analysis.aiAnalysis.culturalContext.possibleFestivals.map(f => (
															<span key={f} className="rounded-full border border-[var(--border-subtle)] px-3 py-1 font-elegant text-[10px] uppercase tracking-wider text-[var(--muted)]">{f}</span>
														))}
													</div>
												)}
											</div>
											<div>
												<h4 className="mb-6 font-elegant text-xs uppercase tracking-widest text-[var(--foreground)]">Ritual Significance</h4>
												<p className="text-sm leading-relaxed text-[var(--muted)]">
													{analysis.aiAnalysis.culturalContext.ritualSignificance}
												</p>
											</div>
										</div>

										{/* Recreation Guide */}
										{analysis.aiAnalysis.recreationGuide.length > 0 && (
											<div className="border-t border-[var(--border-subtle)] pt-12 pb-8">
												<h4 className="mb-8 font-elegant text-xs uppercase tracking-widest text-[var(--primary)]">Recreation Protocol</h4>
												<ol className="space-y-6">
													{analysis.aiAnalysis.recreationGuide.map((step, i) => (
														<li key={i} className="flex gap-6 border-l border-[var(--primary)]/20 pl-6">
															<span className="shrink-0 font-mono text-[10px] text-[var(--primary)] pt-1">{String(i + 1).padStart(2, '0')}</span>
															<span className="text-sm leading-relaxed text-[var(--foreground)] opacity-90">{step}</span>
														</li>
													))}
												</ol>
											</div>
										)}
									</div>
								)}

								{analysis.aiStatus === 'loading' && (
									<div className="mt-16 flex items-center gap-6">
										<div className="h-px w-full max-w-[100px] bg-[var(--border-medium)]"></div>
										<span className="font-elegant text-xs uppercase tracking-widest text-[var(--primary)]">Synthesizing full report...</span>
									</div>
								)}

								{analysis.aiStatus === 'error' && (
									<div className="mt-16 border-l-2 border-[var(--temple-red)] pl-6 text-sm text-[var(--temple-red)]">
										Algorithm verification failed: {analysis.aiError}
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

/** Small reusable text section */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div>
			<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</div>
			<div className="text-sm leading-6 text-white/75">{children}</div>
		</div>
	);
}
