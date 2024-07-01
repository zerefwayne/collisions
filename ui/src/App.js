import React, { useState } from "react";

import "./App.css";
import NaiveJavascriptSimpleElasticCollision from "./javascript/NaiveJavascriptSimpleElasticCollision";
import NaiveJavascriptNoCollision from "./javascript/NaiveJavascriptNoCollision";
import BarnesHutJavascriptSimpleElasticCollision from "./javascript/BarnesHutJavascriptSimpleElasticCollision";

import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

function App() {
  const [selectedComponent, setSelectedComponent] = useState("C");

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
            </Select>
          </FormControl>
        </div>
      </div>
      {renderSelectedComponent()}
    </div>
  );
}

export default App;
