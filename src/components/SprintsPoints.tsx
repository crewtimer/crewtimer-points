import React from 'react';
import Table from '@mui/material/Table';
import { TableBody, TableCell, TableHead, TableRow, styled } from '@mui/material';
import { Results } from 'crewtimer-common';
import { SprintsFullPointsCalc, SprintsPointsCalc, TeamPoints } from '../calculators/SprintsPointsCalc';

const categories = ['Overall', "Women's Sweep", "Men's Sweep", "Women's Scull", "Men's Scull", 'Junior'];

const simpleCategories = ['Overall Team Points Trophy', 'Kuperman Cup', 'Junior Team Trophy'];

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const HeaderTableCell = styled(TableCell)(() => ({
  fontWeight: 'bold',
}));

export interface SprintsPointsProps {
  results: Results;
  useScullSweepCategories: boolean;
  coedTeamsOnlyInCombined?: boolean;
}

const getTableRows = (results: Results, useScullSweepCategories: boolean, coedTeamsOnlyInCombined?: boolean) => {
  const sortPoints = (points: TeamPoints[]) => points.sort((a, b) => b.points - a.points);

  if (useScullSweepCategories === true) {
    const points = SprintsFullPointsCalc(results, coedTeamsOnlyInCombined);

    // Sorting each points category
    const combinedPoints = sortPoints(points.combined);
    const womensSweepPoints = sortPoints(points.womensSweep);
    const mensSweepPoints = sortPoints(points.mensSweep);
    const womensScullPoints = sortPoints(points.womensScull);
    const mensScullPoints = sortPoints(points.mensScull);
    const juniorPoints = sortPoints(points.junior);

    return combinedPoints.map((_, idx) => (
      <StyledTableRow key={idx}>
        <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
          {combinedPoints[idx].place}
        </TableCell>
        <TableCell>{combinedPoints[idx].team}</TableCell>
        <TableCell align='right'>{combinedPoints[idx].points.toFixed(1)}</TableCell>
        <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
          {womensSweepPoints[idx].place}
        </TableCell>
        <TableCell>{womensSweepPoints[idx].team}</TableCell>
        <TableCell align='right'>{womensSweepPoints[idx].points.toFixed(1)}</TableCell>
        <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
          {mensSweepPoints[idx].place}
        </TableCell>
        <TableCell>{mensSweepPoints[idx].team}</TableCell>
        <TableCell align='right'>{mensSweepPoints[idx].points.toFixed(1)}</TableCell>
        <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
          {womensScullPoints[idx].place}
        </TableCell>
        <TableCell>{womensScullPoints[idx].team}</TableCell>
        <TableCell align='right'>{womensScullPoints[idx].points.toFixed(1)}</TableCell>
        <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
          {mensScullPoints[idx].place}
        </TableCell>
        <TableCell>{mensScullPoints[idx].team}</TableCell>
        <TableCell align='right'>{mensScullPoints[idx].points.toFixed(1)}</TableCell>
        <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
          {juniorPoints[idx].place}
        </TableCell>
        <TableCell>{juniorPoints[idx].team}</TableCell>
        <TableCell align='right'>{juniorPoints[idx].points.toFixed(1)}</TableCell>
      </StyledTableRow>
    ));
  }

  const points = SprintsPointsCalc(results);

  // Sorting each points category
  const combinedPoints = sortPoints(points.combined);
  const combinedScullPoints = sortPoints(points.combinedScull);
  const juniorPoints = sortPoints(points.junior);

  return combinedPoints.map((_, idx) => (
    <StyledTableRow key={idx}>
      <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
        {combinedPoints[idx].place}
      </TableCell>
      <TableCell>{combinedPoints[idx].team}</TableCell>
      <TableCell align='right'>{combinedPoints[idx].points.toFixed(1)}</TableCell>
      <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
        {combinedScullPoints[idx].place}
      </TableCell>
      <TableCell>{combinedScullPoints[idx].team}</TableCell>
      <TableCell align='right'>{combinedScullPoints[idx].points.toFixed(1)}</TableCell>
      <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
        {juniorPoints[idx].place}
      </TableCell>
      <TableCell>{juniorPoints[idx].team}</TableCell>
      <TableCell align='right'>{juniorPoints[idx].points.toFixed(1)}</TableCell>
    </StyledTableRow>
  ));
};

const SprintsPoints: React.FC<SprintsPointsProps> = ({ results, useScullSweepCategories, coedTeamsOnlyInCombined }) => {
  const pointsCategories = useScullSweepCategories ? categories : simpleCategories;
  return (
    <Table size='small'>
      <TableHead>
        <TableRow>
          <HeaderTableCell align='center' colSpan={pointsCategories.length * 3}>{`Points Trophies`}</HeaderTableCell>
        </TableRow>
        <TableRow>
          {pointsCategories.map((category) => [
            <HeaderTableCell align='right' key='place'>
              Place
            </HeaderTableCell>,
            <HeaderTableCell colSpan={2} key={category}>
              {category}
            </HeaderTableCell>,
          ])}
        </TableRow>
      </TableHead>
      <TableBody>{getTableRows(results, useScullSweepCategories, coedTeamsOnlyInCombined)}</TableBody>
    </Table>
  );
};

/**
 * Render team points calculated by the Sprints Points system for all points categories.
 * All events types (Novice/Varsity/Junior/etc) are weighted equially.
 *
 * @param points - An array of points results in sorted order.
 *
 */
export const SprintsPointsTraditional: React.FC<{ results: Results }> = ({ results }) => {
  return <SprintsPoints useScullSweepCategories={false} results={results} />;
};
