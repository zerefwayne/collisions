import { useState } from "react";
import {
  getRandomInteger,
  getRandomColorRgb,
  getCanvasDimensions,
  getCanvas2dContext,
  updateParticleColors,
  generateParticles,
} from "./utils";

import Dashboard from "./Dashboard";

const NaiveJavascriptNoCollision = () => {
  // Constants
  const INITIAL_PARTICLES = 4000;

  // Universe Properties
  const [coefficientOfRestitution, setCoefficientOfRestitution] = useState(1);
  const [isWallElastic, setIsWallElastic] = useState(true);
  const [isInitiated, setIsInitiated] = useState(false);
  const [particles, setParticles] = useState([]);

  // Action Handlers
  const handleClick = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;

    const dx = getRandomInteger(-20, 20);
    const dy = getRandomInteger(-20, 20);

    const newParticles = [...particles];

    newParticles.push({
      x: offsetX,
      y: offsetY,
      dx,
      dy,
      radius: getRandomInteger(5, 10),
      color: getRandomColorRgb(),
    });

    setParticles(newParticles);
  };

  const handleIncrement = (canvasRef, step) => {
    createParticles(canvasRef, step);
  };

  const handleDecrement = (step) => {
    const decreaseBy = Math.min(particles.length, step);
    const newParticles = particles.slice(decreaseBy);
    setParticles(newParticles);
  };

  const handleRestitutionChange = (event, newValue) => {
    setCoefficientOfRestitution(newValue);
  };

  const handleIsWallElastic = (event, newValue) => {
    setIsWallElastic(newValue);
  };

  // Helper Methods
  const drawParticle = (ctx, x, y, radius, color) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
  };

  const drawParticles = (ctx, particles) => {
    for (const particle of particles) {
      drawParticle(
        ctx,
        particle.x,
        particle.y,
        particle.radius,
        particle.color
      );
    }
  };

  const createParticles = (canvasRef, count) => {
    const [universeWidth, universeHeight] = getCanvasDimensions(canvasRef);
    const newParticles = [
      ...particles,
      ...generateParticles(count, universeWidth, universeHeight),
    ];
    setParticles(newParticles);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tick = (canvasRef) => {
    const [universeWidth, universeHeight] = getCanvasDimensions(canvasRef);

    const ctx = getCanvas2dContext(canvasRef);
    if (!ctx) return;

    if (!isInitiated) {
      createParticles(canvasRef, INITIAL_PARTICLES);
      setIsInitiated(true);
    }

    const updatedParticles = particles.map((particle, index) => {
      particle.x += particle.dx;
      particle.y += particle.dy;

      // Check for bouncing off edges
      if (
        particle.x + particle.radius > universeWidth ||
        particle.x - particle.radius < 0
      ) {
        particle.dx *= -1;

        if (!isWallElastic) {
          particle.dx *= coefficientOfRestitution;
        }
      }
      if (
        particle.y + particle.radius > universeHeight ||
        particle.y - particle.radius < 0
      ) {
        particle.dy *= -1;

        if (!isWallElastic) {
          particle.dy *= coefficientOfRestitution;
        }
      }

      if (particle.x + particle.radius > universeWidth) {
        particle.x = universeWidth - particle.radius;
      }

      if (particle.x - particle.radius < 0) {
        particle.x = particle.radius;
      }

      if (particle.y + particle.radius > universeHeight) {
        particle.y = universeHeight - particle.radius;
      }

      if (particle.y - particle.radius < 0) {
        particle.y = particle.radius;
      }

      return particle;
    });

    updateParticleColors(updatedParticles);
    drawParticles(ctx, updatedParticles);
  };

  return (
    <Dashboard
      handleClick={handleClick}
      handleDecrement={handleDecrement}
      handleIncrement={handleIncrement}
      handleRestitutionChange={handleRestitutionChange}
      handleIsWallElastic={handleIsWallElastic}
      tick={tick}
      coefficientOfRestitution={coefficientOfRestitution}
      isWallElastic={isWallElastic}
      particlesLen={particles.length}
    />
  );
};

export default NaiveJavascriptNoCollision;
