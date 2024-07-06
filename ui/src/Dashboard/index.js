/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";

import Paper from "@mui/material/Paper";
import {
  Button,
  TextField,
  Slider,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import "./style.css";

const Dashboard = ({
  handleDecrement,
  handleIncrement,
  handleClick,
  handleRestitutionChange,
  handleIsWallElastic,
  tick,
  isWallElastic,
  coefficientOfRestitution,
  particlesLen,
}) => {
  // References
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);

  const [universeWidth, setUniverseWidth] = useState(0);
  const [universeHeight, setUniverseHeight] = useState(0);

  // State - Dashboard
  const [context, setContext] = useState(null);
  const [fps, setFps] = useState(0);
  const [step, setStep] = useState(100);

  useEffect(() => {
    initialiseUniverseResizeListener();
  }, []);

  useEffect(() => {
    let animationFrameId;
    let lastTimestamp = performance.now();
    let frameCount = 0;
    let currentFps = 0;

    const render = (timestamp) => {
      const canvas = canvasRef.current;

      clearCanvas(canvas);
      tick(canvasRef);

      // Calculate FPS
      frameCount++;
      const elapsed = timestamp - lastTimestamp;
      if (elapsed >= 1000) {
        currentFps = (frameCount / elapsed) * 1000; // Calculate FPS
        frameCount = 0;
        lastTimestamp = timestamp;
        setFps(Math.floor(currentFps)); // Display FPS
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    if (context) {
      animationFrameId = window.requestAnimationFrame(render);
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [tick, context, universeWidth, universeHeight]);

  // Handler methods
  const handleStepChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setStep(value);
    }
  };

  // Helper methods
  const initialiseUniverseResizeListener = () => {
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
    };

    // Initial canvas size adjustment
    resizeCanvas();

    // Adjust canvas size when the window is resized
    window.addEventListener("resize", resizeCanvas);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  };

  const clearCanvas = (canvas) => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="scene-container">
      <div className="canvas-container">
        <div ref={canvasContainerRef} className="canvas-render">
          <canvas ref={canvasRef} id="my-canvas" onClick={handleClick}></canvas>
        </div>
        <footer>
          <p>{fps}fps</p>
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
            Number of particles: {particlesLen}
          </header>
          <div
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
              onClick={() => handleDecrement(step)}
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
            <Button
              variant="contained"
              size="small"
              onClick={() => handleIncrement(canvasRef, step)}
            >
              +
            </Button>
          </div>
        </Paper>
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
            Coeffficient of Restitution: {coefficientOfRestitution}
          </header>
          <div
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
          </div>
        </Paper>
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
          <div
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
                    checked={isWallElastic}
                    onChange={handleIsWallElastic}
                  />
                }
                label="Collisions with wall are elastic"
              />
            </FormGroup>
          </div>
        </Paper>
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
          <header
            style={{
              marginBottom: "1rem",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <InfoOutlinedIcon
              style={{ marginRight: "5px", color: "rgb(25, 118, 210)" }}
            />{" "}
            Instructions
          </header>
          <div style={{ color: "#aaa" }}>
            <p>Click in the collision area to launch a particle.</p>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default Dashboard;
