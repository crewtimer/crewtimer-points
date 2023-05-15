import React from "react";
import simpleResults from "../../tests/data/crewtimer-results-dev-r12033-export.json";
// import simpleResultsWithBEntries from "../../tests/data/crewtimer-results-r12646-export.json";
import barnesJrNovice from "../../tests/data/crewtimer-results-dev-r12033-export-jr-nov-events.json";
import barnesTraditional from "../../tests/data/crewtimer-results-dev-r12033-export-with-B-entries.json";
import acaResults from "../../tests/data/crewtimer-results-aca-ted-houck-results.json";

import { Results } from "../common/CrewTimerTypes";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { PointsViewers } from "..";

const ResultsForViewer: { [key: string]: Results } = {
  Basic: simpleResults as unknown as Results,
  BarnesWeighted: barnesJrNovice as unknown as Results,
  BarnesTraditional: barnesTraditional as unknown as Results,
  ACA: acaResults as unknown as Results,
  ACANat: acaResults as unknown as Results,
};
export const App = () => {
  const [value, setValue] = React.useState("1");

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange}>
            {PointsViewers.map((viewer, i) => (
              <Tab key={viewer.key} label={viewer.name} value={`${i}`} />
            ))}
          </TabList>
        </Box>
        {PointsViewers.map((viewer, i) => {
          const Viewer = viewer.ui;
          const results = ResultsForViewer[viewer.key] || simpleResults;
          return (
            <TabPanel key={viewer.key} value={`${i}`}>
              <Viewer results={results} />
            </TabPanel>
          );
        })}
      </TabContext>
    </Box>
  );
};
