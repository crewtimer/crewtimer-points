import React from 'react';
import Table from '@mui/material/Table';
import { Stack, TableBody, TableCell, TableHead, TableRow, styled } from '@mui/material';
import { Results } from 'crewtimer-common';
import { DIVISION_SIZES, pointsByDivision } from '../calculators/MSRATeamDivisionPointsCalc';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const HeaderTableCell = styled(TableCell)(() => ({
  fontWeight: 'bold',
}));

export interface PointsByDivisionProps {
  results: Results;
}

export const MSRAPointsByDivision: React.FC<{ results: Results }> = ({ results }) => {
  const divisionTables: JSX.Element[] = [];

  for (const divisionResults of pointsByDivision(results)) {
    const teamsForDivision: JSX.Element[] = [];

    // skip if there are no teams in this division
    if (divisionResults[1].length == 0) {
      continue;
    }

    divisionResults[1].forEach((teamResult, idx) => {
      teamsForDivision.push(
        <StyledTableRow key={divisionResults[0] + idx}>
          <TableCell sx={{ borderLeft: '1px solid #808080' }}></TableCell>
          <TableCell align='right'>{teamResult.place}</TableCell>
          <TableCell>{teamResult.teamName}</TableCell>
          <TableCell align='right'>{teamResult.teamSize || 'n/a'}</TableCell>
          <TableCell align='right'>{teamResult.points.toFixed(1)}</TableCell>
        </StyledTableRow>,
      );
    });

    const minAthletes = DIVISION_SIZES.get(divisionResults[0])?.min || 0;
    const maxAthletes = DIVISION_SIZES.get(divisionResults[0])?.max || Number.MAX_VALUE;

    divisionTables.push(
      <Table size='small' sx={{ width: 'auto', marginBottom: '25px' }}>
        <TableHead>
          <TableRow>
            <HeaderTableCell align='left' colSpan={3}>
              Division {divisionResults[0]}
            </HeaderTableCell>
            <TableCell align='left' colSpan={2}>
              {minAthletes < Number.MAX_VALUE ? minAthletes : 'unknown number of'}
              {minAthletes < Number.MAX_VALUE ? (maxAthletes < Number.MAX_VALUE ? '-' : '+') : ''}
              {maxAthletes < Number.MAX_VALUE && maxAthletes > Number.MIN_VALUE ? maxAthletes : ''} athletes
            </TableCell>
          </TableRow>
          <TableRow>
            <HeaderTableCell colSpan={2} align='right' key='place'>
              Place
            </HeaderTableCell>
            <HeaderTableCell colSpan={1} key='team'>
              Team
            </HeaderTableCell>
            <HeaderTableCell colSpan={1} align='right' key='teamSize'>
              Team Size
            </HeaderTableCell>
            <HeaderTableCell colSpan={1} align='right' key='points'>
              Points
            </HeaderTableCell>
          </TableRow>
        </TableHead>
        <TableBody>{teamsForDivision}</TableBody>
      </Table>,
    );
  }

  return <Stack alignItems='center'>{divisionTables}</Stack>;
};
