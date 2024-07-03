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

const NaiveJavascriptSimpleElasticCollision = () => {
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

      // // Check for collisions with other particles
      for (let j = 0; j < particles.length; j++) {
        if (index !== j) {
          let otherParticle = particles[j];
          let dx = particle.x - otherParticle.x;
          let dy = particle.y - otherParticle.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < particle.radius + otherParticle.radius) {
            // Calculate the angle of the collision
            let angle = Math.atan2(dy, dx);
            let sin = Math.sin(angle);
            let cos = Math.cos(angle);

            // Rotate particle's velocity vector
            let v1 = {
              x: cos * particle.dx + sin * particle.dy,
              y: cos * particle.dy - sin * particle.dx,
            };
            // Rotate otherParticle's velocity vector
            let v2 = {
              x: cos * otherParticle.dx + sin * otherParticle.dy,
              y: cos * otherParticle.dy - sin * otherParticle.dx,
            };

            // Calculate the new velocities using the mass ratio
            let m1 = particle.radius; // Mass of particle (assuming mass is proportional to radius)
            let m2 = otherParticle.radius; // Mass of otherParticle

            let v1Final = {
              x: ((m1 - m2) * v1.x + 2 * m2 * v2.x) / (m1 + m2),
              y: v1.y,
            };
            let v2Final = {
              x: ((m2 - m1) * v2.x + 2 * m1 * v1.x) / (m1 + m2),
              y: v2.y,
            };

            // Apply coefficient of restitution
            v1Final.x *= coefficientOfRestitution;
            v2Final.x *= coefficientOfRestitution;

            // Rotate back
            particle.dx = cos * v1Final.x - sin * v1Final.y;
            particle.dy = cos * v1Final.y + sin * v1Final.x;
            otherParticle.dx = cos * v2Final.x - sin * v2Final.y;
            otherParticle.dy = cos * v2Final.y + sin * v2Final.x;

            // Ensure the particles are not overlapping
            let overlap =
              (particle.radius + otherParticle.radius - distance) / 2;
            particle.x += cos * overlap;
            particle.y += sin * overlap;
            otherParticle.x -= cos * overlap;
            otherParticle.y -= sin * overlap;
          }
        }
      }

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

export default NaiveJavascriptSimpleElasticCollision;
