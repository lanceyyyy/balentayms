/**
 * Generate 3D particle positions from text using an offscreen canvas.
 */
export function textToParticlePositions(
  text: string,
  maxParticles: number = 500,
  scaleX: number = 10,
  scaleY: number = 3
): { x: number; y: number; z: number }[] {
  if (typeof document === 'undefined') return [];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  canvas.width = 800;
  canvas.height = 200;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = 'bold 40px serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const points: { x: number; y: number; z: number }[] = [];

  // Sample white pixels
  const step = Math.max(2, Math.floor(Math.sqrt((canvas.width * canvas.height) / (maxParticles * 2))));

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const idx = (y * canvas.width + x) * 4;
      if (data[idx] > 128) {
        // Normalize to centered 3D coordinates
        const nx = ((x / canvas.width) - 0.5) * scaleX;
        const ny = -((y / canvas.height) - 0.5) * scaleY;
        const nz = (Math.random() - 0.5) * 0.5;
        points.push({ x: nx, y: ny, z: nz });
      }
    }
  }

  // Cap to maxParticles
  if (points.length > maxParticles) {
    const stride = Math.ceil(points.length / maxParticles);
    const filtered: typeof points = [];
    for (let i = 0; i < points.length; i += stride) {
      filtered.push(points[i]);
    }
    return filtered;
  }

  return points;
}
