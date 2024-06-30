import { useEffect, useRef } from "react";

const NaiveJavascript = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");

      ctx.beginPath();
      ctx.arc(200, 200, 20, 0, 2 * Math.PI);
      ctx.closePath();

      ctx.fillStyle = "white";
      ctx.fill();
    }
  }, []);

  return (
    <div>
      <h2>Naive Javascript Implementation</h2>
      <canvas
        ref={canvasRef}
        id="my-canvas"
        height="500"
        width="500"
        style={{ border: "2px solid #444" }}
      ></canvas>
    </div>
  );
};

export default NaiveJavascript;
