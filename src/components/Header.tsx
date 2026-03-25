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
			className={`heritage-border-top z-50 border-b border-[var(--gold)]/15 px-4 py-5 backdrop-blur-md sm:px-6 sm:py-6 lg:px-8 ${className}`}
			style={{ backgroundColor: 'rgba(26, 15, 10, 0.9)' }}
		>
			<div className="mx-auto flex w-full max-w-7xl flex-col items-center">
				{showBackButton && (
					<div className="mb-4 self-start">
						<Link
							href={backButtonHref}
							className="inline-flex items-center border border-[var(--gold)]/20 bg-[var(--gold)]/5 px-4 py-2 font-mono text-[11px] tracking-[0.24em] text-[var(--gold)] transition-colors hover:bg-[var(--gold)]/10 hover:text-[var(--warm-white)]"
						>
							{backButtonText}
						</Link>
					</div>
				)}

				<h1 className="font-heritage text-center text-3xl font-bold tracking-wide sm:text-4xl lg:text-5xl text-[var(--ivory)]">
					{title}
				</h1>

				{subtitle && (
					<p className="mt-2 text-center font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--gold)] opacity-60 sm:text-xs">
						{subtitle}
					</p>
				)}
			</div>
		</header>
	);
};
