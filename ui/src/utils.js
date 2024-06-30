export const getRandomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomColorRgb = () => {
  const r = getRandomInteger(50, 255);
  const g = getRandomInteger(50, 255);
  const b = getRandomInteger(50, 255);

  return `rgb(${r}, ${g}, ${b})`;
};
