import React, { useState } from "react";

import "./App.css";
import NaiveJavascriptSimpleElasticCollision from "./NaiveJavascriptSimpleElasticCollision";
import NaiveJavascriptNoCollision from "./NaiveJavascriptNoCollision";
import BarnesHutJavascriptSimpleElasticCollision from "./BarnesHutJavascriptSimpleElasticCollision";

import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import RustNoCollision from "./RustNoCollision";

function App() {
  const [selectedComponent, setSelectedComponent] = useState("D");

  const handleChange = (event) => {
    setSelectedComponent(event.target.value);
  };

  // Function to render selected component based on dropdown value
  const renderSelectedComponent = () => {
    switch (selectedComponent) {
      case "A":
        return <NaiveJavascriptNoCollision />;
      case "B":
        return <NaiveJavascriptSimpleElasticCollision />;
      case "C":
        return <BarnesHutJavascriptSimpleElasticCollision />;
      case "D":
        return <RustNoCollision />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <div className="header">
        <div className="logo">Collisions</div>
        <div>
          <FormControl
            sx={{ m: 1, minWidth: 300 }}
            size="small"
            class="dropdown"
          >
            <Select
              value={selectedComponent}
              onChange={handleChange}
              sx={{ backgroundColor: "#222", color: "white" }}
            >
              <MenuItem value="A">JS | Naive | No Collision</MenuItem>
              <MenuItem value="B">JS | Naive | Simple Elastic</MenuItem>
              <MenuItem value="C">JS | Barnes Hut | Simple Elastic</MenuItem>
              <MenuItem value="D">Rust | No Collision</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>
      <div className="scene">{renderSelectedComponent()}</div>
    </div>
  );
}

export default App;
