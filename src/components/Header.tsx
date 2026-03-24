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
	backButtonText = '← Back',
	className = ''
}) => {
	return (
		<header className={`p-8 border-b border-white/5 backdrop-blur-md z-50 ${className}`} style={{ backgroundColor: '#131313' }}>
			<div className="max-w-6xl mx-auto flex flex-col items-center">
				{showBackButton && (
					<div className="self-start mb-4">
						<Link 
							href={backButtonHref}
							className="inline-flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 transition-colors text-white/90 hover:text-white headline text-xs"
						>
							{backButtonText}
						</Link>
					</div>
				)}
				
				<h1 className="text-5xl font-bold text-center tracking-tighter glitch-text headline">
					{title}
				</h1>
				
				{subtitle && (
					<p className="text-center mt-2 text-sm opacity-50 headline tracking-widest uppercase">
						{subtitle}
					</p>
				)}
			</div>
		</header>
	);
};
