import { Header } from '@/components/Header';
import { ImageAnalyzer } from '@/components/ImageAnalyzer';

export default function AnalyzePage() {
	return (
		<div className="flex min-h-screen flex-col bg-[#0a0a0a]">
			<Header
				title="Pattern Analysis"
				subtitle="Sacred Geometry · Image Recognition"
				showBackButton
				backButtonHref="/"
				backButtonText="Return to Studio"
			/>
			<main className="flex-1">
				<ImageAnalyzer />
			</main>
		</div>
	);
}