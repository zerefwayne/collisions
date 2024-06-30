import React, { useState } from "react";

import "./App.css";
import NaiveJavascriptSimpleElasticCollision from "./NaiveJavascriptSimpleElasticCollision";
import NaiveJavascriptNoCollision from "./NaiveJavascriptNoCollision";

function App() {
  const [selectedComponent, setSelectedComponent] = useState("A");

  const handleChange = (event) => {
    setSelectedComponent(event.target.value);
  };

  // Function to render selected component based on dropdown value
  const renderSelectedComponent = () => {
    switch (selectedComponent) {
      case "A":
        return <NaiveJavascriptSimpleElasticCollision />;
      case "B":
        return <NaiveJavascriptNoCollision />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <h1>Collisions</h1>
      <select value={selectedComponent} onChange={handleChange}>
        <option value="A">JS | Naive | Simple Elastic</option>
        <option value="B">JS | Naive | No Collision</option>
      </select>
      {renderSelectedComponent()}
    </div>
  );
}

export default App;
