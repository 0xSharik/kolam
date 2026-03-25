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
			className={`heritage-border-top relative border-b border-[var(--border-subtle)] bg-[var(--surface)]/80 backdrop-blur-md ${className}`}
		>
			<div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

				{/* Back button — inside the padded container, aligned left */}
				{showBackButton && (
					<div className="mb-5">
						<Link
							href={backButtonHref}
							className="inline-flex items-center gap-2 rounded border border-[var(--gold)]/30 bg-[var(--gold)]/5 px-4 py-2 font-elegant text-sm text-[var(--gold)] transition-all hover:bg-[var(--gold)]/15 hover:border-[var(--gold)]/50"
						>
							<svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
							</svg>
							{backButtonText}
						</Link>
					</div>
				)}

				{/* Title block — centred */}
				<div className="text-center">
					<h1 className="font-heritage text-3xl font-medium tracking-wide text-[var(--ivory)] sm:text-4xl lg:text-5xl xl:text-6xl">
						{title}
					</h1>
					{subtitle && (
						<p className="mt-3 font-elegant text-xs uppercase tracking-[0.35em] text-[var(--muted)] sm:text-sm">
							{subtitle}
						</p>
					)}
				</div>
			</div>

			{/* Decorative bottom-centre diamond */}
			<div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
				<div className="flex items-center gap-2">
					<div className="h-px w-6 bg-gradient-to-r from-transparent to-[var(--gold)]/50" />
					<div className="h-1.5 w-1.5 rotate-45 border border-[var(--gold)]/50 bg-[var(--surface)]" />
					<div className="h-px w-6 bg-gradient-to-l from-transparent to-[var(--gold)]/50" />
				</div>
			</div>
		</header>
	);
};