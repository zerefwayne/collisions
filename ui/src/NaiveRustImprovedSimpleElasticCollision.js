/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";

import Paper from "@mui/material/Paper";
import { Button, TextField } from "@mui/material";

import "./styles.css";

import init, { Universe } from "collisions-src";

const NaiveRustImprovedSimpleElasticCollision = () => {
  // Constants
  const INITIAL_PARTICLES = 4000;

  // References
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);

  // State variables
  const [context, setContext] = useState(null);
  const [step, setStep] = useState(100);
  const [isWasmLoaded, setIsWasmLoaded] = useState(false);
  const [universe, setUniverse] = useState(null);
  const [wasmMemory, setWasmMemory] = useState(null);
  const [fps, setFps] = useState(0);
  const [numberOfParticles, setNumberOfParticles] = useState(0);

  const [UNIVERSE_WIDTH, setUniverseWidth] = useState(600);
  const [UNIVERSE_HEIGHT, setUniverseHeight] = useState(600);

  const handleClick = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;
    universe.generate_particle(offsetX, offsetY);
  };

  const handleDecrement = () => {
    if (universe) {
      universe.decrease_particles(step);
    }
  };

  const handleStepChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setStep(value);
    }
  };

  const handleIncrement = () => {
    universe.generate_particles(step);
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
      drawCircle(ctx, particle.x, particle.y, particle.radius, particle.color);
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

    const container = canvasContainerRef.current;

    newUniverse.resize_universe(container.clientWidth, container.clientHeight);
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
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      setContext(ctx);
    }

    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      setUniverseHeight(container.clientHeight);
      setUniverseWidth(container.clientWidth);

      if (universe) {
        universe.resize_universe(container.clientWidth, container.clientHeight);
      }
    };

    // Initial canvas size adjustment
    resizeCanvas();

    // Adjust canvas size when the window is resized
    window.addEventListener("resize", resizeCanvas);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  useEffect(() => {
    loadWasm();
  }, []);

  return (
    <div className="scene-container">
      <div className="canvas-container">
        <div ref={canvasContainerRef} className="canvas-render">
          <canvas ref={canvasRef} id="my-canvas" onClick={handleClick}></canvas>
        </div>
        <footer>
          <p>{isWasmLoaded ? "Wasm loaded" : "Wasm not loaded"}</p>
          <p>{!!universe ? "Universe loaded" : "Universe not loaded"}</p>
          <p>
            {!!wasmMemory ? "Wasm memory loaded" : "Wasm memory not loaded"}
          </p>
          <p>{fps} FPS</p>
        </footer>
      </div>
      <div className="controls-container">
        <Paper
          elevation={0}
          square
          sx={{
            backgroundColor: "#0a0a0a",
            color: "white",
            padding: "1rem",
            borderBottom: "1px solid #222",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <header style={{ marginBottom: "1rem" }}>
            Number of particles: {numberOfParticles}
          </header>
          <body
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <Button
              variant="contained"
              size="small"
              sx={{}}
              onClick={handleDecrement}
            >
              -
            </Button>
            <TextField
              type="number"
              size="small"
              value={step}
              onChange={handleStepChange}
              inputProps={{ min: 0 }}
              style={{ margin: "0 10px" }}
              sx={{
                backgroundColor: "#111",
                "& input": { color: "white" },
              }}
            />
            <Button variant="contained" size="small" onClick={handleIncrement}>
              +
            </Button>
          </body>
        </Paper>
        {/* <Paper
          elevation={0}
          square
          sx={{
            backgroundColor: "#0a0a0a",
            color: "white",
            padding: "1rem",
            borderBottom: "1px solid #222",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <header style={{ marginBottom: "1rem" }}>
            Coeffficient of Restitution: {coefficientOfRestitution}
          </header>
          <body
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Slider
              defaultValue={1.0}
              step={0.01}
              min={0}
              max={1}
              valueLabelDisplay="off"
              onChange={handleRestitutionChange}
            />
          </body>
        </Paper> */}
        {/* <Paper
          elevation={0}
          square
          sx={{
            backgroundColor: "#0a0a0a",
            color: "white",
            padding: "1rem",
            borderBottom: "1px solid #222",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <body
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={IsWallElastic}
                    onChange={handleIsWallElastic}
                  />
                }
                label="Collisions with wall are elastic"
              />
            </FormGroup>
          </body>
        </Paper> */}
      </div>
    </div>
  );
};

export default NaiveRustImprovedSimpleElasticCollision;
