/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

import {
  getRandomInteger,
  getRandomColorRgb,
  getCanvasDimensions,
  getCanvas2dContext,
  updateParticleColors,
  generateParticles,
} from "../../utils";

import init, { Circles } from "collisions-src";
import Dashboard from "../../Dashboard";

const RustNaive = () => {
  // Constants
  const INITIAL_PARTICLES = 4000;

  // Wasm
  const [isWasmLoaded, setIsWasmLoaded] = useState(false);

  // State variables
  const [numberOfParticles, setNumberOfParticles] = useState(0);
  const [initialParticlesLoaded, setInitialParticlesLoaded] = useState(false);
  const [coefficientOfRestitution, setCoefficientOfRestitution] = useState(1);
  const [isWallElastic, setIsWallElastic] = useState(true);
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
    const [containerWidth, containerHeight] = getCanvasDimensions(canvasRef);

    const ctx = getCanvas2dContext(canvasRef);
    if (!ctx) return;

    if (!isWasmLoaded) return;

    if (!initialParticlesLoaded) {
      createParticles(canvasRef, INITIAL_PARTICLES);
      setInitialParticlesLoaded(true);
      return;
    }

    const particlesWasm = new Circles(particles);

    const updatedParticles = particlesWasm.update(
      containerWidth,
      containerHeight
    );

    setParticles(updatedParticles);
    setNumberOfParticles(updatedParticles.length);
    updateParticleColors(updatedParticles);
    drawParticles(ctx, updatedParticles);
  };

  useEffect(() => {
    init()
      .then(() => {
        setIsWasmLoaded(true);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

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
      particlesLen={numberOfParticles}
    />
  );
};

export default RustNaive;
