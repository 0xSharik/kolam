import { NextRequest, NextResponse } from 'next/server';

type EnginePayload = {
	kolamType: string;
	probableRegion: string;
	confidence: string;
	estimatedNodes: number;
	estimatedGrid: string;
	symmetry: string;
	horizontalSymmetry: string;
	verticalSymmetry: string;
	continuity: string;
	strokeDensity: string;
	dotVisibility: string;
	activeRegion: string;
	motif: string;
	complexity: string;
	notes: string[];
};

const KOLAM_TYPES = ['Sikku Kolam', 'Neli Kolam', 'Menkolam', 'Sthalapuranam', 'Kambam Kolam', 'Padi Kolam'];
const REGIONS = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh'];
const MOTIFS = ['Peacock', 'Lotus', 'Fish', 'Coconut', 'Temple', 'Mountain', 'Swastika', 'Mandala'];

function randomItem<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMockAnalysis(engine: EnginePayload) {
	const kolamType = engine?.kolamType || randomItem(KOLAM_TYPES);
	const gridMatch = engine?.estimatedGrid?.match(/(\d+)/);
	const gridSize = gridMatch ? parseInt(gridMatch[1]) : randomInt(3, 9);
	
	return {
		finalKolamType: kolamType,
		finalRegion: engine?.probableRegion || randomItem(REGIONS),
		finalGrid: `${gridSize}x${gridSize}`,
		finalNodes: engine?.estimatedNodes || gridSize * gridSize,
		confidence: engine?.confidence || `${randomInt(65, 90)}%`,
		motif: engine?.motif || randomItem(MOTIFS),
		complexity: engine?.complexity || randomItem(['Simple', 'Moderate', 'Complex']),
		validity: 'Valid',
		verificationSummary: `The pattern appears to be a ${kolamType} with ${gridSize}x${gridSize} grid structure. The estimated ${engine?.estimatedNodes || gridSize * gridSize} nodes are consistent with the pattern complexity.`,
		symmetryAssessment: `The pattern shows ${engine?.symmetry || 'bilateral'} symmetry with ${engine?.horizontalSymmetry || 'strong'} horizontal and ${engine?.verticalSymmetry || 'strong'} vertical alignment.`,
		structuralAssessment: `Continuous curves with ${engine?.continuity || '90-95%'} continuity. Stroke density is ${engine?.strokeDensity || 'medium'} throughout the pattern.`,
		culturalContext: {
			regionalTradition: engine?.probableRegion || randomItem(REGIONS),
			possibleFestivals: ['Diwali', 'Pongal', 'Navratri', 'Tamil New Year'].slice(0, randomInt(1, 3)),
			ritualSignificance: `${kolamType} is traditionally drawn at entrances to invite prosperity and ward off negative energies.`,
			archivalTags: ['traditional', 'geometric', 'sacred', 'daily-routine'],
		},
		recreationGuide: [
			'Start from the center dot',
			'Draw the main axis curves first',
			'Complete the inner patterns',
			'Finish with outer decorative curves',
			'Ensure all curves are continuous',
		],
		detailedSummary: `This ${kolamType} from ${engine?.probableRegion || 'Tamil Nadu'} tradition represents ${randomItem(['prosperity', 'divine blessing', 'welcome', 'positivity'])}. The ${gridSize}x${gridSize} grid contains approximately ${gridSize * gridSize} dots with interlocking curves that create a harmonious pattern.`,
	};
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

const responseSchema = {
	type: 'object' as const,
	properties: {
		finalKolamType: { type: 'string' },
		finalRegion: { type: 'string' },
		finalGrid: { type: 'string' },
		finalNodes: { type: 'integer' },
		confidence: { type: 'string' },
		motif: { type: 'string' },
		complexity: { type: 'string' },
		validity: { type: 'string' },
		verificationSummary: { type: 'string' },
		symmetryAssessment: { type: 'string' },
		structuralAssessment: { type: 'string' },
		culturalContext: {
			type: 'object' as const,
			properties: {
				regionalTradition: { type: 'string' },
				possibleFestivals: {
					type: 'array' as const,
					items: { type: 'string' },
				},
				ritualSignificance: { type: 'string' },
				archivalTags: {
					type: 'array' as const,
					items: { type: 'string' },
				},
			},
			required: ['regionalTradition', 'possibleFestivals', 'ritualSignificance', 'archivalTags'],
		},
		recreationGuide: {
			type: 'array' as const,
			items: { type: 'string' },
		},
		detailedSummary: { type: 'string' },
	},
	required: [
		'finalKolamType',
		'finalRegion',
		'finalGrid',
		'finalNodes',
		'confidence',
		'motif',
		'complexity',
		'validity',
		'verificationSummary',
		'symmetryAssessment',
		'structuralAssessment',
		'culturalContext',
		'recreationGuide',
		'detailedSummary',
	],
};

export async function POST(request: NextRequest) {
	try {
		const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
		
		const body = await request.json();
		const imageBase64 = body?.imageBase64 as string | undefined;
		const mimeType = body?.mimeType as string | undefined;
		const engine = body?.engine as EnginePayload | undefined;
		const fileName = body?.fileName as string | undefined;
		const profile = body?.profile as string | undefined;

		if (!imageBase64 || !mimeType || !engine) {
			return NextResponse.json(
				{ error: 'imageBase64, mimeType, and engine payload are required.' },
				{ status: 400 },
			);
		}

		// If no API key, return mock analysis
		if (!apiKey) {
			console.log('No API key found, returning mock analysis');
			return NextResponse.json({ 
				analysis: generateMockAnalysis(engine),
				mock: true,
				message: 'Using mock analysis - add GEMINI_API_KEY for real AI analysis'
			});
		}

		const prompt = [
			'You are analyzing a South Indian kolam image for a specialized kolam-design project.',
			'Use the uploaded image as the primary source of truth and use the provided computer-vision engine output as supporting evidence, not unquestioned fact.',
			'Your task is to correct weak estimates and return the most plausible final structured classification.',
			'Focus on:',
			'1. kolam type',
			'2. probable regional tradition',
			'3. final grid size',
			'4. final node count',
			'5. motif and complexity',
			'6. whether the engine likely undercounted or overcounted',
			'7. whether the structure appears mathematically valid or only partially valid',
			'8. cultural context including likely regional tradition and relevant festivals if plausible',
			'9. a concise but detailed structural summary',
			'10. a short step-by-step recreation guide for drawing the kolam',
			profile ? `Selected analysis profile: ${profile}` : '',
			'Engine output:',
			JSON.stringify(engine, null, 2),
			fileName ? `Uploaded file name: ${fileName}` : '',
			'Return only valid JSON matching the provided schema.',
		]
			.filter(Boolean)
			.join('\n');

		const geminiResponse = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-goog-api-key': apiKey,
				},
				body: JSON.stringify({
					contents: [
						{
							parts: [
								{ text: prompt },
								{
									inline_data: {
										mime_type: mimeType,
										data: imageBase64,
									},
								},
							],
						},
					],
					generationConfig: {
						responseMimeType: 'application/json',
						responseSchema,
					},
				}),
			},
		);

		if (!geminiResponse.ok) {
			const errorText = await geminiResponse.text();
			console.error('Gemini API error:', geminiResponse.status, errorText);
			
			// Return mock analysis on API failure
			return NextResponse.json({ 
				analysis: generateMockAnalysis(engine),
				mock: true,
				message: `API returned error - using mock analysis: ${geminiResponse.status}`
			});
		}

		const raw = await geminiResponse.json();
		const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text;
		if (!text) {
			return NextResponse.json({ error: 'Gemini returned no text payload.' }, { status: 502 });
		}

		let parsed;
		try {
			parsed = JSON.parse(text);
		} catch {
			return NextResponse.json({ error: 'Gemini returned invalid JSON.' }, { status: 502 });
		}

		return NextResponse.json({ analysis: parsed });
	} catch (error) {
		console.error('Gemini kolam analysis failed:', error);
		
		// Return error message but don't crash
		return NextResponse.json(
			{ 
				error: 'Analysis service temporarily unavailable.',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 503 }
		);
	}
}
