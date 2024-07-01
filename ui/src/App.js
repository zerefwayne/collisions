import React, { useState } from "react";

import "./App.css";
import NaiveJavascriptSimpleElasticCollision from "./javascript/NaiveJavascriptSimpleElasticCollision";
import NaiveJavascriptNoCollision from "./javascript/NaiveJavascriptNoCollision";
import BarnesHutJavascriptSimpleElasticCollision from "./javascript/BarnesHutJavascriptSimpleElasticCollision";

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
      <h1>Collisions</h1>
      <select value={selectedComponent} onChange={handleChange}>
        <option value="A">JS | Naive | No Collision</option>
        <option value="B">JS | Naive | Simple Elastic</option>
        <option value="C">JS | Barnes Hut | Simple Elastic</option>
      </select>
      {renderSelectedComponent()}
    </div>
  );
}

export default App;
