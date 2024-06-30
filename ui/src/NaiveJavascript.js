import { useEffect, useRef, useState } from "react";
import { getRandomInteger, getRandomColorRgb } from "./utils";

const NaiveJavascript = () => {
  // Constants
  const UNIVERSE_WIDTH = 600;
  const UNIVERSE_HEIGHT = 600;

  const UNIVERSE_X_START = 0;
  const UNIVERSE_X_END = UNIVERSE_WIDTH - 1;

  const UNIVERSE_Y_START = 0;
  const UNIVERSE_Y_END = UNIVERSE_HEIGHT - 1;

  // State
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);

  const [circles, setCircles] = useState([
    { x: 10, y: 10, dx: 1, dy: 4, radius: 10, color: "white" },
  ]);

  // Methods
  const drawCircle = (ctx, x, y, radius, color) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
  };

  const handleClick = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;

    const dx = getRandomInteger(-3, 3);
    const dy = getRandomInteger(-3, 3);

    const newCircles = [...circles];

    newCircles.push({
      x: offsetX,
      y: offsetY,
      dx,
      dy,
      radius: getRandomInteger(5, 10),
      color: getRandomColorRgb(),
    });

    setCircles(newCircles);
  };

  const drawRandomCircles = (count) => {
    const newCircles = [];

    for (let i = 0; i < count; i++) {
      const x = getRandomInteger(UNIVERSE_X_START + 20, UNIVERSE_X_END - 20);
      const y = getRandomInteger(UNIVERSE_Y_START + 20, UNIVERSE_Y_END - 20);
      const dx = getRandomInteger(-3, 3);
      const dy = getRandomInteger(-3, 3);
      const radius = getRandomInteger(5, 10);
      const color = getRandomColorRgb();

      newCircles.push({ x, y, dx, dy, radius, color });
    }

    setCircles(newCircles);
  };

  const clearCanvas = (canvas) => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const animate = () => {
    // Get the canvas and context
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    clearCanvas(canvas);

    const updatedCircles = circles.map((circle) => {
      circle.x += circle.dx;
      circle.y += circle.dy;

      // Check for bouncing off edges (optional)
      if (
        circle.x + circle.radius > canvas.width ||
        circle.x - circle.radius < 0
      ) {
        circle.dx *= -1; // Reverse direction on reaching edge
      }
      if (
        circle.y + circle.radius > canvas.height ||
        circle.y - circle.radius < 0
      ) {
        circle.dy *= -1;
      }

      return circle;
    });

    for (const circle of updatedCircles) {
      drawCircle(ctx, circle.x, circle.y, circle.radius, circle.color);
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      setContext(ctx);
      drawRandomCircles(5);
    }
  }, []);

  useEffect(() => {
    let animationFrameId;
    if (context) {
      //Our draw came here
      const render = () => {
        animate();
        animationFrameId = window.requestAnimationFrame(render);
      };
      render();
    }
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [animate, context]);

  return (
    <div>
      <h2>Naive Javascript Implementation</h2>
      <canvas
        ref={canvasRef}
        id="my-canvas"
        height={UNIVERSE_HEIGHT}
        width={UNIVERSE_WIDTH}
        style={{ border: "2px solid #444" }}
        onClick={handleClick}
      ></canvas>
    </div>
  );
};

export default NaiveJavascript;
