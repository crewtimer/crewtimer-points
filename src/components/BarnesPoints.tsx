import React from 'react';
import Table from '@mui/material/Table';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CardActionArea,
  Icon,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  styled,
} from '@mui/material';
import { Results } from 'crewtimer-common';
import { barnesFullPointsCalc, barnesPointsCalc } from '../calculators/BarnesPointsCalc';
import { MSRAPointsByDivision } from './MSRATeamDivisionPoints';

const categories = ['Combined', "Women's Sweep", "Men's Sweep", "Women's Scull", "Men's Scull"];

const simpleCategories = ['Combined', 'Combined Sweep', 'Combined Scull', 'Women', 'Men'];

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
  useEightLanePoints?: boolean;
  coedTeamsOnlyInCombined?: boolean;
}

const getTableRows = (
  results: Results,
  useScaledEvents: boolean,
  useScullSweepCategories: boolean,
  coedTeamsOnlyInCombined?: boolean,
  useEightLanePoints?: boolean,
) => {
  if (useScullSweepCategories === true) {
    const points = barnesFullPointsCalc(results, useScaledEvents, coedTeamsOnlyInCombined, useEightLanePoints);
    return points.combined.map((_, idx) => (
      <StyledTableRow key={idx}>
        <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
          {points.combined[idx].place}
        </TableCell>
        <TableCell>{points.combined[idx].team}</TableCell>
        <TableCell align='right'>{points.combined[idx].points.toFixed(1)}</TableCell>
        <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
          {points.womensSweep[idx].place}
        </TableCell>
        <TableCell>{points.womensSweep[idx].team}</TableCell>
        <TableCell align='right'>{points.womensSweep[idx].points.toFixed(1)}</TableCell>
        <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
          {points.mensSweep[idx].place}
        </TableCell>
        <TableCell>{points.mensSweep[idx].team}</TableCell>
        <TableCell align='right'>{points.mensSweep[idx].points.toFixed(1)}</TableCell>
        <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
          {points.womensScull[idx].place}
        </TableCell>
        <TableCell>{points.womensScull[idx].team}</TableCell>
        <TableCell align='right'>{points.womensScull[idx].points.toFixed(1)}</TableCell>
        <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
          {points.mensScull[idx].place}
        </TableCell>
        <TableCell>{points.mensScull[idx].team}</TableCell>
        <TableCell align='right'>{points.mensScull[idx].points.toFixed(1)}</TableCell>
      </StyledTableRow>
    ));
  }

  const points = barnesPointsCalc(results, useScaledEvents, useEightLanePoints);
  return points.combined.map((_, idx) => (
    <StyledTableRow key={idx}>
      <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
        {points.combined[idx].place}
      </TableCell>
      <TableCell>{points.combined[idx].team}</TableCell>
      <TableCell align='right'>{points.combined[idx].points.toFixed(1)}</TableCell>
      <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
        {points.combinedSweep[idx].place}
      </TableCell>
      <TableCell>{points.combinedSweep[idx].team}</TableCell>
      <TableCell align='right'>{points.combinedSweep[idx].points.toFixed(1)}</TableCell>
      <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
        {points.combinedScull[idx].place}
      </TableCell>
      <TableCell>{points.combinedScull[idx].team}</TableCell>
      <TableCell align='right'>{points.combinedScull[idx].points.toFixed(1)}</TableCell>
      <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
        {points.womens[idx].place}
      </TableCell>
      <TableCell>{points.womens[idx].team}</TableCell>
      <TableCell align='right'>{points.womens[idx].points.toFixed(1)}</TableCell>
      <TableCell sx={{ borderLeft: '1px solid #808080' }} align='right'>
        {points.mens[idx].place}
      </TableCell>
      <TableCell>{points.mens[idx].team}</TableCell>
      <TableCell align='right'>{points.mens[idx].points.toFixed(1)}</TableCell>
    </StyledTableRow>
  ));
};

const BarnesPoints: React.FC<BarnesPointsProps> = ({
  results,
  useScaledEvents,
  useScullSweepCategories,
  coedTeamsOnlyInCombined,
  useEightLanePoints,
}) => {
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
      <TableBody>
        {getTableRows(results, useScaledEvents, useScullSweepCategories, coedTeamsOnlyInCombined, useEightLanePoints)}
      </TableBody>
    </Table>
  );
};

/**
 * Render team points calculated by the Barnes Points system for points categories including scull/sweep.
 * An event's point values are scaled by Novice/Junior/Varsity category. Allows eight lanes to earn points.
 *
 * @param points - An array of points results in sorted order.
 *
 */
export const MSRAChampionshipPoints: React.FC<{ results: Results }> = ({ results }) => {
  const [open, setOpen] = React.useState(true);

  return (
    <Stack>
      <Accordion square defaultExpanded sx={{ marginBottom: '25px' }}>
        <CardActionArea onClick={() => setOpen(!open)}>
          <AccordionSummary expandIcon={<Icon>{open ? '-' : '+'}</Icon>}>
            <Typography>Team Points Trophies</Typography>
          </AccordionSummary>
        </CardActionArea>
        <AccordionDetails>
          <BarnesPoints
            useScullSweepCategories={true}
            useScaledEvents={true}
            useEightLanePoints={true}
            coedTeamsOnlyInCombined={true}
            results={results}
          />
        </AccordionDetails>
      </Accordion>
      <MSRAPointsByDivision results={results} />
    </Stack>
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
