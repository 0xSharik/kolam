export type KolamEngineResult = {
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

type Component = {
	area: number;
	width: number;
	height: number;
	fillRatio: number;
	centerX: number;
	centerY: number;
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
	holeCount: number;
	perimeter: number;
	pixels: number[];
};

type BinaryPassResult = {
	mask: Uint8Array;
	components: Component[];
	nodeCandidates: Component[];
	strokeComponents: Component[];
	strokeDensity: number;
	symmetryX: number;
	symmetryY: number;
	symmetry: number;
	continuity: number;
	activeRegion: string;
	score: number;
	mode: 'dark' | 'light';
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const asPercent = (value: number) => `${Math.round(clamp(value, 0, 1) * 100)}%`;

const getRegionLabel = (index: number) => {
	const labels = [
		'Top Left',
		'Top Center',
		'Top Right',
		'Middle Left',
		'Center',
		'Middle Right',
		'Bottom Left',
		'Bottom Center',
		'Bottom Right',
	];
	return labels[index] || 'Center';
};

const average = (values: number[]) => {
	if (!values.length) return 0;
	return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const stdDev = (values: number[], mean: number) => {
	if (!values.length) return 0;
	const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
	return Math.sqrt(variance);
};

const clusterPositions = (values: number[], tolerance: number) => {
	if (!values.length) return [];
	const sorted = [...values].sort((a, b) => a - b);
	const clusters: number[] = [sorted[0]];

	for (let i = 1; i < sorted.length; i++) {
		const value = sorted[i];
		const last = clusters[clusters.length - 1];
		if (Math.abs(value - last) <= tolerance) {
			clusters[clusters.length - 1] = (last + value) / 2;
		} else {
			clusters.push(value);
		}
	}

	return clusters;
};

const countHoles = (component: Component) => {
	const width = component.width;
	const height = component.height;
	const local = new Uint8Array(width * height);

	component.pixels.forEach((globalIndex) => {
		const x = globalIndex % 1000000;
		const y = Math.floor(globalIndex / 1000000);
		const localX = x - component.minX;
		const localY = y - component.minY;
		local[localY * width + localX] = 1;
	});

	const visited = new Uint8Array(width * height);
	const queue: number[] = [];

	for (let x = 0; x < width; x++) {
		queue.push(x);
		queue.push((height - 1) * width + x);
	}
	for (let y = 1; y < height - 1; y++) {
		queue.push(y * width);
		queue.push(y * width + (width - 1));
	}

	for (let i = 0; i < queue.length; i++) {
		const index = queue[i];
		if (index < 0 || index >= local.length || visited[index] || local[index]) continue;
		visited[index] = 1;
		const x = index % width;
		const y = Math.floor(index / width);
		if (x > 0) queue.push(index - 1);
		if (x < width - 1) queue.push(index + 1);
		if (y > 0) queue.push(index - width);
		if (y < height - 1) queue.push(index + width);
	}

	let holes = 0;
	for (let index = 0; index < local.length; index++) {
		if (local[index] || visited[index]) continue;
		holes += 1;
		const flood = [index];
		visited[index] = 1;
		for (let i = 0; i < flood.length; i++) {
			const current = flood[i];
			const x = current % width;
			const y = Math.floor(current / width);
			const neighbors = [];
			if (x > 0) neighbors.push(current - 1);
			if (x < width - 1) neighbors.push(current + 1);
			if (y > 0) neighbors.push(current - width);
			if (y < height - 1) neighbors.push(current + width);
			for (const next of neighbors) {
				if (!local[next] && !visited[next]) {
					visited[next] = 1;
					flood.push(next);
				}
			}
		}
	}

	return holes;
};

const collectComponents = (mask: Uint8Array, width: number, height: number) => {
	const visited = new Uint8Array(mask.length);
	const components: Component[] = [];
	const directions = [
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1],
	];

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const start = y * width + x;
			if (!mask[start] || visited[start]) continue;

			const queue = [start];
			visited[start] = 1;

			let area = 0;
			let perimeter = 0;
			let minX = x;
			let maxX = x;
			let minY = y;
			let maxY = y;
			let sumX = 0;
			let sumY = 0;
			const pixels: number[] = [];

			for (let i = 0; i < queue.length; i++) {
				const index = queue[i];
				const currentX = index % width;
				const currentY = Math.floor(index / width);
				area += 1;
				sumX += currentX;
				sumY += currentY;
				minX = Math.min(minX, currentX);
				maxX = Math.max(maxX, currentX);
				minY = Math.min(minY, currentY);
				maxY = Math.max(maxY, currentY);
				pixels.push(currentY * 1000000 + currentX);

				for (const [dx, dy] of directions) {
					const nextX = currentX + dx;
					const nextY = currentY + dy;
					if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) {
						perimeter += 1;
						continue;
					}

					const nextIndex = nextY * width + nextX;
					if (!mask[nextIndex]) {
						perimeter += 1;
						continue;
					}

					if (!visited[nextIndex]) {
						visited[nextIndex] = 1;
						queue.push(nextIndex);
					}
				}
			}

			const component: Component = {
				area,
				width: maxX - minX + 1,
				height: maxY - minY + 1,
				fillRatio: area / ((maxX - minX + 1) * (maxY - minY + 1)),
				centerX: sumX / area,
				centerY: sumY / area,
				minX,
				maxX,
				minY,
				maxY,
				holeCount: 0,
				perimeter,
				pixels,
			};

			component.holeCount = countHoles(component);
			components.push(component);
		}
	}

	return components;
};

