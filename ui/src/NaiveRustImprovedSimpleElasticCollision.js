/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";

import init, { Universe } from "collisions-src";

const NaiveRustImprovedSimpleElasticCollision = () => {
  // Constants
  const INITIAL_PARTICLES = 4000;
  const UNIVERSE_WIDTH = 600;
  const UNIVERSE_HEIGHT = 600;

  // References
  const canvasRef = useRef(null);

  // State variables
  const [context, setContext] = useState(null);
  const [isWasmLoaded, setIsWasmLoaded] = useState(false);
  const [universe, setUniverse] = useState(null);
  const [wasmMemory, setWasmMemory] = useState(null);
  const [fps, setFps] = useState(0);
  const [numberOfParticles, setNumberOfParticles] = useState(0);

  const handleClick = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;
    const radius = 10;
    universe.insert_particle(offsetX, offsetY, radius);
  };

  const fetchParticles = () => {
    if (!wasmMemory || !universe) {
      console.error("WASM or UNIVERSE not available!");
      return;
    }

    const particlesPtr = universe.get_particles_ptr();
    const particlesLen = universe.get_particles_len();

    setNumberOfParticles(particlesLen);

    const memoryBuffer = new Float64Array(
      wasmMemory.buffer,
      particlesPtr,
      particlesLen * 5
    );

    const particles = [];
    for (let i = 0; i < particlesLen; i++) {
      const particle = {
        x: memoryBuffer[i * 5],
        y: memoryBuffer[i * 5 + 1],
        dx: memoryBuffer[i * 5 + 2],
        dy: memoryBuffer[i * 5 + 3],
        radius: memoryBuffer[i * 5 + 4],
        // TODO: Find out how to read strings
        // color: Module.__getString(memoryBuffer[i * 6 + 5]), // Adjust based on your actual implementation
      };
      particles.push(particle);
    }

    return particles;
  };

  // Methods
  const drawCircle = (ctx, x, y, radius, color) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
  };

  const clearCanvas = (canvas) => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const animate = () => {
    // Get the canvas and context
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    clearCanvas(canvas);

    universe.tick();

    fetchParticles().forEach((particle) => {
      drawCircle(
        ctx,
        particle.x,
        particle.y,
        particle.radius,
        'rgb(0, 85, 204)'
      );
    });
  };

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

  const initialiseUniverse = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("ERROR: Cannot load canvas");
    }

    setContext(canvas.getContext("2d"));

    // Initialise universe
    const newUniverse = new Universe(UNIVERSE_WIDTH, UNIVERSE_HEIGHT);
    setUniverse(newUniverse);
    newUniverse.generate_particles(INITIAL_PARTICLES);
  };

  const loadWasm = () => {
    init()
      .then((loadedWasm) => {
        setIsWasmLoaded(true);
        initialiseUniverse();
        setWasmMemory(loadedWasm.memory);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    loadWasm();
  }, []);

  return (
    <div>
      <br />
      <h2>Rust+ | Naive Algorithm | Simple Elastic Collision</h2>
      <br />
      <p>
        {isWasmLoaded ? "Wasm loaded" : "Wasm not loaded"} | {"  "}
        {!!universe ? "Universe loaded" : "Universe not loaded"} |{" "}
        {!!wasmMemory ? "Wasm memory loaded" : "Wasm memory not loaded"} | FPS:{" "}
        {fps} | Particles: {numberOfParticles}
      </p>
      <br></br>
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

export default NaiveRustImprovedSimpleElasticCollision;
