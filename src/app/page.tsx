import { Header } from '@/components/Header';
import { KolamEditor } from '@/components/KolamEditor';
import { Suspense } from 'react';

export default function HeadacheKolamPage() {
	return (
		<main className="min-h-screen chaos-mode flex flex-col">
			<div className="scanlines" />
			<Header 
				title="HEADACHE" 
				subtitle="Digital Kolam Installation // V1.0"
			/>
			<div className="flex-1 flex flex-col">
				<Suspense fallback={<div className="p-20 text-center headline animate-pulse">Initializing Neural Grid...</div>}>
					<KolamEditor />
				</Suspense>
			</div>
			
			<footer className="p-8 flex justify-center items-center border-t border-white/5 text-[10px] font-mono opacity-30 uppercase tracking-widest bg-[#131313]">
				<div>© 2026 HEADACHE INSTALLATION LABS</div>
			</footer>
		</main>
	);
}
