export const getRandomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomColorRgb = () => {
  const r = getRandomInteger(50, 255);
  const g = getRandomInteger(50, 255);
  const b = getRandomInteger(50, 255);

  return `rgb(${r}, ${g}, ${b})`;
};

export const getCanvasDimensions = (canvasRef) => {
  const canvas = canvasRef.current;
  if (!canvas) return [0, 0]; // [width, height]

  return [canvas.width, canvas.height];
};

export const getCanvas2dContext = (canvasRef) => {
  const canvas = canvasRef.current;
  if (!canvas) return null;
  return canvas.getContext("2d");
};

export const updateParticleColors = (particles) => {
  const speeds = particles.map(calculateSpeed);
  const maxSpeed = Math.max(...speeds);

  particles.forEach((particle, index) => {
    const speed = speeds[index];
    particle.color = getColor(speed, maxSpeed);
  });
};

export const generateParticles = (count, universeWidth, universeHeight) => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const x = getRandomInteger(universeWidth / 3, (2 * universeWidth) / 3);
    const y = getRandomInteger(universeHeight / 3, (2 * universeHeight) / 3);
    const dx = getRandomInteger(-1, 1);
    const dy = getRandomInteger(-1, 1);
    const radius = getRandomInteger(1, 3);
    const color = getRandomColorRgb();

    particles.push({ x, y, dx, dy, radius, color });
  }
  return particles;
};

const calculateSpeed = (particle) => {
  return Math.sqrt(particle.dx * particle.dx + particle.dy * particle.dy);
};

const interpolateColor = (value, color1, color2) => {
  const r = color1[0] + value * (color2[0] - color1[0]);
  const g = color1[1] + value * (color2[1] - color1[1]);
  const b = color1[2] + value * (color2[2] - color1[2]);
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
};

const getColor = (speed) => {
  const normalizedSpeed = Math.min(speed / 5, 1.0);
  const lowColor = [0, 0, 139]; // Dark Blue
  const highColor = [255, 0, 0]; // Red
  return interpolateColor(normalizedSpeed, lowColor, highColor);
};
