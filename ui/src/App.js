import React, { useState } from "react";

import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import "./App.css";

import JavascriptNoCollision from "./scenarios/javascript/JavascriptNoCollision";
import JavascriptNaive from "./scenarios/javascript/JavascriptNaive";
import JavascriptBarnesHut from "./scenarios/javascript/JavascriptBarnesHut";

import RustNaive from "./scenarios/rust/RustNaive";
import RustPlusNaive from "./scenarios/rust/RustPlusNaive";

function App() {
  const [selectedComponent, setSelectedComponent] = useState("E");

  const handleChange = (event) => {
    setSelectedComponent(event.target.value);
  };

  // Function to render selected component based on dropdown value
  const renderSelectedComponent = () => {
    switch (selectedComponent) {
      case "A":
        return <JavascriptNoCollision />;
      case "B":
        return <JavascriptNaive />;
      case "C":
        return <JavascriptBarnesHut />;
      case "D":
        return <RustNaive />;
      case "E":
        return <RustPlusNaive />;
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
            className="dropdown"
          >
            <Select
              value={selectedComponent}
              onChange={handleChange}
              sx={{ backgroundColor: "#222", color: "white" }}
            >
              <MenuItem value="A">Javascript | No collision</MenuItem>
              <MenuItem value="B">Javascript | Naive Algorithm</MenuItem>
              <MenuItem value="C">Javascript | Barnes Hut Algorithm</MenuItem>
              <MenuItem value="D">Rust | Naive Algorithm</MenuItem>
              <MenuItem value="E">Rust+ | Naive Algorithm</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>
      <div className="scene">{renderSelectedComponent()}</div>
    </div>
  );
}

export default App;
