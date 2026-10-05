import sharp from 'sharp';

export async function readPixels(input) {
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

// Normalized image correlation tracks visible movement independently of Three's
// model matrices. It catches a planter moving over a different pavement layer.
export function trackPatch(before, after, { x, y, w, h }) {
  const samples = [];
  for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) for (let c = 0; c < 3; c++) samples.push(before.data[((y + py) * before.width + x + px) * 3 + c]);
  const mean = samples.reduce((sum, v) => sum + v, 0) / samples.length;
  const centered = samples.map(v => v - mean);
  const norm = Math.sqrt(centered.reduce((sum, v) => sum + v * v, 0));
  let best = { score: -1, dx: 0, dy: 0 };
  for (let dy = -20; dy <= 20; dy++) for (let dx = -45; dx <= 45; dx++) {
    if (x + dx < 0 || y + dy < 0 || x + dx + w > after.width || y + dy + h > after.height) continue;
    let sum = 0, square = 0, dot = 0, index = 0;
    for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) for (let c = 0; c < 3; c++) {
      const value = after.data[((y + dy + py) * after.width + x + dx + px) * 3 + c];
      sum += value; square += value * value; dot += value * centered[index++];
    }
    const score = dot / (norm * Math.sqrt(Math.max(.001, square - sum * sum / samples.length)));
    if (score > best.score) best = { score, dx, dy };
  }
  return best;
}
