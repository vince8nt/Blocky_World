// implement perlin noise
function perlinNoise2D(x, y, frequency = 1, amplitude = 1, octaves = 1) {
    let total = 0;
    let maxAmplitude = 0;
    for (let i = 0; i < octaves; i++) {
        total += smoothNoise(x * frequency, y * frequency) * amplitude;
        maxAmplitude += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }
    return (total / maxAmplitude + 1) / 2;
}

function smoothNoise(x, y) {
    const xInt = Math.floor(x);
    const yInt = Math.floor(y);
    const xFrac = x - xInt;
    const yFrac = y - yInt;

    const v1 = randomGradient(xInt, yInt);
    const v2 = randomGradient(xInt + 1, yInt);
    const v3 = randomGradient(xInt, yInt + 1);
    const v4 = randomGradient(xInt + 1, yInt + 1);

    const dot1 = dotProduct(v1, xFrac, yFrac);
    const dot2 = dotProduct(v2, xFrac - 1, yFrac);
    const dot3 = dotProduct(v3, xFrac, yFrac - 1);
    const dot4 = dotProduct(v4, xFrac - 1, yFrac - 1);

    const u = fade(xFrac);
    const v = fade(yFrac);

    return lerp(lerp(dot1, dot2, u), lerp(dot3, dot4, u), v);
}

function randomGradient(x, y) {
    const random = 2920 * Math.sin(x * 21942 + y * 171324 + 8912) * Math.cos(x * 23157 * y * 217832 + 9758);
    return normalize(Math.cos(random), Math.sin(random));
}

function dotProduct(v, x, y) {
    return v.x * x + v.y * y;
}

function lerp(a, b, t) {
    return a + t * (b - a);
}

function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function normalize(x, y) {
    const magnitude = Math.sqrt(x * x + y * y);
    return { x: x / magnitude, y: y / magnitude };
}


var blocks = new Array(64);
for (let i = 0; i < 64; i++) {
    blocks[i] = new Array(64);
    for (let j = 0; j < 64; j++) {
        let x = 0.03125 + 0.0625 * i;
        let y = 0.03125 + 0.0625 * j;
        blocks[i][j] = 5 + Math.floor(smoothNoise(x, y) * 10);
    }
}

console.log(blocks);

let m = new Map(64, 64);
m.map = blocks

