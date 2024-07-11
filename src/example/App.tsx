import React from 'react';
import simpleResults from '../../tests/data/crewtimer-results-dev-r12033-export.json';
import barnesJrNovice from '../../tests/data/crewtimer-results-r12649.json';
// import barnesJrNovice from '../../tests/data/crewtimer-results-dev-r12033-export-jr-nov-events.json';
// import barnesCoedAndSingleGender from '../../tests/data/crewtimer-results-dev-r12033-export-coed-single-gender-teams.json';
import barnesCoedAndSingleGender from '../../tests/data/crewtimer-results-r12648.json';
import barnesTraditional from '../../tests/data/crewtimer-results-dev-r12033-export-with-B-entries.json';
import acaResults from '../../tests/data/crewtimer-results-aca-ted-houck-results.json';
import firaResults from '../../tests/data/crewtimer-results-r12581-fira-export.json';
import midwestResults from '../../tests/data/crewtimer-results-r12648.json';
import hebdaResults from '../../tests/data/crewtimer-results-r12672-hebda23.json';
import wyHiResults from '../../tests/data/crewtimer-results-r12676-wyhi23.json';
import sprintsResults from '../../tests/data/crewtimer-results-r12676-wyhi23.json';

import { Results } from 'crewtimer-common';
import Box from '@mui/material/Box';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import { PointsViewers } from '..';
import LiveData from './LiveData';
import './App.css';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { UseDatum } from 'react-usedatum';

/**
 * Global shared state for test page selection
 */
const [useTestPage] = UseDatum('ACA');

const ResultsForViewer: { [key: string]: Results } = {
  Basic: simpleResults as unknown as Results,
  MSRAChampionshipPoints: barnesCoedAndSingleGender as unknown as Results,
  BarnesFullWeighted: barnesJrNovice as unknown as Results,
  BarnesSimpleWeighted: barnesJrNovice as unknown as Results,
  BarnesTraditional: barnesTraditional as unknown as Results,
  ACA: acaResults as unknown as Results,
  ACANat: acaResults as unknown as Results,
  FIRATraditional: firaResults as unknown as Results,
  MSRAPointsByDivision: midwestResults as unknown as Results,
  HebdaPoints: hebdaResults as unknown as Results,
  WyHiPoints: wyHiResults as unknown as Results,
  SprintsPoints: sprintsResults as unknown as Results,
};

const Viewers = [{ key: 'Live', name: 'Live Data', ui: LiveData }, ...PointsViewers];

interface SelectTestPageProps {
  sx?: SxProps<Theme>;
}
export const SelectTestPage: React.FC<SelectTestPageProps> = ({ sx }) => {
  const [testPage, setTestPage] = useTestPage();

  return (
    <FormControl sx={{ minWidth: 200 }}>
      <InputLabel id='points-engine-label'>Test Page</InputLabel>
      <Select
        id='points-engine'
        size='small'
        labelId='points-engine-label'
        variant='outlined'
        value={testPage}
        label='Points Engine'
        name='points-engine'
        onChange={(event) => setTestPage(event.target.value)}
        sx={sx}
      >
        {Viewers.map((item) => (
          <MenuItem key={item.key} value={item.key}>
            {item.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export const App = () => {
  const [testPage] = useTestPage();

  const Viewer = Viewers.find((viewer) => testPage === viewer.key)?.ui;
  const results = ResultsForViewer[testPage] || simpleResults;
  const viewer = Viewer ? <Viewer results={results} /> : <></>;
  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <SelectTestPage sx={{ marginBottom: '1em' }} />
      {viewer}
    </Box>
  );
};
