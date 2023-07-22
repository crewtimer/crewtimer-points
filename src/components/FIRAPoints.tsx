import { Table, TableHead, TableRow, TableCell, TableBody, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Results } from 'crewtimer-common';
import React from 'react';
import { firaPointsCalc } from '../calculators/FIRAPointsCalc';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child th': {
    border: 0,
  },
}));

const HeaderTableCell = styled(TableCell)(() => ({
  fontWeight: 'bold',
}));

export const FIRAPointsTraditional: React.FC<{ results: Results }> = ({ results }) => {
  const points = firaPointsCalc(results);

  const maxDataRows = Math.max(points.men.length, points.women.length, points.overall.length);
  const tableBody: JSX.Element[] = [];
  for (let row = 0; row < maxDataRows; row++) {
    tableBody.push(
      <StyledTableRow key={row}>
        <TableCell></TableCell>
        <TableCell align='left'>{row + 1}</TableCell>
        <TableCell>{points.men[row]?.team || ''}</TableCell>
        <TableCell>{points.men[row]?.points || ''}</TableCell>
        <TableCell></TableCell>
        <TableCell>{points.women[row]?.team || ''}</TableCell>
        <TableCell>{points.women[row]?.points || ''}</TableCell>
        <TableCell></TableCell>
        <TableCell>{points.overall[row]?.team || ''}</TableCell>
        <TableCell>{points.overall[row]?.points || ''}</TableCell>
      </StyledTableRow>,
    );
  }
  return (
    <Stack alignItems='center'>
      <Table size='small' sx={{ width: 'auto' }}>
        <TableHead>
          <TableRow>
            <HeaderTableCell
              align='center'
              colSpan={10}
            >{`FIRA Points Competition (FIRA Member Schools & guests only)`}</HeaderTableCell>
          </TableRow>
          <TableRow>
            <HeaderTableCell align='right' colSpan={2}>
              Place
            </HeaderTableCell>
            <HeaderTableCell colSpan={2}>Men</HeaderTableCell>
            <HeaderTableCell sx={{ width: '2em' }} />
            <HeaderTableCell colSpan={2}>Women</HeaderTableCell>
            <HeaderTableCell sx={{ width: '2em' }} />
            <HeaderTableCell colSpan={2}>Overall</HeaderTableCell>
          </TableRow>
        </TableHead>
        <TableBody>{tableBody}</TableBody>
      </Table>
    </Stack>
  );
};