const estimateBackground = (data: Uint8ClampedArray, width: number, height: number) => {
	const borderSamples: number[] = [];
	const borderColors: [number, number, number][] = [];
	const step = Math.max(1, Math.floor(Math.min(width, height) / 40));

	for (let x = 0; x < width; x += step) {
		for (const y of [0, height - 1]) {
			const index = (y * width + x) * 4;
			borderColors.push([data[index], data[index + 1], data[index + 2]]);
		}
	}
	for (let y = 0; y < height; y += step) {
		for (const x of [0, width - 1]) {
			const index = (y * width + x) * 4;
			borderColors.push([data[index], data[index + 1], data[index + 2]]);
		}
	}

	const bgR = average(borderColors.map((value) => value[0]));
	const bgG = average(borderColors.map((value) => value[1]));
	const bgB = average(borderColors.map((value) => value[2]));

	for (let i = 0; i < borderColors.length; i++) {
		const [r, g, b] = borderColors[i];
		borderSamples.push(Math.sqrt(Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)));
	}

	return {
		r: bgR,
		g: bgG,
		b: bgB,
		distanceMean: average(borderSamples),
		distanceStd: stdDev(borderSamples, average(borderSamples)),
	};
};

const buildMaskFromMode = (
	data: Uint8ClampedArray,
	width: number,
	height: number,
	mode: 'dark' | 'light',
	brightnessValues: number[],
	meanBrightness: number,
	brightnessStd: number,
) => {
	const background = estimateBackground(data, width, height);
	const mask = new Uint8Array(width * height);
	const distanceThreshold = background.distanceMean + Math.max(18, background.distanceStd * 3.2);
	const brightnessOffset = Math.max(12, brightnessStd * 0.35);

	for (let i = 0; i < width * height; i++) {
		const dataIndex = i * 4;
		const r = data[dataIndex];
		const g = data[dataIndex + 1];
		const b = data[dataIndex + 2];
		const brightness = brightnessValues[i];

		const colorDistance = Math.sqrt(
			Math.pow(r - background.r, 2) + Math.pow(g - background.g, 2) + Math.pow(b - background.b, 2),
		);

		const brightnessCondition =
			mode === 'dark'
				? brightness < meanBrightness - brightnessOffset
				: brightness > meanBrightness + brightnessOffset;

		if (colorDistance > distanceThreshold || brightnessCondition) {
			mask[i] = 1;
		}
	}

	return mask;
};

const analyzePass = (
	mask: Uint8Array,
	width: number,
	height: number,
	mode: 'dark' | 'light',
): BinaryPassResult => {
	const components = collectComponents(mask, width, height).filter((component) => component.area >= 3);
	const inkPixels = mask.reduce((sum, value) => sum + value, 0);
	const strokeDensity = inkPixels / (width * height);

	const nodeCandidates = components.filter((component) => {
		const compactness = Math.min(component.width, component.height) / Math.max(component.width, component.height || 1);
		const circularity =
			component.perimeter > 0 ? (4 * Math.PI * component.area) / (component.perimeter * component.perimeter) : 0;

		return (
			component.area >= 8 &&
			component.area <= Math.max(360, Math.round(width * height * 0.008)) &&
			component.width <= width * 0.12 &&
			component.height <= height * 0.12 &&
			compactness > 0.62 &&
			circularity > 0.18 &&
			(component.holeCount >= 1 || component.fillRatio < 0.58)
		);
	});

	const nodeSet = new Set(nodeCandidates);
	const strokeComponents = components.filter((component) => !nodeSet.has(component));
	const totalStrokeArea = strokeComponents.reduce((sum, component) => sum + component.area, 0);
	const largestStrokeArea = strokeComponents.reduce((max, component) => Math.max(max, component.area), 0);
	const continuity = totalStrokeArea > 0 ? largestStrokeArea / totalStrokeArea : 0;

	let symmetryXMatches = 0;
	let symmetryYMatches = 0;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const index = y * width + x;
			const mirrorX = y * width + (width - 1 - x);
			const mirrorY = (height - 1 - y) * width + x;
			if (mask[index] === mask[mirrorX]) symmetryXMatches += 1;
			if (mask[index] === mask[mirrorY]) symmetryYMatches += 1;
		}
	}

	const symmetryX = symmetryXMatches / (width * height);
	const symmetryY = symmetryYMatches / (width * height);
	const symmetry = (symmetryX + symmetryY) / 2;

	const regionAreas = new Array(9).fill(0);
	components.forEach((component) => {
		const regionX = Math.min(2, Math.floor((component.centerX / width) * 3));
		const regionY = Math.min(2, Math.floor((component.centerY / height) * 3));
		regionAreas[regionY * 3 + regionX] += component.area;
	});
	const activeRegion = getRegionLabel(regionAreas.indexOf(Math.max(...regionAreas, 0)));

	const score =
		nodeCandidates.length * 12 +
		Math.min(strokeComponents.length, 40) * 0.2 +
		symmetry * 10 +
		continuity * 8 +
		(mode === 'dark' ? 0.5 : 0);

	return {
		mask,
		components,
		nodeCandidates,
		strokeComponents,
		strokeDensity,
		symmetryX,
		symmetryY,
		symmetry,
		continuity,
		activeRegion,
		score,
		mode,
	};
};

