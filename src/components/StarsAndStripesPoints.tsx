import React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Results } from 'crewtimer-common';
import { starsAndStripesPointsCalc } from '../calculators/StarsAndStripesPointsCalc';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const HeaderTableCell = styled(TableCell)(() => ({
  fontWeight: 'bold',
}));

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
          <HeaderTableCell>Place</HeaderTableCell>
          <HeaderTableCell>Team Name</HeaderTableCell>
          <HeaderTableCell>Points</HeaderTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {points.map((teamPoints) => (
          <StyledTableRow key={teamPoints.team}>
            <TableCell>{teamPoints.place}</TableCell>
            <TableCell>{teamPoints.team}</TableCell>
            <TableCell>{teamPoints.points}</TableCell>
          </StyledTableRow>
        ))}
      </TableBody>
    </Table>
  );
};
