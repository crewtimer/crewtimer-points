import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { Results } from 'crewtimer-common';
import { PointsViewers } from '..';

function downloadAsJson(object: Results, fileName: string) {
  const json = JSON.stringify(object, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

const LiveData: React.FC = () => {
  const [mobileId, setMobileId] = useState('');
  const [data, setData] = useState<Results | undefined>();
  const [loading, setLoading] = useState(false);
  const [viewerKey, setViewerKey] = useState('None');

  const fetchData = async () => {
    setLoading(true);
    setData(undefined);

    try {
      let url = `https://crewtimer-results.firebaseio.com/results/${mobileId}.json`;
      if (mobileId.startsWith('t.')) {
        url = `https://crewtimer-results-dev.firebaseio.com/results/${mobileId.substring(2)}.json`;
      }
      const response = await fetch(url);
      const data = (await response.json()) as Results;
      setData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMobileId(event.target.value);
  };

  const onViewerChange = (event: SelectChangeEvent<string>): void => {
    setViewerKey(event.target.value);
  };

  const saveData = () => {
    if (!data) {
      return;
    }
    data.P = { S: {}, Waypoints: [] }; // not useful
    downloadAsJson(data, `crewtimer-results-${mobileId}.json`);
  };

  const NullViewer = () => {
    return <></>;
  };
  const PointsViewer = PointsViewers.find((viewer) => viewer.key === viewerKey)?.ui || NullViewer;

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Stack alignItems='start'>
        <Stack direction='row' sx={{ paddingBottom: '1em' }}>
          <Tooltip title='crewtimer.com regatta Mobile ID'>
            <TextField
              size='small'
              label='Mobile ID'
              // margin='dense'
              variant='outlined'
              value={mobileId}
              onChange={handleUrlChange}
            />
          </Tooltip>
          <Button
            disabled={loading || mobileId.length < 5}
            variant='contained'
            color='primary'
            onClick={fetchData}
            sx={{ marginLeft: '2em' }}
          >
            Fetch Data
          </Button>
          <Button
            disabled={data === undefined}
            variant='outlined'
            color='primary'
            onClick={saveData}
            sx={{ marginLeft: '2em' }}
          >
            Export JSON
          </Button>
          {loading && <CircularProgress />}
          <FormControl sx={{ minWidth: 200, marginLeft: '2em' }}>
            <InputLabel id='points-engine'>Points Engine</InputLabel>
            <Select
              size='small'
              labelId='points-engine'
              disabled={data === undefined}
              variant='outlined'
              value={viewerKey}
              label='Points Engine'
              onChange={onViewerChange}
            >
              <MenuItem value='None'>None</MenuItem>
              {PointsViewers.map((item) => (
                <MenuItem key={item.key} value={item.key}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>
      {data && (
        <Box sx={{ width: '100%', typography: 'body1' }}>
          <Divider />
          <Box sx={{ paddingTop: '0.5em', paddingLeft: '2em', paddingRight: '2em' }}>
            <PointsViewer results={data} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default LiveData;
