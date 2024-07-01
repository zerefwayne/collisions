import { useEffect, useRef, useState } from "react";
import { getRandomInteger, getRandomColorRgb } from "./utils";

const NaiveJavascriptSimpleElasticCollision = () => {
  // Constants
  const INITIAL_PARTICLES = 4000;

  const UNIVERSE_WIDTH = 600;
  const UNIVERSE_HEIGHT = 600;

  const UNIVERSE_X_START = 0;
  const UNIVERSE_X_END = UNIVERSE_WIDTH - 1;

  const UNIVERSE_Y_START = 0;
  const UNIVERSE_Y_END = UNIVERSE_HEIGHT - 1;

  // State
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);

  const [kineticEnergy, setKineticEnergy] = useState(0);
  const [fps, setFps] = useState(0);

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
      const x = getRandomInteger(UNIVERSE_X_START + 298, UNIVERSE_X_END - 298);
      const y = getRandomInteger(UNIVERSE_Y_START + 298, UNIVERSE_Y_END - 298);
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

    const updatedCircles = circles.map((circle, index) => {
      circle.x += circle.dx;
      circle.y += circle.dy;

      // // Check for collisions with other circles
      for (let j = 0; j < circles.length; j++) {
        if (index !== j) {
          let otherCircle = circles[j];
          let dx = circle.x - otherCircle.x;
          let dy = circle.y - otherCircle.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < circle.radius + otherCircle.radius) {
            // Calculate the angle of the collision
            let angle = Math.atan2(dy, dx);
            let sin = Math.sin(angle);
            let cos = Math.cos(angle);

            // Rotate circle's velocity vector
            let v1 = {
              x: cos * circle.dx + sin * circle.dy,
              y: cos * circle.dy - sin * circle.dx,
            };
            // Rotate otherCircle's velocity vector
            let v2 = {
              x: cos * otherCircle.dx + sin * otherCircle.dy,
              y: cos * otherCircle.dy - sin * otherCircle.dx,
            };

            // Calculate the new velocities using the mass ratio
            let m1 = circle.radius; // Mass of circle (assuming mass is proportional to radius)
            let m2 = otherCircle.radius; // Mass of otherCircle

            let v1Final = {
              x: ((m1 - m2) * v1.x + 2 * m2 * v2.x) / (m1 + m2),
              y: v1.y,
            };
            let v2Final = {
              x: ((m2 - m1) * v2.x + 2 * m1 * v1.x) / (m1 + m2),
              y: v2.y,
            };

            // Rotate back
            circle.dx = cos * v1Final.x - sin * v1Final.y;
            circle.dy = cos * v1Final.y + sin * v1Final.x;
            otherCircle.dx = cos * v2Final.x - sin * v2Final.y;
            otherCircle.dy = cos * v2Final.y + sin * v2Final.x;

            // Ensure the circles are not overlapping
            let overlap = (circle.radius + otherCircle.radius - distance) / 2;
            circle.x += cos * overlap;
            circle.y += sin * overlap;
            otherCircle.x -= cos * overlap;
            otherCircle.y -= sin * overlap;
          }
        }
      }

      // Check for bouncing off edges
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

      if (circle.x + circle.radius > canvas.width) {
        circle.x = canvas.width - circle.radius;
      }

      if (circle.x - circle.radius < 0) {
        circle.x = circle.radius;
      }

      if (circle.y + circle.radius > canvas.height) {
        circle.y = canvas.height - circle.radius;
      }

      if (circle.y - circle.radius < 0) {
        circle.y = circle.radius;
      }

      return circle;
    });

    setKineticEnergy(calculateTotalKineticEnergy(updatedCircles));

    updateCircleColors(updatedCircles);

    for (const circle of updatedCircles) {
      drawCircle(ctx, circle.x, circle.y, circle.radius, circle.color);
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      setContext(ctx);
      drawRandomCircles(INITIAL_PARTICLES);
    }
  }, []);

  useEffect(() => {
    let animationFrameId;
    let lastTimestamp = performance.now();
    let frameCount = 0;
    let fps = 0;

    const render = (timestamp) => {
      animate();

      // Calculate FPS
      frameCount++;
      const elapsed = timestamp - lastTimestamp;
      if (elapsed >= 1000) {
        fps = (frameCount / elapsed) * 1000; // Calculate FPS
        frameCount = 0;
        lastTimestamp = timestamp;
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
      <h2>Javascript | Naive Algorithm | Simple Elastic Collision</h2>
      <p>
        {fps}fps | Total Particles: {circles.length} | Kinetic Energy:{" "}
        {kineticEnergy} kg m/s^2
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

export default NaiveJavascriptSimpleElasticCollision;
