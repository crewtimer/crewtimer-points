import React from 'react';
import Table from '@mui/material/Table';
import { TableBody, TableCell, TableHead, TableRow, styled } from '@mui/material';
import { Results } from 'crewtimer-common';
import { hebdaPointsCalc, wyHiPointsCalc } from '../calculators/WyandottePointsCalc';

const simpleCategories = ['Combined Points', "Women's Points", "Men's Points"];

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const HeaderTableCell = styled(TableCell)(() => ({
  fontWeight: 'bold',
}));

export interface WyandottePointsProps {
  results: Results;
  isHebda: boolean;
}

const wyGetTableRows = (results: Results, isHebda: boolean) => {
  if (isHebda === true) {
    const points = hebdaPointsCalc(results);
    return points.combined.map((_, idx) => (
      <StyledTableRow key={idx}>
        <TableCell>{idx + 1}</TableCell>
        <TableCell>{points.combined[idx].team}</TableCell>
        <TableCell align='right'>{points.combined[idx].points.toFixed(1)}</TableCell>
        <TableCell>{points.womens[idx].team}</TableCell>
        <TableCell align='right'>{points.womens[idx].points.toFixed(1)}</TableCell>
        <TableCell>{points.mens[idx].team}</TableCell>
        <TableCell align='right'>{points.mens[idx].points.toFixed(1)}</TableCell>
      </StyledTableRow>
    ));
  }

  const points = wyHiPointsCalc(results);
  return points.combined.map((_, idx) => (
    <StyledTableRow key={idx}>
      <TableCell>{idx + 1}</TableCell>
      <TableCell>{points.combined[idx].team}</TableCell>
      <TableCell align='right'>{points.combined[idx].points.toFixed(1)}</TableCell>
      <TableCell>{points.womens[idx].team}</TableCell>
      <TableCell align='right'>{points.womens[idx].points.toFixed(1)}</TableCell>
      <TableCell>{points.mens[idx].team}</TableCell>
      <TableCell align='right'>{points.mens[idx].points.toFixed(1)}</TableCell>
    </StyledTableRow>
  ));
};

const WyandottePoints: React.FC<WyandottePointsProps> = ({ results, isHebda }) => {
  const pointsCategories = simpleCategories;
  return (
    <Table size='small'>
      <TableHead>
        <TableRow>
          <HeaderTableCell key='place'>Place</HeaderTableCell>
          {pointsCategories.map((category) => [
            <HeaderTableCell key={category}>{category}</HeaderTableCell>,
            <HeaderTableCell key={category + '_padding'}></HeaderTableCell>,
          ])}
        </TableRow>
      </TableHead>
      <TableBody>{wyGetTableRows(results, isHebda)}</TableBody>
    </Table>
  );
};

/**
 * Render team points calculated by the Hebda Cup points system for all points categories.
 * All events types (Novice/Varsity/Junior/etc) are weighted equially.
 *
 * @param points - An array of points results in sorted order.
 *
 */
export const HebdaPoints: React.FC<{ results: Results }> = ({ results }) => {
  return <WyandottePoints results={results} isHebda={true} />;
};

/**
 * Render team points calculated by the Wyandotte System of Scoring for all points categories.
 * This is a modified Barnes system developed by the Wyandotte Boat Club.
 * All events types (Novice/Senior/Junior/etc) are weighted equially.
 *
 * @param points - An array of points results in sorted order.
 *
 */
export const WyHiPoints: React.FC<{ results: Results }> = ({ results }) => {
  return <WyandottePoints results={results} isHebda={false} />;
};
