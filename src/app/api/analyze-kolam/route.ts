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

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const responseSchema = {
	type: 'object',
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
			type: 'object',
			properties: {
				regionalTradition: { type: 'string' },
				possibleFestivals: {
					type: 'array',
					items: { type: 'string' },
				},
				ritualSignificance: { type: 'string' },
				archivalTags: {
					type: 'array',
					items: { type: 'string' },
				},
			},
			required: ['regionalTradition', 'possibleFestivals', 'ritualSignificance', 'archivalTags'],
		},
		recreationGuide: {
			type: 'array',
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
		if (!apiKey) {
			return NextResponse.json(
				{ error: 'Missing GEMINI_API_KEY or GOOGLE_API_KEY environment variable.' },
				{ status: 500 },
			);
		}

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
			return NextResponse.json(
				{ error: `Gemini request failed: ${geminiResponse.status} ${errorText}` },
				{ status: 502 },
			);
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
		return NextResponse.json({ error: 'Failed to analyze kolam image with Gemini.' }, { status: 500 });
	}
}
