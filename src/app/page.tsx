'use client';

import { ImageAnalyzer } from '@/components/ImageAnalyzer';
import { KolamEditor } from '@/components/KolamEditor';
import { NeuralRecovery } from '@/components/NeuralRecovery';
import { useEffect, useState } from 'react';

const navLinks = [
	{ href: '#editor', label: 'Design' },
	{ href: '#analyze', label: 'Analyze' },
	{ href: '#game', label: 'Play' },
];

export default function Home() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 50);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-elegant selection:bg-[var(--primary)] selection:text-[var(--background)]">
			
			{/* Floating Navigation */}
			<header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${scrolled ? 'py-4 translate-y-0' : 'py-6 translate-y-2'}`}>
				<div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 sm:px-12 lg:px-16">
					<div className={`flex items-center gap-3 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)]/80 backdrop-blur-xl px-2.5 py-2.5 transition-all duration-500 ${scrolled ? 'shadow-lg shadow-[var(--primary)]/5 border-[var(--border-medium)]' : ''}`}>
						<div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[var(--primary)] text-[var(--surface)] shadow-inner">
							<svg viewBox="0 0 24 24" className="h-5 w-5">
								<circle cx="12" cy="12" r="3" fill="currentColor" />
								<circle cx="12" cy="5" r="1.5" fill="currentColor" opacity="0.9" />
								<circle cx="12" cy="19" r="1.5" fill="currentColor" opacity="0.9" />
								<circle cx="5" cy="12" r="1.5" fill="currentColor" opacity="0.9" />
								<circle cx="19" cy="12" r="1.5" fill="currentColor" opacity="0.9" />
							</svg>
						</div>
						<span className="pr-4 font-heritage text-base tracking-wide text-[var(--foreground)]">Kolam Studio</span>
					</div>

					<nav className={`hidden sm:flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface)]/80 backdrop-blur-xl p-1.5 transition-all duration-500 ${scrolled ? 'shadow-lg shadow-[var(--primary)]/5 border-[var(--border-medium)]' : ''}`}>
						{navLinks.map((link) => (
							<a
								key={link.href}
								href={link.href}
								className="rounded-sm px-6 py-2.5 font-elegant text-xs uppercase tracking-widest text-[var(--muted)] transition-all hover:bg-[var(--surface-elevated)] hover:text-[var(--primary)] hover:shadow-sm"
							>
								{link.label}
							</a>
						))}
					</nav>
				</div>
			</header>

			<main>
				{/* Minimalist Typographic Hero Section */}
				<section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-32 text-center sm:px-12 lg:min-h-screen">
                    <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at center, var(--primary-light) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
                    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-[var(--gold)]/5 blur-[120px]" />

					<div className="relative z-10 mx-auto max-w-5xl">
						<div className="mb-8 inline-flex items-center gap-3 rounded-md border border-[var(--primary)]/20 bg-[var(--surface-elevated)] px-5 py-2.5 shadow-sm">
							<span className="flex h-2 w-2 rounded-sm bg-[var(--saffron)] animate-pulse shadow-[0_0_8px_var(--saffron)]" />
							<span className="font-elegant text-xs uppercase tracking-[0.2em] text-[var(--primary)]">Generative Art Platform</span>
						</div>

						<h1 className="font-heritage text-6xl leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-7xl lg:text-[7rem]">
							Sacred Geometry <br />
							<span className="text-[var(--primary)] italic opacity-90">Reimagined.</span>
						</h1>

						<p className="mx-auto mt-10 max-w-2xl font-elegant text-base leading-relaxed text-[var(--muted)] sm:text-lg lg:text-xl lg:leading-loose">
							Discover the mathematical beauty of South Indian Kolam patterns. A comprehensive suite to generate, analyze, and interactively restore procedural geometric art.
						</p>

						<div className="mt-14 flex flex-col items-center justify-center gap-5 sm:flex-row">
							<a href="#editor" className="group flex w-full items-center justify-center gap-3 rounded-md bg-[var(--primary)] px-10 py-6 font-elegant text-sm font-semibold uppercase tracking-widest text-[var(--surface)] shadow-lg shadow-[var(--primary)]/20 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--primary)]/30 sm:w-auto">
								Open Studio
								<svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
								</svg>
							</a>
							<a href="#analyze" className="flex w-full items-center justify-center rounded-md border border-[var(--primary)]/30 bg-[var(--surface-elevated)] px-10 py-6 font-elegant text-sm font-semibold uppercase tracking-widest text-[var(--primary)] transition-all hover:bg-[var(--primary)]/5 hover:border-[var(--primary)]/50 sm:w-auto">
								How it works
							</a>
						</div>
					</div>
				</section>

                <div className="h-4 w-full border-t border-[var(--border-subtle)] bg-[var(--surface)]"></div>

				{/* Section 01: Editor */}
				<section id="editor" className="scroll-mt-32 px-6 py-20 sm:px-12 lg:px-16 bg-[var(--background)]">
					<div className="mx-auto max-w-[1400px]">
                        <div className="mb-16 flex flex-col gap-6 lg:mb-20 lg:flex-row lg:items-end lg:justify-between border-b-2 border-[var(--foreground)] pb-8">
                            <h2 className="font-heritage text-6xl text-[var(--foreground)] sm:text-7xl lg:text-8xl">Kolam Editor</h2>
                            <p className="max-w-md font-elegant text-sm leading-relaxed text-[var(--muted)] lg:text-right">
                                Parametric generation tools for creating complex interwoven curves. Fully animated and highly customizable.
                            </p>
                        </div>
						
			{/* Seamless Component Integration */}
						<div className="mt-8 lg:mt-0">
							<KolamEditor compactHeader />
						</div>
					</div>
				</section>

                <div className="h-4 w-full border-t border-[var(--border-subtle)] bg-[var(--surface-elevated)]"></div>

				{/* Section 02: Analyzer */}
				<section id="analyze" className="scroll-mt-32 px-6 py-20 sm:px-12 lg:px-16 bg-[var(--surface)]">
					<div className="mx-auto max-w-[1400px]">
                        <div className="mb-16 flex flex-col gap-6 lg:mb-20 lg:flex-row lg:items-end lg:justify-between border-b-2 border-[var(--foreground)] pb-8">
                            <h2 className="font-heritage text-6xl text-[var(--foreground)] sm:text-7xl lg:text-8xl">Image Analyzer</h2>
                            <p className="max-w-md font-elegant text-sm leading-relaxed text-[var(--muted)] lg:text-right">
                                Upload and inspect images using simulated computer vision. Understand regional traditions and structural continuity.
                            </p>
                        </div>

						{/* Seamless Component Integration */}
						<div className="mt-8 lg:mt-0">
							<ImageAnalyzer />
						</div>
					</div>
				</section>

                {/* Elegant Full-Width Divider */}
                <div className="flex w-full items-center justify-center py-8 opacity-30">
                    <div className="h-px w-full max-w-[400px] bg-gradient-to-r from-transparent via-[var(--temple-red)] to-transparent"></div>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--temple-red)" strokeWidth="1" className="mx-4 shrink-0">
                        <circle cx="20" cy="20" r="15" strokeDasharray="4 4" />
                        <circle cx="20" cy="20" r="8" />
                        <circle cx="20" cy="20" r="2" fill="var(--temple-red)" />
                    </svg>
                    <div className="h-px w-full max-w-[400px] bg-gradient-to-r from-[var(--temple-red)] via-transparent to-transparent"></div>
                </div>

				{/* Section 03: Game */}
				<section id="game" className="scroll-mt-32 px-6 pb-32 pt-20 sm:px-12 lg:px-16 bg-[var(--background)]">
					<div className="mx-auto max-w-[1400px]">
                        <div className="mb-16 flex flex-col gap-6 lg:mb-20 lg:flex-row lg:items-end lg:justify-between border-b-2 border-[var(--foreground)] pb-8">
                            <h2 className="font-heritage text-6xl text-[var(--foreground)] sm:text-7xl lg:text-8xl">Neural Recovery</h2>
                            <p className="max-w-md font-elegant text-sm leading-relaxed text-[var(--muted)] lg:text-right">
                                An interactive restoration experience. Repair broken patterns by correctly identifying missing nodes in the grid.
                            </p>
                        </div>

						{/* Seamless Component Integration */}
						<div className="mt-8 lg:mt-0">
							<NeuralRecovery />
						</div>
					</div>
				</section>
			</main>

			<footer className="mt-12 bg-[var(--obsidian)] px-8 py-20 text-[var(--warm-white)] lg:px-16">
				<div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-16 lg:flex-row">
					<div className="max-w-md">
						<div className="flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--gold)]/20 border border-[var(--gold)]/30">
								<svg viewBox="0 0 24 24" className="h-6 w-6 text-[var(--gold)]">
									<circle cx="12" cy="12" r="3" fill="currentColor" />
									<circle cx="12" cy="5" r="1.5" fill="currentColor" opacity="0.8" />
									<circle cx="12" cy="19" r="1.5" fill="currentColor" opacity="0.8" />
									<circle cx="5" cy="12" r="1.5" fill="currentColor" opacity="0.8" />
									<circle cx="19" cy="12" r="1.5" fill="currentColor" opacity="0.8" />
								</svg>
							</div>
							<span className="font-heritage text-3xl">Kolam Studio</span>
						</div>
						<p className="mt-8 font-elegant text-sm leading-relaxed text-[var(--warm-white)]/60">
							Bridging ancient South Indian mathematical traditions with modern web technologies. A generative art project dedicated to preserving cultural heritage through code.
						</p>
					</div>

					<div className="grid grid-cols-2 gap-16 font-elegant lg:gap-24">
						<div>
							<h4 className="mb-6 text-xs uppercase tracking-[0.2em] text-[var(--warm-white)]/40">Platform</h4>
							<ul className="flex flex-col gap-4 text-sm text-[var(--warm-white)]/80">
								<li><a href="#editor" className="transition-all hover:text-[var(--gold)] hover:translate-x-1 inline-block">Design Studio</a></li>
								<li><a href="#analyze" className="transition-all hover:text-[var(--gold)] hover:translate-x-1 inline-block">Image Analyzer</a></li>
								<li><a href="#game" className="transition-all hover:text-[var(--gold)] hover:translate-x-1 inline-block">Pattern Recovery</a></li>
							</ul>
						</div>
						<div>
							<h4 className="mb-6 text-xs uppercase tracking-[0.2em] text-[var(--warm-white)]/40">Connect</h4>
							<ul className="flex flex-col gap-4 text-sm text-[var(--warm-white)]/80">
								<li><a href="https://github.com/crazzygamerr/zen-kolam" target="_blank" rel="noreferrer" className="transition-all hover:text-[var(--gold)] hover:translate-x-1 inline-block">GitHub Repository</a></li>
								<li><a href="https://www.linkedin.com/in/rishi-balamurugan/" target="_blank" rel="noreferrer" className="transition-all hover:text-[var(--gold)] hover:translate-x-1 inline-block">LinkedIn Profile</a></li>
							</ul>
						</div>
					</div>
				</div>

				<div className="mx-auto mt-20 max-w-[1400px] border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 font-elegant text-xs text-[var(--warm-white)]/40">
					<p>&copy; {new Date().getFullYear()} Kolam Heritage Project. All rights reserved.</p>
					<p className="tracking-widest uppercase">Sacred Mathematics</p>
				</div>
			</footer>
		</div>
	);
}

