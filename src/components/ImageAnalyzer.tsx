'use client';

import { analyzeKolamImage, type KolamEngineResult } from '@/utils/kolamImageAnalysis';
import React, { ChangeEvent, useState } from 'react';

const ANALYSIS_PROFILES = [
	{ id: 'heritage-core', name: 'Heritage Core', description: 'Balanced cultural and structural reading.' },
	{ id: 'lattice-pro', name: 'Lattice Pro', description: 'Stronger focus on grid, nodes, and symmetry.' },
	{ id: 'ritual-sense', name: 'Ritual Sense', description: 'More emphasis on context and tradition.' },
];

type AnalysisResult = KolamEngineResult & {
	fileName: string;
	fileType: string;
	fileSizeLabel: string;
	width: number;
	height: number;
	profileName?: string;
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
	const [profileId, setProfileId] = useState(ANALYSIS_PROFILES[0].id);

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		const selectedProfile = ANALYSIS_PROFILES.find((p) => p.id === profileId) || ANALYSIS_PROFILES[0];

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
				profileName: selectedProfile.name,
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
					profile: selectedProfile.name,
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
			<div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

				{/* ── Two-column layout: stacked on mobile, side-by-side on lg ── */}
				<div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]">

					{/* ── LEFT PANEL: Upload + Profiles ── */}
					<div className="flex flex-col gap-4">

						{/* Profile selector */}
						<div className="border border-white/10 bg-[#0d0d0d] p-4 sm:p-5">
							<div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
								Analysis Profile
							</div>
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
								{ANALYSIS_PROFILES.map((profile) => (
									<button
										key={profile.id}
										type="button"
										onClick={() => setProfileId(profile.id)}
										className={`border px-3 py-2.5 text-left transition-colors sm:px-4 sm:py-3 ${profileId === profile.id
												? 'border-[var(--secondary)] bg-[var(--secondary)]/8'
												: 'border-white/10 bg-white/[0.02] hover:border-white/20'
											}`}
									>
										<div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white sm:text-[11px]">
											{profile.name}
										</div>
										<div className="mt-0.5 text-xs text-white/55">{profile.description}</div>
									</button>
								))}
							</div>
						</div>

						{/* Upload area */}
						<div className="border border-white/10 bg-[#0d0d0d] p-4 sm:p-5">
							<label className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-white/20 bg-white/[0.02] px-6 text-center transition-colors hover:border-[var(--secondary)] hover:bg-white/[0.04] sm:min-h-[240px]">
								<div className="headline text-base text-white sm:text-lg">Upload Kolam Image</div>
								<div className="text-xs text-white/50 sm:text-sm">JPG, PNG, or WEBP</div>
								<div className="mt-1 border border-white/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--secondary)] sm:text-[11px]">
									Select File
								</div>
								<input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
							</label>

							{/* Status messages */}
							{isAnalyzing && (
								<div className="mt-3 border border-white/10 bg-white/[0.03] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.24em] text-white/60">
									Running kolam analysis…
								</div>
							)}
							{isAiAnalyzing && (
								<div className="mt-3 border border-[var(--secondary)]/20 bg-[var(--secondary)]/6 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--secondary)]">
									Model is refining the classification…
								</div>
							)}
							{error && (
								<div className="mt-3 border border-[#ff6b6b]/30 bg-[#ff6b6b]/8 px-4 py-2.5 text-sm text-[#ff9c9c]">
									{error}
								</div>
							)}
						</div>

						{/* Image preview */}
						{previewUrl && (
							<div className="overflow-hidden border border-white/10 bg-black">
								<img
									src={previewUrl}
									alt="Uploaded preview"
									className="h-auto max-h-64 w-full object-contain sm:max-h-80"
								/>
							</div>
						)}
					</div>

					{/* ── RIGHT PANEL: Results ── */}
					<div className="border border-white/10 bg-[#111] p-4 sm:p-5 lg:p-6">

						{/* Results header */}
						<div className="mb-5 flex flex-wrap items-start justify-between gap-3">
							<h2 className="headline text-lg text-white sm:text-xl lg:text-2xl">
								{analysis?.aiAnalysis ? 'Model Classification' : 'Kolam Classification'}
							</h2>
							{analysis && (
								<div className="shrink-0 border border-[var(--secondary)]/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--secondary)]">
									{analysis.aiAnalysis ? analysis.aiAnalysis.finalKolamType : analysis.kolamType}
								</div>
							)}
						</div>

						{/* Empty state */}
						{!analysis && (
							<div className="flex min-h-[280px] items-center justify-center border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/35 sm:min-h-[360px]">
								Upload a kolam image to generate model output.
							</div>
						)}

						{/* Loading state */}
						{analysis?.aiStatus === 'loading' && (
							<div className="flex min-h-[200px] items-center justify-center border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-white/40">
								Generating final analysis…
							</div>
						)}

						{/* Error state */}
						{analysis?.aiStatus === 'error' && (
							<div className="border border-[#ff6b6b]/30 bg-[#ff6b6b]/8 p-4 text-sm text-[#ffb3b3]">
								Unable to generate model output right now.
								{analysis.aiError && <div className="mt-2 text-[#ff9c9c]">{analysis.aiError}</div>}
							</div>
						)}

						{/* AI Analysis results */}
						{analysis?.aiAnalysis && (
							<div className="space-y-5">

								{/* Core metrics grid */}
								<div className="border border-[var(--secondary)]/20 bg-[var(--secondary)]/5 p-4 sm:p-5">
									<div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--secondary)]">
										Model Final Analysis · {analysis.profileName}
									</div>
									<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
										{[
											{ label: 'Final Type', value: analysis.aiAnalysis.finalKolamType },
											{ label: 'Region', value: analysis.aiAnalysis.finalRegion },
											{ label: 'Grid', value: analysis.aiAnalysis.finalGrid },
											{ label: 'Nodes', value: String(analysis.aiAnalysis.finalNodes) },
											{ label: 'Confidence', value: analysis.aiAnalysis.confidence },
											{ label: 'Motif', value: analysis.aiAnalysis.motif },
											{ label: 'Complexity', value: analysis.aiAnalysis.complexity },
											{ label: 'Validity', value: analysis.aiAnalysis.validity },
										].map(({ label, value }) => (
											<div key={label}>
												<div className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 sm:text-[10px]">
													{label}
												</div>
												<div className="text-xs text-white sm:text-sm">{value}</div>
											</div>
										))}
									</div>
								</div>

								{/* Assessments */}
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<Section label="Symmetry Assessment">
										{analysis.aiAnalysis.symmetryAssessment}
									</Section>
									<Section label="Structural Assessment">
										{analysis.aiAnalysis.structuralAssessment}
									</Section>
								</div>

								<Section label="Verification">
									{analysis.aiAnalysis.verificationSummary}
								</Section>

								<Section label="Detailed Summary">
									{analysis.aiAnalysis.detailedSummary}
								</Section>

								{/* Cultural context */}
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<Section label="Regional Tradition">
										{analysis.aiAnalysis.culturalContext.regionalTradition}
									</Section>
									<Section label="Ritual Significance">
										{analysis.aiAnalysis.culturalContext.ritualSignificance}
									</Section>
								</div>

								{/* Festivals */}
								{analysis.aiAnalysis.culturalContext.possibleFestivals.length > 0 && (
									<div>
										<div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
											Possible Festivals
										</div>
										<div className="flex flex-wrap gap-2">
											{analysis.aiAnalysis.culturalContext.possibleFestivals.map((f) => (
												<span key={f} className="border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/80">
													{f}
												</span>
											))}
										</div>
									</div>
								)}

								{/* Archive tags */}
								{analysis.aiAnalysis.culturalContext.archivalTags.length > 0 && (
									<div>
										<div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
											Archive Tags
										</div>
										<div className="flex flex-wrap gap-2">
											{analysis.aiAnalysis.culturalContext.archivalTags.map((tag) => (
												<span key={tag} className="border border-white/10 px-2.5 py-1 text-xs text-white/65">
													{tag}
												</span>
											))}
										</div>
									</div>
								)}

								{/* Recreation guide */}
								{analysis.aiAnalysis.recreationGuide.length > 0 && (
									<div>
										<div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
											Recreation Guide
										</div>
										<ol className="space-y-1.5">
											{analysis.aiAnalysis.recreationGuide.map((step, i) => (
												<li key={`${i}-${step}`} className="flex gap-3 text-sm leading-6 text-white/75">
													<span className="shrink-0 font-mono text-[10px] text-white/30 pt-1">{String(i + 1).padStart(2, '0')}</span>
													<span>{step}</span>
												</li>
											))}
										</ol>
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