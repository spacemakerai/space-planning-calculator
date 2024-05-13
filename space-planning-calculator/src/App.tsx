import "./App.css";
import { getConstraintsPaths, getSiteLimitsPaths } from "./extensionSdk";
import {
  fetchConstraintsFootprints,
  fetchSiteLimitFootprint,
} from "./fetchGeometryHook";
import { generateOptions } from "./generativeDesignEngine";

function App() {
  const onClick = async () => {
    const constraintsPaths = await getConstraintsPaths();
    const siteLimit = await getSiteLimitsPaths();

    const constraintsGeojson = await fetchConstraintsFootprints(
      constraintsPaths
    );
    const siteLimitGeojson = await fetchSiteLimitFootprint(siteLimit);
    if (!siteLimitGeojson) return;
    generateOptions(siteLimitGeojson, constraintsGeojson);
    console.log(constraintsGeojson, siteLimitGeojson);
  };

  return (
    <div className="App">
      <h1>Space Planning Calculator</h1>
      <button onClick={onClick}>Get Options</button>
    </div>
  );
}

export default App;
