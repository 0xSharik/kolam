import { KolamEditor } from '@/components/KolamEditor';
import { HeritageLoader } from '@/components/HeritageLoader';
import { Suspense } from 'react';

export default function HeadacheKolamPage() {
	return (
		<main className="min-h-screen w-full bg-[var(--background)] relative text-[var(--foreground)]">
			<Suspense fallback={
				<div className="h-screen w-full flex items-center justify-center bg-[var(--background)]">
					<HeritageLoader message="Awakening the Grid..." size="lg" />
				</div>
			}>
				<KolamEditor />
			</Suspense>
		</main>
	);
}
