import { useEffect, useRef, useState } from "react";
import { getRandomInteger, getRandomColorRgb } from "../utils";

import "./styles.css";

class QuadTree {
  constructor(boundary, capacity) {
    this.boundary = boundary; // Boundary is a rectangle { x, y, w, h }
    this.capacity = capacity; // Max number of objects in a quadrant before subdivision
    this.circles = [];
    this.divided = false;
  }

  subdivide() {
    let x = this.boundary.x;
    let y = this.boundary.y;
    let w = this.boundary.w / 2;
    let h = this.boundary.h / 2;

    let ne = new Rectangle(x + w, y - h, w, h);
    let nw = new Rectangle(x - w, y - h, w, h);
    let se = new Rectangle(x + w, y + h, w, h);
    let sw = new Rectangle(x - w, y + h, w, h);

    this.northeast = new QuadTree(ne, this.capacity);
    this.northwest = new QuadTree(nw, this.capacity);
    this.southeast = new QuadTree(se, this.capacity);
    this.southwest = new QuadTree(sw, this.capacity);

    this.divided = true;
  }

  insert(circle) {
    if (!this.boundary.contains(circle)) {
      return false;
    }

    if (this.circles.length < this.capacity) {
      this.circles.push(circle);
      return true;
    } else {
      if (!this.divided) {
        this.subdivide();
      }

      if (this.northeast.insert(circle)) return true;
      if (this.northwest.insert(circle)) return true;
      if (this.southeast.insert(circle)) return true;
      if (this.southwest.insert(circle)) return true;
    }
  }

  query(range, found) {
    if (!found) {
      found = [];
    }

    if (!this.boundary.intersects(range)) {
      return found;
    } else {
      for (let c of this.circles) {
        if (range.contains(c)) {
          found.push(c);
        }
      }
      if (this.divided) {
        this.northwest.query(range, found);
        this.northeast.query(range, found);
        this.southwest.query(range, found);
        this.southeast.query(range, found);
      }
    }

    return found;
  }
}

class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contains(circle) {
    return (
      circle.x - circle.radius > this.x - this.w &&
      circle.x + circle.radius < this.x + this.w &&
      circle.y - circle.radius > this.y - this.h &&
      circle.y + circle.radius < this.y + this.h
    );
  }

  intersects(range) {
    return !(
      range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h
    );
  }
}

const BarnesHutJavascriptSimpleElasticCollision = () => {
  // Constants
  const INITIAL_PARTICLES = 10000;

  const UNIVERSE_WIDTH = 700;
  const UNIVERSE_HEIGHT = 700;

  const UNIVERSE_X_START = 0;
  const UNIVERSE_X_END = UNIVERSE_WIDTH - 1;

  const UNIVERSE_Y_START = 0;
  const UNIVERSE_Y_END = UNIVERSE_HEIGHT - 1;

  // State
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);

  const [kineticEnergy, setKineticEnergy] = useState(0);
  const [fps, setFps] = useState(0);
  const [averageKineticEnergy, setAverageKineticEnergy] = useState(0);

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

    const boundary = new Rectangle(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
      canvas.height / 2
    );
    const qtree = new QuadTree(boundary, 4);

    circles.forEach((circle) => {
      qtree.insert(circle);
    });

    const updatedCircles = circles.map((circle, index) => {
      circle.x += circle.dx;
      circle.y += circle.dy;

      // Query for potential collisions within a radius
      const range = new Rectangle(
        circle.x,
        circle.y,
        circle.radius * 2,
        circle.radius * 2
      );
      const potentialCollisions = qtree.query(range);

      for (let otherCircle of potentialCollisions) {
        if (circle !== otherCircle) {
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

    const kineticEnergy = calculateTotalKineticEnergy(updatedCircles);
    const averageKineticEnergy = (kineticEnergy / circles.length).toFixed(2);

    setKineticEnergy(kineticEnergy);
    setAverageKineticEnergy(averageKineticEnergy);

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
    <div className="scene-container">
      <div className="canvas-container">
        <div className="canvas-render">
          <canvas
            ref={canvasRef}
            id="my-canvas"
            height={UNIVERSE_HEIGHT}
            width={UNIVERSE_WIDTH}
            style={{ border: "2px solid #444" }}
            onClick={handleClick}
          ></canvas>
        </div>
        <footer>
          <p>Total Particles: {circles.length}</p>
          <p>Average Kinetic Energy: {averageKineticEnergy} kg m/s^2</p>
          <p>Kinetic Energy: {kineticEnergy} kg m/s^2 </p>
          <p>{fps}fps</p>
        </footer>
      </div>
      <div className="controls-container">
        
      </div>
    </div>
  );
};

export default BarnesHutJavascriptSimpleElasticCollision;
