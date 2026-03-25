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
		const selectedProfile = ANALYSIS_PROFILES.find((profile) => profile.id === profileId) || ANALYSIS_PROFILES[0];

		setError(null);
		setIsAnalyzing(true);

		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}

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
			if (!context) {
				throw new Error('Canvas analysis is not available.');
			}

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

			const base64 = objectUrl.startsWith('blob:')
				? await new Promise<string>((resolve, reject) => {
						const reader = new FileReader();
						reader.onload = () => {
							const result = reader.result;
							if (typeof result !== 'string') {
								reject(new Error('Unable to read image as base64.'));
								return;
							}
							resolve(result.split(',')[1] || '');
						};
						reader.onerror = () => reject(new Error('Unable to read image as base64.'));
						reader.readAsDataURL(file);
				  })
				: '';

			const aiResponse = await fetch('/api/analyze-kolam', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
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
				setAnalysis({
					...baseAnalysis,
					aiStatus: 'error',
					aiError: failure?.error || 'Model analysis failed.',
				});
				return;
			}

			const aiPayload = await aiResponse.json();
			setAnalysis({
				...baseAnalysis,
				aiStatus: 'success',
				aiAnalysis: aiPayload.analysis,
			});
		} catch (analysisError) {
			const message = analysisError instanceof Error ? analysisError.message : 'Analysis failed.';
			setError(message);
			setAnalysis((current) =>
				current
					? {
							...current,
							aiStatus: 'error',
							aiError: message,
					  }
					: null,
			);
		} finally {
			setIsAnalyzing(false);
			setIsAiAnalyzing(false);
			event.target.value = '';
		}
	};

	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-10 pt-28 sm:px-6 lg:px-8">
			<div className="max-w-4xl">
				<h1 className="headline text-3xl tracking-tight text-[var(--secondary)] sm:text-5xl">Kolam Image Analysis</h1>
				<p className="mt-3 max-w-3xl text-sm leading-6 text-white/60 sm:text-base">
					Upload a kolam image to estimate its project-specific structure: probable kolam type, regional tradition,
					node count, grid size, symmetry, continuity, motif, and pattern complexity.
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
				<div className="border border-white/10 bg-[#0d0d0d] p-5 sm:p-6">
					<div className="mb-5">
						<div className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">Analysis Profile</div>
						<div className="grid gap-2">
							{ANALYSIS_PROFILES.map((profile) => (
								<button
									key={profile.id}
									type="button"
									onClick={() => setProfileId(profile.id)}
									className={`border px-4 py-3 text-left transition-colors ${
										profileId === profile.id
											? 'border-[var(--secondary)] bg-[var(--secondary)]/8'
											: 'border-white/10 bg-white/[0.02] hover:border-white/20'
									}`}
								>
									<div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white">{profile.name}</div>
									<div className="mt-1 text-xs text-white/55">{profile.description}</div>
								</button>
							))}
						</div>
					</div>

					<label className="flex min-h-[260px] flex-col items-center justify-center gap-4 border border-dashed border-white/20 bg-white/[0.03] px-6 text-center transition-colors hover:border-[var(--secondary)] hover:bg-white/[0.05]">
						<div className="headline text-lg text-white">Upload Kolam Image</div>
						<div className="text-sm text-white/55">Choose a JPG, PNG, or WEBP file for kolam analysis</div>
						<div className="border border-white/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--secondary)]">
							Select File
						</div>
						<input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
					</label>

					{isAnalyzing && (
						<div className="mt-4 border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.24em] text-white/60">
							Running kolam analysis...
						</div>
					)}

					{isAiAnalyzing && (
						<div className="mt-4 border border-[var(--secondary)]/20 bg-[var(--secondary)]/6 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--secondary)]">
							Analysis model is refining the classification...
						</div>
					)}

					{error && (
						<div className="mt-4 border border-[#ff6b6b]/30 bg-[#ff6b6b]/8 px-4 py-3 text-sm text-[#ff9c9c]">
							{error}
						</div>
					)}

					{previewUrl && (
						<div className="mt-5 overflow-hidden border border-white/10 bg-black">
							<img src={previewUrl} alt="Uploaded preview" className="h-auto w-full object-contain" />
						</div>
					)}
				</div>

				<div className="border border-white/10 bg-[#111] p-5 sm:p-6">
					<div className="mb-5 flex items-center justify-between gap-4">
						<h2 className="headline text-xl text-white sm:text-2xl">
							{analysis?.aiAnalysis ? 'Kolam Model Classification' : 'Kolam Classification'}
						</h2>
						{analysis && (
							<div className="border border-[var(--secondary)]/30 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.26em] text-[var(--secondary)]">
								{analysis.aiAnalysis ? analysis.aiAnalysis.finalKolamType : analysis.kolamType}
							</div>
						)}
					</div>

					{analysis ? (
						<div className="space-y-6">
							{analysis.aiStatus === 'loading' && (
								<div className="flex min-h-[240px] items-center justify-center border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-white/40">
									Generating final analysis...
								</div>
							)}

							{analysis.aiStatus === 'error' && (
								<div className="border border-[#ff6b6b]/30 bg-[#ff6b6b]/8 p-4 text-sm text-[#ffb3b3]">
									Unable to generate model output right now.
									{analysis.aiError && <div className="mt-2">{analysis.aiError}</div>}
								</div>
							)}

							{analysis.aiAnalysis && (
								<div className="border border-[var(--secondary)]/20 bg-[var(--secondary)]/6 p-4 sm:p-5">
									<div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--secondary)]">Model Final Analysis</div>
									<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
										<div>
											<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Profile</div>
											<div className="text-sm text-white">{analysis.profileName}</div>
										</div>
										<div>
											<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Final Type</div>
											<div className="text-sm text-white">{analysis.aiAnalysis.finalKolamType}</div>
										</div>
										<div>
											<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Final Region</div>
											<div className="text-sm text-white">{analysis.aiAnalysis.finalRegion}</div>
										</div>
										<div>
											<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Final Grid</div>
											<div className="text-sm text-white">{analysis.aiAnalysis.finalGrid}</div>
										</div>
										<div>
											<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Final Nodes</div>
											<div className="text-sm text-white">{analysis.aiAnalysis.finalNodes}</div>
										</div>
										<div>
											<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">AI Confidence</div>
											<div className="text-sm text-white">{analysis.aiAnalysis.confidence}</div>
										</div>
										<div>
											<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">AI Motif</div>
											<div className="text-sm text-white">{analysis.aiAnalysis.motif}</div>
										</div>
										<div>
											<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Validity</div>
											<div className="text-sm text-white">{analysis.aiAnalysis.validity}</div>
										</div>
										<div>
											<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Complexity</div>
											<div className="text-sm text-white">{analysis.aiAnalysis.complexity}</div>
										</div>
									</div>
									<div className="mt-4 grid gap-4 xl:grid-cols-2">
										<div>
											<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Symmetry Assessment</div>
											<div className="text-sm leading-6 text-white/75">{analysis.aiAnalysis.symmetryAssessment}</div>
										</div>
										<div>
											<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Structural Assessment</div>
											<div className="text-sm leading-6 text-white/75">{analysis.aiAnalysis.structuralAssessment}</div>
										</div>
									</div>
									<div className="mt-4">
										<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Verification</div>
										<div className="text-sm leading-6 text-white/80">{analysis.aiAnalysis.verificationSummary}</div>
									</div>
									<div className="mt-4">
										<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Detailed Summary</div>
										<div className="text-sm leading-6 text-white/80">{analysis.aiAnalysis.detailedSummary}</div>
									</div>
									<div className="mt-4 grid gap-4 xl:grid-cols-2">
										<div>
											<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Regional Tradition</div>
											<div className="text-sm leading-6 text-white/80">{analysis.aiAnalysis.culturalContext.regionalTradition}</div>
										</div>
										<div>
											<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Ritual Significance</div>
											<div className="text-sm leading-6 text-white/80">{analysis.aiAnalysis.culturalContext.ritualSignificance}</div>
										</div>
									</div>
									{analysis.aiAnalysis.culturalContext.possibleFestivals.length > 0 && (
										<div className="mt-4">
											<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Possible Festivals</div>
											<div className="flex flex-wrap gap-2 text-sm text-white/80">
												{analysis.aiAnalysis.culturalContext.possibleFestivals.map((festival) => (
													<span key={festival} className="border border-white/10 bg-white/[0.04] px-2 py-1">
														{festival}
													</span>
												))}
											</div>
										</div>
									)}
									{analysis.aiAnalysis.culturalContext.archivalTags.length > 0 && (
										<div className="mt-4">
											<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Archive Tags</div>
											<div className="flex flex-wrap gap-2 text-sm text-white/75">
												{analysis.aiAnalysis.culturalContext.archivalTags.map((tag) => (
													<span key={tag} className="border border-white/10 px-2 py-1">
														{tag}
													</span>
												))}
											</div>
										</div>
									)}
									{analysis.aiAnalysis.recreationGuide.length > 0 && (
										<div className="mt-4">
											<div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Recreation Guide</div>
											<div className="space-y-1 text-sm leading-6 text-white/80">
												{analysis.aiAnalysis.recreationGuide.map((step, index) => (
													<div key={`${index}-${step}`}>{step}</div>
												))}
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					) : (
						<div className="flex min-h-[320px] items-center justify-center border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-white/40">
							Upload a kolam image to generate the final model output.
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
