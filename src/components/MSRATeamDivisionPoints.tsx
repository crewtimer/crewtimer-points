import React from 'react';
import Table from '@mui/material/Table';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CardActionArea,
  IconButton,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  styled,
} from '@mui/material';

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

  const points = pointsByDivision(results);

  // since we can't call useState in the loop, we need to create a state object to manage all
  const [open, setOpen] = React.useState(
    new Map<string, boolean>(Array.from(points.keys()).map((key) => [key, false])),
  );

  for (const divisionResults of points) {
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

    const isOpen = () => {
      return open.get(divisionResults[0]);
    };

    const setOpenForDivision = () => {
      setOpen(
        new Map(Array.from(open).map((entry) => (entry[0] == divisionResults[0] ? [entry[0], !entry[1]] : entry))),
      );
    };

    divisionTables.push(
      <Accordion square>
        <CardActionArea onClick={() => setOpenForDivision()}>
          <AccordionSummary
            expandIcon={
              <IconButton aria-label='expand row' size='medium'>
                {isOpen() ? '-' : '+'}
              </IconButton>
            }
          >
            <Typography>
              {'Division ' + divisionResults[0] + ' '}
              <Typography variant='subtitle2'>
                {(minAthletes < Number.MAX_VALUE ? minAthletes : 'unknown number of') +
                  (minAthletes < Number.MAX_VALUE ? (maxAthletes < Number.MAX_VALUE ? '-' : '+') : '') +
                  (maxAthletes < Number.MAX_VALUE && maxAthletes > Number.MIN_VALUE ? maxAthletes : '') +
                  ' athletes'}
              </Typography>
            </Typography>
          </AccordionSummary>
        </CardActionArea>
        <AccordionDetails>
          <Table size='small'>
            <TableHead>
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
          </Table>
        </AccordionDetails>
      </Accordion>,
    );
  }

  return <Stack alignItems='left'>{divisionTables}</Stack>;
};
