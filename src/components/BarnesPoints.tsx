import React from 'react';
import Table from '@mui/material/Table';
import { TableBody, TableCell, TableHead, TableRow, styled } from '@mui/material';
import { Results } from 'crewtimer-common';
import { barnesFullPointsCalc, barnesPointsCalc } from '../calculators/BarnesPointsCalc';

const categories = [
  'Combined Points',
  "Women's Sweep Points",
  "Men's Sweep Points",
  "Women's Scull Points",
  "Men's Scull Points",
];

const simpleCategories = ['Combined Points', "Women's Points", "Men's Points"];

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const HeaderTableCell = styled(TableCell)(() => ({
  fontWeight: 'bold',
}));

export interface BarnesPointsProps {
  results: Results;
  useScaledEvents: boolean;
  useScullSweepCategories: boolean;
  coedTeamsOnlyInCombined?: boolean;
}

const getTableRows = (
  results: Results,
  useScaledEvents: boolean,
  useScullSweepCategories: boolean,
  coedTeamsOnlyInCombined?: boolean,
) => {
  if (useScullSweepCategories === true) {
    const points = barnesFullPointsCalc(results, useScaledEvents, coedTeamsOnlyInCombined);
    return points.combined.map((_, idx) => (
      <StyledTableRow key={idx}>
        <TableCell sx={{ borderLeft: '1px solid #808080' }}></TableCell>
        <TableCell align='right'>{points.combined[idx].place}</TableCell>
        <TableCell>{points.combined[idx].team}</TableCell>
        <TableCell align='right'>{points.combined[idx].points}</TableCell>
        <TableCell sx={{ borderLeft: '1px solid #808080' }}></TableCell>
        <TableCell align='right'>{points.womensSweep[idx].place}</TableCell>
        <TableCell>{points.womensSweep[idx].team}</TableCell>
        <TableCell align='right'>{points.womensSweep[idx].points}</TableCell>
        <TableCell sx={{ borderLeft: '1px solid #808080' }}></TableCell>
        <TableCell align='right'>{points.mensSweep[idx].place}</TableCell>
        <TableCell>{points.mensSweep[idx].team}</TableCell>
        <TableCell align='right'>{points.mensSweep[idx].points}</TableCell>
        <TableCell sx={{ borderLeft: '1px solid #808080' }}></TableCell>
        <TableCell align='right'>{points.womensScull[idx].place}</TableCell>
        <TableCell>{points.womensScull[idx].team}</TableCell>
        <TableCell align='right'>{points.womensScull[idx].points}</TableCell>
        <TableCell sx={{ borderLeft: '1px solid #808080' }}></TableCell>
        <TableCell align='right'>{points.mensScull[idx].place}</TableCell>
        <TableCell>{points.mensScull[idx].team}</TableCell>
        <TableCell align='right'>{points.mensScull[idx].points}</TableCell>
      </StyledTableRow>
    ));
  }

  const points = barnesPointsCalc(results, useScaledEvents);
  return points.combined.map((_, idx) => (
    <StyledTableRow key={idx}>
      <TableCell sx={{ borderLeft: '1px solid #808080' }}></TableCell>
      <TableCell align='right'>{points.combined[idx].place}</TableCell>
      <TableCell>{points.combined[idx].team}</TableCell>
      <TableCell align='right'>{points.combined[idx].points}</TableCell>
      <TableCell sx={{ borderLeft: '1px solid #808080' }}></TableCell>
      <TableCell align='right'>{points.womens[idx].place}</TableCell>
      <TableCell>{points.womens[idx].team}</TableCell>
      <TableCell align='right'>{points.womens[idx].points}</TableCell>
      <TableCell sx={{ borderLeft: '1px solid #808080' }}></TableCell>
      <TableCell align='right'>{points.mens[idx].place}</TableCell>
      <TableCell>{points.mens[idx].team}</TableCell>
      <TableCell align='right'>{points.mens[idx].points}</TableCell>
    </StyledTableRow>
  ));
};

const BarnesPoints: React.FC<BarnesPointsProps> = ({
  results,
  useScaledEvents,
  useScullSweepCategories,
  coedTeamsOnlyInCombined,
}) => {
  const pointsCategories = useScullSweepCategories ? categories : simpleCategories;
  return (
    <Table size='small'>
      <TableHead>
        <TableRow>
          {pointsCategories.map((category) => [
            <HeaderTableCell colSpan={2} align='right' key='place'>Place</HeaderTableCell>,
            <HeaderTableCell colSpan={2} key={category}>{category}</HeaderTableCell>,
          ])}
        </TableRow>
      </TableHead>
      <TableBody>{getTableRows(results, useScaledEvents, useScullSweepCategories, coedTeamsOnlyInCombined)}</TableBody>
    </Table>
  );
};

/**
 * Render team points calculated by the Barnes Points system for points categories including scull/sweep.
 * An event's point values are scaled by Novice/Junior/Varsity category.
 *
 * @param points - An array of points results in sorted order.
 *
 */
export const BarnesFullWeightedCoedCombined: React.FC<{ results: Results }> = ({ results }) => {
  return (
    <BarnesPoints
      useScullSweepCategories={true}
      useScaledEvents={true}
      coedTeamsOnlyInCombined={true}
      results={results}
    />
  );
};

/**
 * Render team points calculated by the Barnes Points system for points categories including scull/sweep.
 * An event's point values are scaled by Novice/Junior/Varsity category.
 *
 * @param points - An array of points results in sorted order.
 *
 */
export const BarnesFullWeighted: React.FC<{ results: Results }> = ({ results }) => {
  return <BarnesPoints useScullSweepCategories={true} useScaledEvents={true} results={results} />;
};

/**
 * Render team points calculated by the Barnes Points system for basic points categories.
 * An event's point values are scaled by Novice/Junior/Varsity category.
 *
 * @param points - An array of points results in sorted order.
 *
 */
export const BarnesSimpleWeighted: React.FC<{ results: Results }> = ({ results }) => {
  return <BarnesPoints useScullSweepCategories={false} useScaledEvents={true} results={results} />;
};

/**
 * Render team points calculated by the Barnes Points system for all points categories.
 * All events types (Novice/Varsity/Junior/etc) are weighted equially.
 *
 * @param points - An array of points results in sorted order.
 *
 */
export const BarnesPointsTraditional: React.FC<{ results: Results }> = ({ results }) => {
  return <BarnesPoints useScullSweepCategories={true} useScaledEvents={false} results={results} />;
};
