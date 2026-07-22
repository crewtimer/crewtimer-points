import { Table, TableHead, TableRow, TableCell, TableBody, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Results } from 'crewtimer-common';
import React from 'react';
import { hraPointsCalc } from '../calculators/HRAPointsCalc';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child th': {
    border: 0,
  },
}));

const HeaderTableCell = styled(TableCell)(() => ({
  fontWeight: 'bold',
}));

const DividerCell = styled(TableCell)(() => ({
  borderLeft: '1px solid #808080',
}));

/**
 * HRA Points Visualizer
 *
 * Displays three side-by-side rankings:
 *   • Overall (combined sweep + sculling)
 *   • Sweep events only
 *   • Sculling events only
 *
 * Based on HRA Rules for Point Series Regattas (modified US Rowing Points System).
 */
export const HRAPoints: React.FC<{ results: Results }> = ({ results }) => {
  const points = hraPointsCalc(results);

  const maxRows = Math.max(points.overall.length, points.sweep.length, points.sculling.length);

  const rows: JSX.Element[] = [];
  for (let i = 0; i < maxRows; i++) {
    rows.push(
      <StyledTableRow key={i}>
        {/* Overall */}
        <DividerCell align='right'>{points.overall[i]?.place ?? ''}</DividerCell>
        <TableCell>{points.overall[i]?.team ?? ''}</TableCell>
        <TableCell align='right'>{points.overall[i]?.points.toFixed(1) ?? ''}</TableCell>

        {/* Sweep */}
        <DividerCell align='right'>{points.sweep[i]?.place ?? ''}</DividerCell>
        <TableCell>{points.sweep[i]?.team ?? ''}</TableCell>
        <TableCell align='right'>{points.sweep[i]?.points.toFixed(1) ?? ''}</TableCell>

        {/* Sculling */}
        <DividerCell align='right'>{points.sculling[i]?.place ?? ''}</DividerCell>
        <TableCell>{points.sculling[i]?.team ?? ''}</TableCell>
        <TableCell align='right'>{points.sculling[i]?.points.toFixed(1) ?? ''}</TableCell>
      </StyledTableRow>,
    );
  }

  return (
    <Stack alignItems='center' spacing={1}>
      <Typography variant='h6'>HRA Masters Points Series</Typography>
      <Table size='small' sx={{ width: 'auto' }}>
        <TableHead>
          <TableRow>
            <HeaderTableCell align='center' colSpan={3} sx={{ borderLeft: '1px solid #808080' }}>
              Overall
            </HeaderTableCell>
            <HeaderTableCell align='center' colSpan={3} sx={{ borderLeft: '1px solid #808080' }}>
              Sweep
            </HeaderTableCell>
            <HeaderTableCell align='center' colSpan={3} sx={{ borderLeft: '1px solid #808080' }}>
              Sculling
            </HeaderTableCell>
          </TableRow>
          <TableRow>
            {/* Overall header row */}
            <DividerCell>
              <b>Place</b>
            </DividerCell>
            <HeaderTableCell>Team</HeaderTableCell>
            <HeaderTableCell align='right'>Pts</HeaderTableCell>

            {/* Sweep header row */}
            <DividerCell>
              <b>Place</b>
            </DividerCell>
            <HeaderTableCell>Team</HeaderTableCell>
            <HeaderTableCell align='right'>Pts</HeaderTableCell>

            {/* Sculling header row */}
            <DividerCell>
              <b>Place</b>
            </DividerCell>
            <HeaderTableCell>Team</HeaderTableCell>
            <HeaderTableCell align='right'>Pts</HeaderTableCell>
          </TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
      <Typography variant='caption' color='text.secondary'>
        Composite crews are ineligible to earn points. Points awarded to all non-composite finishers regardless of entry
        count. Only A finals count.
      </Typography>
    </Stack>
  );
};
