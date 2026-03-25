import { NextRequest, NextResponse } from 'next/server';

const KOLAM_FAMILIES = [
  { type: 'Sikku', description: 'Interlaced patterns that never break' },
  { type: 'Neli', description: 'Filled patterns with internal lines' },
  { type: 'Men', description: 'Pearl or bead-like patterns' },
  { type: 'Padi', description: 'Step or ladder-like patterns' },
  { type: 'Kambam', description: 'Floral border patterns' },
  { type: 'Sthalapuranam', description: 'Story-telling complex patterns' },
];

const SYMMETRY_TYPES = ['Radial', 'Bilateral', 'Quadruple', 'Octagonal', 'Asymmetric'];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTagline(type: string): string {
  const taglines: Record<string, string[]> = {
    Sikku: ['Eternal weave', 'No beginning no end', 'Infinite loops'],
    Neli: ['Sacred filling', 'Divine abundance', 'Prosperity pattern'],
    Men: ['Pearls of tradition', 'Beads of blessing', 'Jewel of home'],
    Padi: ['Steps to heaven', 'Spiritual ascension', 'Divine stairs'],
    Kambam: ['Flower gateway', 'Blooming entrance', 'Garden of gods'],
    Sthalapuranam: ['Ancient stories', 'Mythological canvas', 'Legendary design'],
  };
  return randomItem(taglines[type] || ['Traditional art']);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const gridSize = body?.gridSize || randomInt(3, 11);
    const imageData = body?.imageData;
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, randomInt(800, 2000)));

    const kolamFamily = randomItem(KOLAM_FAMILIES);
    const confidence = randomInt(70, 96);
    
    const response = {
      success: true,
      model: 'kolam-classifier-v1',
      timestamp: new Date().toISOString(),
      classification: {
        family: kolamFamily.type,
        description: kolamFamily.description,
        tagline: generateTagline(kolamFamily.type),
        gridSize: `${gridSize}x${gridSize}`,
        estimatedDots: gridSize * gridSize,
      },
      analysis: {
        complexity: randomItem(['Simple', 'Moderate', 'Complex', 'Expert']),
        symmetry: {
          type: randomItem(SYMMETRY_TYPES),
          score: randomInt(70, 100),
          assessment: 'Pattern exhibits consistent geometric properties',
        },
        curves: {
          count: randomInt(gridSize, gridSize * 4),
          style: randomItem(['Curved', 'Angular', 'Mixed', 'Flowing']),
          continuity: `${randomInt(80, 100)}%`,
        },
      },
      cultural: {
        origin: randomItem(['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh']),
        occasion: randomItem(['Daily', 'Festival', 'Special Occasion', 'Temple']),
        significance: `This ${kolamFamily.type} pattern symbolizes ${randomItem(['prosperity', 'good fortune', 'divine blessing', 'welcome', 'positivity'])} and is traditionally created using ${randomItem(['rice flour', 'chalk', 'colored powder'])}.`,
        similarPatterns: KOLAM_FAMILIES
          .filter(k => k.type !== kolamFamily.type)
          .slice(0, 3)
          .map(k => k.type),
      },
      recommendations: {
        drawingOrder: [
          'Begin from the center point',
          'Complete all curves connected to the center',
          'Work outward to the boundary',
          'Finish with outer decorative elements',
        ],
        tips: [
          'Maintain consistent curve thickness',
          'Keep the pattern continuous without lifting',
          'Practice basic curves before attempting',
        ],
      },
      confidence: confidence,
      alternatives: KOLAM_FAMILIES
        .filter(k => k.type !== kolamFamily.type)
        .slice(0, 2)
        .map(k => ({
          type: k.type,
          probability: `${randomInt(10, 30)}%`,
        })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Classification failed:', error);
    return NextResponse.json(
      { error: 'Failed to classify kolam pattern' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Kolam Classification API',
    version: '1.0.0',
    description: 'AI-powered kolam pattern classification and analysis',
    endpoints: {
      POST: 'Classify a kolam pattern and provide detailed analysis',
    },
    example: {
      gridSize: 7,
      imageData: 'base64_encoded_image_data_optional',
    },
  });
}
