import { Header } from '@/components/Header';
import { ImageAnalyzer } from '@/components/ImageAnalyzer';

export default function AnalyzePage() {
	return (
		<main className="min-h-screen bg-[#0e0e0e]">
			<div className="absolute top-0 w-full">
				<Header
					title="Image Intelligence"
					subtitle="Upload And Inspect Visual Data"
					showBackButton={true}
					backButtonHref="/"
					backButtonText="Back To Home"
					className="bg-transparent backdrop-blur-none"
				/>
			</div>
			<ImageAnalyzer />
		</main>
	);
}
