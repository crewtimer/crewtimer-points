import React from 'react';
import Table from '@mui/material/Table';
import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Results } from 'crewtimer-common';
import { clubPointsCalc } from '../calculators/ClubPointsCalc';

/**
 * Render club team points based on the simple per-boat-class scoring
 * system defined in ClubPointsCalc.
 */
export const ClubPoints: React.FC<{ results: Results }> = ({ results }) => {
  const points = clubPointsCalc(results);

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
