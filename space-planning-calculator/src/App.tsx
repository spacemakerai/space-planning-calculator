import { useEffect, useState } from "react";
import "./App.css";
import { getConstraints } from "./extensionSdk";

function App() {
  const [constraints, setConstraints] = useState<string[]>([]);

  useEffect(() => {
    const fetchConstraints = async () => {
      const currentConstraints = await getConstraints();
      setConstraints(currentConstraints);
    };
    fetchConstraints();
  }, []);

  console.log(constraints);

  return (
    <div className="App">
      <h1>Space Planning Calculator</h1>
    </div>
  );
}

export default App;
