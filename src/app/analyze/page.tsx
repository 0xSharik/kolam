import { Header } from '@/components/Header';
import { ImageAnalyzer } from '@/components/ImageAnalyzer';

export default function AnalyzePage() {
	return (
		<main className="min-h-screen bg-[var(--background)]">
			<Header
				title="Pattern Analysis"
				subtitle="Upload & Inspect Visual Data"
				showBackButton={true}
				backButtonHref="/"
				backButtonText="Back to Studio"
				className="bg-transparent"
			/>
			<ImageAnalyzer />
		</main>
	);
}
