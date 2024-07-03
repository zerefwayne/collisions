/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { getRandomInteger, getRandomColorRgb } from "../../utils";

import init, { Circles } from "collisions-src";

const RustNaive = () => {
  // Constants
  const INITIAL_PARTICLES = 4000;

  const UNIVERSE_WIDTH = 600;
  const UNIVERSE_HEIGHT = 600;

  // State
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);
  const [isWasmLoaded, setIsWasmLoaded] = useState(false);

  const [kineticEnergy, setKineticEnergy] = useState(0);
  const [fps, setFps] = useState(0);

  const [frameCount, setFrameCount] = useState(0);
  const [lastTimestamp, setLastTimestamp] = useState(performance.now());

  const [circles, setCircles] = useState([
    { x: 10, y: 10, dx: 1, dy: 4, radius: 10, color: "white" },
  ]);

  function calculateTotalKineticEnergy(circles) {
    const energy = circles.reduce((totalEnergy, circle) => {
      const mass = circle.radius;
      const velocitySquared = circle.dx * circle.dx + circle.dy * circle.dy;
      const kineticEnergy = 0.5 * mass * velocitySquared;
      return totalEnergy + kineticEnergy;
    }, 0);

    return energy.toFixed(2);
  }

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

    const dx = getRandomInteger(-20, 20);
    const dy = getRandomInteger(-20, 20);

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
      const x = getRandomInteger(UNIVERSE_WIDTH / 3, UNIVERSE_WIDTH * (2 / 3));
      const y = getRandomInteger(
        UNIVERSE_HEIGHT / 3,
        UNIVERSE_HEIGHT * (2 / 3)
      );
      const dx = getRandomInteger(-1, 1);
      const dy = getRandomInteger(-1, 1);
      const radius = getRandomInteger(1, 3);
      const color = getRandomColorRgb();

      newCircles.push({ x, y, dx, dy, radius, color });
    }

    setCircles(newCircles);
  };

  const clearCanvas = (canvas) => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  function calculateSpeed(circle) {
    return Math.sqrt(circle.dx * circle.dx + circle.dy * circle.dy);
  }

  function interpolateColor(value, color1, color2) {
    const r = color1[0] + value * (color2[0] - color1[0]);
    const g = color1[1] + value * (color2[1] - color1[1]);
    const b = color1[2] + value * (color2[2] - color1[2]);
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }

  function getColor(speed) {
    const normalizedSpeed = Math.min(speed / 5, 1.0);
    const lowColor = [0, 0, 139]; // Dark Blue
    const highColor = [255, 0, 0]; // Red
    return interpolateColor(normalizedSpeed, lowColor, highColor);
  }

  function updateCircleColors(circles) {
    const speeds = circles.map(calculateSpeed);
    const maxSpeed = Math.max(...speeds);

    circles.forEach((circle, index) => {
      const speed = speeds[index];
      circle.color = getColor(speed, maxSpeed);
    });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const animate = () => {
    // Get the canvas and context
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    clearCanvas(canvas);

    if (isWasmLoaded) {
      const circlesWasm = new Circles(circles);

      const updatedCircles = circlesWasm.update(canvas.width, canvas.height);

      setCircles(updatedCircles);

      setKineticEnergy(calculateTotalKineticEnergy(updatedCircles));

      updateCircleColors(updatedCircles);

      for (const circle of updatedCircles) {
        drawCircle(ctx, circle.x, circle.y, circle.radius, circle.color);
      }
    }
  };

  const loadWasm = async () => {
    try {
      await init();
      setIsWasmLoaded(true);
    } catch (err) {
      console.error(`Unexpected error in loadWasm. [Message: ${err.message}]`);
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      setContext(ctx);
      drawRandomCircles(INITIAL_PARTICLES);

      if (!isWasmLoaded) {
        loadWasm();
      }
    }
  }, []);

  useEffect(() => {
    let animationFrameId;

    const render = (timestamp) => {
      animate();

      // Calculate FPS
      setFrameCount(frameCount + 1);
      const elapsed = timestamp - lastTimestamp;
      if (elapsed >= 1000) {
        let fps = (frameCount / elapsed) * 1000; // Calculate FPS
        setFrameCount(0);
        setLastTimestamp(timestamp);
        setFps(Math.floor(fps)); // Display FPS
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    if (context) {
      animationFrameId = window.requestAnimationFrame(render);
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [animate, context]);

  return (
    <div>
      <h2>Rust | Naive Algorithm | Simple Elastic Collision</h2>
      <p>
        {fps}fps | Total Particles: {circles.length} | Kinetic Energy:{" "}
        {kineticEnergy} kg m/s^2 | Wasm loaded: {isWasmLoaded ? "Yes" : "No"}
      </p>
      <canvas
        ref={canvasRef}
        id="my-canvas"
        height={UNIVERSE_HEIGHT}
        width={UNIVERSE_WIDTH}
        style={{ border: "2px solid #444" }}
        onClick={handleClick}
      ></canvas>
      <p style={{ color: "#999" }}>
        Click anywhere in the collision area to launch a large particle!
      </p>
    </div>
  );
};

export default RustNaive;
