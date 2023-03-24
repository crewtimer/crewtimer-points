
import React from 'react';
import regattaResults from '../../tests/data/crewtimer-results-dev-r12033-export.json';
import { simplePointsCalc } from '../calculators/SimpleTeamPointsCalc';
import { Results } from '../common/CrewTimerTypes';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import SimpleTeamPoints from '../components/SimpleTeamPointsView';

export const App = () => {
    const [value, setValue] = React.useState('1');

    const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    const points = simplePointsCalc(regattaResults as unknown as Results);
    return <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleChange} aria-label="lab API tabs example">
                    <Tab label="Simple Points" value="1" />
                    <Tab label="Item Two" value="2" />
                    <Tab label="Item Three" value="3" />
                </TabList>
            </Box>
            <TabPanel value="1"><SimpleTeamPoints points={points} /></TabPanel>
            <TabPanel value="2">Add Your Points View Here</TabPanel>
            <TabPanel value="3">Add Your Points View Here</TabPanel>
        </TabContext>
    </Box>;
}
