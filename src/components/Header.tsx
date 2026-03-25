import Link from 'next/link';

interface HeaderProps {
	title: string;
	subtitle?: string;
	showBackButton?: boolean;
	backButtonHref?: string;
	backButtonText?: string;
	className?: string;
}

export const Header: React.FC<HeaderProps> = ({
	title,
	subtitle,
	showBackButton = false,
	backButtonHref = '/',
	backButtonText = '← Return',
	className = '',
}) => {
	return (
		<header
			className={`heritage-border-top relative z-50 border-b border-[var(--border-subtle)] bg-[var(--surface)]/80 backdrop-blur-md px-6 py-8 ${className}`}
		>
			<div className="mx-auto flex w-full max-w-6xl flex-col items-center">
				{showBackButton && (
					<div className="mb-6 self-start">
						<Link
							href={backButtonHref}
							className="inline-flex items-center gap-2 rounded border border-[var(--gold)]/30 bg-[var(--gold)]/5 px-5 py-2.5 font-elegant text-sm text-[var(--gold)] transition-all hover:bg-[var(--gold)]/15 hover:border-[var(--gold)]/50"
						>
							<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
							</svg>
							{backButtonText}
						</Link>
					</div>
				)}

				<div className="text-center">
					<h1 className="font-heritage text-4xl font-medium tracking-wide text-[var(--ivory)] sm:text-5xl lg:text-6xl">
						{title}
					</h1>

					{subtitle && (
						<p className="mt-3 font-elegant text-sm uppercase tracking-[0.35em] text-[var(--muted)]">
							{subtitle}
						</p>
					)}
				</div>
			</div>
			
			{/* Decorative bottom line */}
			<div className="absolute bottom-0 left-1/2 -translate-x-1/2">
				<div className="flex items-center gap-3">
					<div className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--gold)]/50"></div>
					<div className="h-1.5 w-1.5 rotate-45 border border-[var(--gold)]/50"></div>
					<div className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--gold)]/50"></div>
				</div>
			</div>
		</header>
	);
};