const estimateLattice = (nodeCandidates: Component[]) => {
	if (!nodeCandidates.length) {
		return {
			rows: 0,
			cols: 0,
			nodeEstimate: 0,
			occupancy: 0,
			angleDeg: 0,
		};
	}

	const meanX = average(nodeCandidates.map((node) => node.centerX));
	const meanY = average(nodeCandidates.map((node) => node.centerY));

	let covXX = 0;
	let covYY = 0;
	let covXY = 0;
	nodeCandidates.forEach((node) => {
		const dx = node.centerX - meanX;
		const dy = node.centerY - meanY;
		covXX += dx * dx;
		covYY += dy * dy;
		covXY += dx * dy;
	});

	const angle = 0.5 * Math.atan2(2 * covXY, covXX - covYY);
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);

	const rotated = nodeCandidates.map((node) => {
		const dx = node.centerX - meanX;
		const dy = node.centerY - meanY;
		return {
			u: dx * cos + dy * sin,
			v: -dx * sin + dy * cos,
		};
	});

	const neighborDistances: number[] = [];
	for (let i = 0; i < rotated.length; i++) {
		let nearest = Number.POSITIVE_INFINITY;
		for (let j = 0; j < rotated.length; j++) {
			if (i === j) continue;
			const distance = Math.hypot(rotated[i].u - rotated[j].u, rotated[i].v - rotated[j].v);
			if (distance < nearest) nearest = distance;
		}
		if (Number.isFinite(nearest)) neighborDistances.push(nearest);
	}

	const baseSpacing = average(neighborDistances) || 10;
	const tolerance = Math.max(4, baseSpacing * 0.42);

	const uClusters = clusterPositions(rotated.map((point) => point.u), tolerance);
	const vClusters = clusterPositions(rotated.map((point) => point.v), tolerance);

	const occupied = new Set<string>();
	rotated.forEach((point) => {
		const uIndex = uClusters.findIndex((cluster) => Math.abs(cluster - point.u) <= tolerance);
		const vIndex = vClusters.findIndex((cluster) => Math.abs(cluster - point.v) <= tolerance);
		if (uIndex >= 0 && vIndex >= 0) occupied.add(`${uIndex}:${vIndex}`);
	});

	const rows = vClusters.length;
	const cols = uClusters.length;
	const theoreticalNodes = rows * cols;
	const occupancy = theoreticalNodes > 0 ? occupied.size / theoreticalNodes : 0;
	const nodeEstimate = occupancy > 0.55 ? theoreticalNodes : nodeCandidates.length;

	return {
		rows,
		cols,
		nodeEstimate,
		occupancy,
		angleDeg: Math.abs((angle * 180) / Math.PI),
	};
};

