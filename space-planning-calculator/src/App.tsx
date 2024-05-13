import "./App.css";
import {
  getConstraintsPaths,
  getSiteLimitsPaths,
  renderGeoJSONs,
} from "./extensionSdk";
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
    const outputGeoJSON = generateOptions(siteLimitGeojson, constraintsGeojson);

    await renderGeoJSONs([outputGeoJSON]);
    console.log(constraintsGeojson, siteLimitGeojson);
  };

  return (
    <div className="App">
      <h2>Space Planning Calculator</h2>
      <button onClick={onClick}>Get Options</button>
    </div>
  );
}

export default App;
