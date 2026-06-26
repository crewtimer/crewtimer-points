import React from 'react';
import Table from '@mui/material/Table';
import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Results } from 'crewtimer-common';
import { starsAndStripesPointsCalc } from '../calculators/StarsAndStripesPointsCalc';

/**
 * Render team points for the Stars and Stripes Regatta, based on the
 * per-boat-class scoring system defined in StarsAndStripesPointsCalc.
 */
export const StarsAndStripesPoints: React.FC<{ results: Results }> = ({ results }) => {
  const points = starsAndStripesPointsCalc(results);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Place</TableCell>
          <TableCell>Team Name</TableCell>
          <TableCell>Points</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {points.map((teamPoints) => (
          <TableRow key={teamPoints.team}>
            <TableCell>{teamPoints.place}</TableCell>
            <TableCell>{teamPoints.team}</TableCell>
            <TableCell>{teamPoints.points}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