const classifyKolam = ({
	rows,
	cols,
	nodeEstimate,
	continuity,
	symmetry,
	dotVisibility,
	occupancy,
}: {
	rows: number;
	cols: number;
	nodeEstimate: number;
	continuity: number;
	symmetry: number;
	dotVisibility: number;
	occupancy: number;
}) => {
	if (rows >= 5 && cols >= 5 && continuity > 0.2 && symmetry > 0.75 && occupancy > 0.6) {
		return {
			type: 'Sikku Kolam',
			region: 'Tamil Nadu / South Indian kolam tradition',
			confidence: 89,
			motif: 'Interlaced continuous loop lattice',
		};
	}

	if (rows >= 4 && cols >= 4 && dotVisibility > 0.08 && occupancy > 0.5) {
		return {
			type: 'Pulli Kolam',
			region: 'Tamil Nadu / South Indian dot-grid tradition',
			confidence: 82,
			motif: 'Dot-grid guided geometric weave',
		};
	}

	if (symmetry > 0.8 && nodeEstimate >= 9) {
		return {
			type: 'Decorative Kolam',
			region: 'South Indian ceremonial floor-art tradition',
			confidence: 72,
			motif: 'Symmetric ornamental motif',
		};
	}

	return {
		type: 'Kolam-inspired Pattern',
		region: 'South Indian kolam / rangoli family',
		confidence: 60,
		motif: 'Freeform geometric arrangement',
	};
};

export const analyzeKolamImage = (
	data: Uint8ClampedArray,
	width: number,
	height: number,
): KolamEngineResult => {
	const brightnessValues: number[] = [];
	for (let i = 0; i < data.length; i += 4) {
		brightnessValues.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
	}

	const meanBrightness = average(brightnessValues);
	const brightnessDeviation = stdDev(brightnessValues, meanBrightness);

	const darkMask = buildMaskFromMode(data, width, height, 'dark', brightnessValues, meanBrightness, brightnessDeviation);
	const lightMask = buildMaskFromMode(data, width, height, 'light', brightnessValues, meanBrightness, brightnessDeviation);

	const darkPass = analyzePass(darkMask, width, height, 'dark');
	const lightPass = analyzePass(lightMask, width, height, 'light');
	const chosenPass = lightPass.score > darkPass.score ? lightPass : darkPass;

	const lattice = estimateLattice(chosenPass.nodeCandidates);
	const dotVisibility =
		chosenPass.components.length > 0 ? chosenPass.nodeCandidates.length / chosenPass.components.length : 0;

	const classification = classifyKolam({
		rows: lattice.rows,
		cols: lattice.cols,
		nodeEstimate: lattice.nodeEstimate,
		continuity: chosenPass.continuity,
		symmetry: chosenPass.symmetry,
		dotVisibility,
		occupancy: lattice.occupancy,
	});

	let complexity = 'Low';
	if (lattice.nodeEstimate >= 25 || chosenPass.strokeComponents.length > 18 || chosenPass.strokeDensity > 0.12) {
		complexity = 'High';
	} else if (lattice.nodeEstimate >= 12 || chosenPass.strokeComponents.length > 8 || chosenPass.strokeDensity > 0.05) {
		complexity = 'Medium';
	}

	const estimatedGrid =
		lattice.rows > 0 && lattice.cols > 0 ? `${lattice.rows} x ${lattice.cols}` : 'Unknown';

	const notes: string[] = [];
	notes.push(
		chosenPass.mode === 'light'
			? 'Engine selected the light-foreground pass because stroke and node evidence was stronger there.'
			: 'Engine selected the dark-foreground pass because stroke and node evidence was stronger there.',
	);
	notes.push(
		chosenPass.nodeCandidates.length
			? `Detected ${chosenPass.nodeCandidates.length} probable node components after filtering by compactness, circularity, and enclosed-hole structure.`
			: 'No stable node components were isolated, so grid estimation is low confidence.',
	);
	if (lattice.rows > 0 && lattice.cols > 0) {
		notes.push(
			`Lattice clustering found ${lattice.rows} row bands and ${lattice.cols} column bands with ${Math.round(
				lattice.occupancy * 100,
			)}% intersection occupancy.`,
		);
	}
	if (lattice.angleDeg > 12) {
		notes.push(`Detected a rotated lattice orientation of roughly ${Math.round(lattice.angleDeg)} degrees, consistent with a diamond kolam layout.`);
	}
	if (chosenPass.symmetry > 0.75) {
		notes.push('High bilateral symmetry was measured across the extracted structure.');
	}
	if (chosenPass.continuity > 0.18) {
		notes.push('Stroke continuity suggests the design is built from larger connected loop segments rather than isolated marks.');
	}

	return {
		kolamType: classification.type,
		probableRegion: classification.region,
		confidence: `${classification.confidence}%`,
		estimatedNodes: lattice.nodeEstimate,
		estimatedGrid,
		symmetry: asPercent(chosenPass.symmetry),
		horizontalSymmetry: asPercent(chosenPass.symmetryX),
		verticalSymmetry: asPercent(chosenPass.symmetryY),
		continuity: asPercent(chosenPass.continuity),
		strokeDensity: asPercent(chosenPass.strokeDensity),
		dotVisibility: asPercent(dotVisibility),
		activeRegion: chosenPass.activeRegion,
		motif: classification.motif,
		complexity,
		notes,
	};
};
