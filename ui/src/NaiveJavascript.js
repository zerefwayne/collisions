import { useRef } from "react";

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColorRgb() {
  const r = getRandomInteger(50, 255);
  const g = getRandomInteger(50, 255);
  const b = getRandomInteger(50, 255);

  return `rgb(${r}, ${g}, ${b})`;
}

const NaiveJavascript = () => {
  const canvasRef = useRef(null);

  const drawCircle = (ctx, x, y, radius, color) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
  };

  const handleClick = (event) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { offsetX, offsetY } = event.nativeEvent;
    drawCircle(
      ctx,
      offsetX,
      offsetY,
      getRandomInteger(5, 15),
      getRandomColorRgb()
    );
  };

  return (
    <div>
      <h2>Naive Javascript Implementation</h2>
      <canvas
        ref={canvasRef}
        id="my-canvas"
        height="500"
        width="500"
        style={{ border: "2px solid #444" }}
        onClick={handleClick}
      ></canvas>
    </div>
  );
};

export default NaiveJavascript;
