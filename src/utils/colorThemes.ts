// Predefined color themes for Kolam patterns
// Each theme has 10 highly distinguishable colors

export interface ColorTheme {
	id: string;
	name: string;
	colors: string[];
	dotColor: string; // Base dot color
}

export const COLOR_THEMES: ColorTheme[] = [
	{
		id: 'vibrant',
		name: 'Vibrant',
		colors: [
			'#FF3B30', // Red
			'#FF9500', // Orange
			'#FFCC00', // Yellow
			'#34C759', // Green
			'#007AFF', // Blue
			'#AF52DE', // Purple
			'#FF2D55', // Pink
			'#5AC8FA', // Cyan
			'#FF6B35', // Tangerine
			'#32D74B', // Lime
		],
		dotColor: '#ffffff',
	},
	{
		id: 'heritage',
		name: 'Heritage',
		colors: [
			'#C9A227', // Gold
			'#E07020', // Saffron
			'#8B1A1A', // Temple Red
			'#2E8B57', // Sea Green
			'#CD853F', // Peru
			'#6A5ACD', // Slate Blue
			'#DAA520', // Goldenrod
			'#B22222', // Firebrick
			'#20B2AA', // Light Sea Green
			'#D2691E', // Chocolate
		],
		dotColor: '#F5EFE6',
	},
	{
		id: 'ocean',
		name: 'Ocean',
		colors: [
			'#0077B6', // Dark Blue
			'#00B4D8', // Teal
			'#90E0EF', // Light Cyan
			'#CAF0F8', // Pale Cyan
			'#48CAE4', // Sky Blue
			'#023E8A', // Navy
			'#0096C7', // Cerulean
			'#ADE8F4', // Ice Blue
			'#03045E', // Deep Navy
			'#00A8E8', // Azure
		],
		dotColor: '#E0F7FA',
	},
	{
		id: 'sunset',
		name: 'Sunset',
		colors: [
			'#FF6B6B', // Coral
			'#FFA07A', // Light Salmon
			'#FFD93D', // Sunflower
			'#FF8C42', // Deep Orange
			'#C74B50', // Crimson
			'#FF5E78', // Watermelon
			'#FFB347', // Pastel Orange
			'#FF4365', // Radical Red
			'#FDCB6E', // Mustard
			'#E17055', // Burnt Orange
		],
		dotColor: '#FFF5E6',
	},
	{
		id: 'neon',
		name: 'Neon',
		colors: [
			'#39FF14', // Neon Green
			'#FF073A', // Neon Red
			'#00FFFF', // Cyan
			'#FF00FF', // Magenta
			'#FFFF00', // Yellow
			'#FF6600', // Neon Orange
			'#7B68EE', // Medium Slate
			'#00FF7F', // Spring Green
			'#FF1493', // Deep Pink
			'#00CED1', // Dark Turquoise
		],
		dotColor: '#ffffff',
	},
	{
		id: 'earth',
		name: 'Earth',
		colors: [
			'#8B4513', // Saddle Brown
			'#556B2F', // Dark Olive
			'#BC8F8F', // Rosy Brown
			'#2F4F4F', // Dark Slate
			'#D2691E', // Chocolate
			'#6B8E23', // Olive Drab
			'#A0522D', // Sienna
			'#708090', // Slate Gray
			'#8FBC8F', // Dark Sea Green
			'#B8860B', // Dark Goldenrod
		],
		dotColor: '#F5F5DC',
	},
	{
		id: 'mono',
		name: 'Classic',
		colors: [
			'#C9A227', // Single gold - all same color
			'#C9A227',
			'#C9A227',
			'#C9A227',
			'#C9A227',
			'#C9A227',
			'#C9A227',
			'#C9A227',
			'#C9A227',
			'#C9A227',
		],
		dotColor: '#ffffff',
	},
];

export const getThemeById = (id: string): ColorTheme => {
	return COLOR_THEMES.find(t => t.id === id) || COLOR_THEMES[0];
};

export const DEFAULT_THEME_ID = 'vibrant';
