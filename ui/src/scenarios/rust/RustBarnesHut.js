/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

import init, { BarnesUniverse as Universe } from "collisions-src";
import Dashboard from "../../Dashboard";
import { getCanvas2dContext, getCanvasDimensions } from "../../utils";

const RustBarnesHut = () => {
  // Constants
  const INITIAL_PARTICLES = 4000;

  // Wasm
  const [universe, setUniverse] = useState(null);
  const [wasmMemory, setWasmMemory] = useState(null);

  // State variables
  const [numberOfParticles, setNumberOfParticles] = useState(0);
  const [initialParticlesLoaded, setInitialParticlesLoaded] = useState(false);
  const [coefficientOfRestitution, setCoefficientOfRestitution] = useState(1);
  const [isWallElastic, setIsWallElastic] = useState(true);

  // Handlers
  const handleClick = (event) => {
    if (!universe) return;

    const { offsetX, offsetY } = event.nativeEvent;
    universe.generate_particle(offsetX, offsetY);
  };

  const handleIncrement = (canvasRef, step) => {
    if (!universe) return;

    universe.generate_particles(step);
  };

  const handleDecrement = (step) => {
    if (!universe) return;

    universe.decrease_particles(step);
  };

  const handleIsWallElastic = (event, newValue) => {
    if (!universe) return;

    setIsWallElastic(newValue);
    universe.set_is_wall_elastic(newValue);
  };

  const handleRestitutionChange = (event, newValue) => {
    if (!universe) return;

    setCoefficientOfRestitution(newValue);
    universe.set_coefficient_of_restitution(newValue);
  };

  // Methods
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

  const fetchParticles = () => {
    if (!wasmMemory || !universe) {
      console.error("WASM or UNIVERSE not available!");
      return;
    }

    const particlesPtr = universe.get_particles_ptr();
    const particlesLen = universe.get_particles_len();

    setNumberOfParticles(particlesLen);

    const numberOfFields = 8;

    const memoryBuffer = new Float64Array(
      wasmMemory.buffer,
      particlesPtr,
      particlesLen * numberOfFields
    );

    const particles = [];
    for (let i = 0; i < particlesLen; i++) {
      const offset = i * numberOfFields;

      const particle = {
        x: memoryBuffer[offset],
        y: memoryBuffer[offset + 1],
        dx: memoryBuffer[offset + 2],
        dy: memoryBuffer[offset + 3],
        radius: memoryBuffer[offset + 4],
        color: `rgb(${memoryBuffer[offset + 5]},${memoryBuffer[offset + 6]},${
          memoryBuffer[offset + 7]
        })`,
      };

      particles.push(particle);
    }

    setNumberOfParticles(particles.length);

    return particles;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tick = (canvasRef) => {
    const [containerWidth, containerHeight] = getCanvasDimensions(canvasRef);

    const ctx = getCanvas2dContext(canvasRef);
    if (!ctx) return;

    if (!wasmMemory || !universe) return;

    universe.resize_universe(containerWidth, containerHeight);

    if (!initialParticlesLoaded) {
      universe.generate_particles(INITIAL_PARTICLES);
      setInitialParticlesLoaded(true);
    }

    universe.tick();
    
    drawParticles(ctx, fetchParticles());
  };

  useEffect(() => {
    init()
      .then((loadedWasm) => {
        const newUniverse = new Universe(100, 100);
        setUniverse(newUniverse);
        setWasmMemory(loadedWasm.memory);
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

export default RustBarnesHut;
