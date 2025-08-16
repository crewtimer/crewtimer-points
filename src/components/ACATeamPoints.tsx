import React from 'react';
import { acaPointsCalc } from '../calculators/ACATeamPointsCalc';
import { Results } from 'crewtimer-common';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';
import { Stack, FormControlLabel, Switch } from '@mui/material';
import { UseDatum } from 'react-usedatum';

// Global shared state for showPaddlers boolean.  This allows the
// paddler state to be retained while switching between other points engines.
const [useShowPaddlers] = UseDatum(false);

/**
 * Given a list of strings sort them so any that match a preferred list maintain the order
 * in the preferred list.
 *
 * @param list The list to sort
 * @param order The preferred order
 * @returns
 */
function orderList(list: string[], order: string[]): string[] {
  const strings = new Set(list);
  const result: string[] = [];
  order.forEach((s) => {
    if (strings.has(s)) {
      result.push(s);
      strings.delete(s);
    }
  });
  return [...result, ...strings.keys()];
}

const PreferredLevelOrder = [
  'Bantam',
  'Juvenile',
  'Junior',
  'Senior',
  'Open',
  'Para',
  '(Masters)',
  'C4',
  'Mens K4',
  'Womens K4',
  'Masters',
  'MastersA',
  'MastersB',
  'MastersC',
  'MastersD',
  'MastersE',
];

const PlaceColors = [
  undefined,
  '#c9daf8', // 1st
  '#f4cccc', // 2nd
  '#fff2cc', // 2rd
];

export interface ACATeamPointsProps {
  results: Results;
  nationals?: boolean;
  showMastersDetail?: boolean;
  showPoints?: boolean;
}

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

/**
 * Render a set of team points.
 * @param results - Results from the regatta.
 *
 */
export const ACATeamPoints: React.FC<ACATeamPointsProps> = ({
  results,
  nationals,
  showMastersDetail = false,
  showPoints = false,
}) => {
  const points = acaPointsCalc(results);
  let paddlers = 0;
  let total = 0;
  let levelColumns = orderList(Object.keys(points.levelTotals), PreferredLevelOrder);
  const c4 = points.classTotals['C4'] || [];
  const mk4 = points.genderLevelTotals['Mens K4'] || [];
  const wk4 = points.genderLevelTotals['Womens K4'] || [];

  if (nationals) {
    levelColumns = orderList([...levelColumns, 'C4', 'Mens K4', 'Womens K4'], PreferredLevelOrder);
  }

  // Filter out columns starting with 'Masters' if not showing masters detail
  const filteredLevelColumns = showMastersDetail
    ? levelColumns
    : levelColumns.filter((lvl) => !lvl.startsWith('Masters'));

  const levelTotals = nationals
    ? { ...points.levelTotals, C4: c4, 'Mens K4': mk4, 'Womens K4': wk4 }
    : points.levelTotals;

  return (
    <Stack>
      {showPoints ? (
        <Table size='small'>
          <TableHead>
            <TableRow>
              <HeaderTableCell colSpan={3}>
                <Stack>
                  <Box>Combined Points By Club by Level</Box>
                  <Stack direction='row'>
                    <Box>Key:</Box>
                    <Box sx={{ textAlign: 'center', width: '4em', backgroundColor: PlaceColors[1] }}>1st</Box>
                    <Box sx={{ textAlign: 'center', width: '4em', backgroundColor: PlaceColors[2] }}>2nd</Box>
                    <Box sx={{ textAlign: 'center', width: '4em', backgroundColor: PlaceColors[3] }}>3rd</Box>
                  </Stack>
                </Stack>
              </HeaderTableCell>
              <HeaderTableCell align='center'>{nationals ? 'National Champions Yonkers Trophy' : ''}</HeaderTableCell>

              {filteredLevelColumns.map((l) => (
                <HeaderTableCell key={l} align='center'>
                  {(nationals && points.trophiesByLevel[l]?.name) || ''}
                </HeaderTableCell>
              ))}
            </TableRow>
            <TableRow>
              <HeaderTableCell align='center'>Place</HeaderTableCell>
              <HeaderTableCell>Club</HeaderTableCell>
              <HeaderTableCell align='center'>Paddlers</HeaderTableCell>
              <HeaderTableCell align='center'>Club Score</HeaderTableCell>
              {filteredLevelColumns.map((level) => (
                <HeaderTableCell align='center' key={level}>
                  {level}
                </HeaderTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {points.clubTotals.map((clubpoints) => {
              const numPaddlers = points.paddlersByClub[clubpoints.index].size;
              paddlers += numPaddlers;
              total += clubpoints.points;
              return (
                <StyledTableRow key={clubpoints.index}>
                  <TableCell align='center'>{clubpoints.place}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{clubpoints.index}</TableCell>
                  <TableCell align='center'>{numPaddlers}</TableCell>
                  <TableCell align='center' sx={{ backgroundColor: PlaceColors[clubpoints.place || 0] }}>
                    {clubpoints.points}
                  </TableCell>
                  {filteredLevelColumns.map((level) => {
                    const clubResult = levelTotals[level]?.find((lvlPoints) => lvlPoints.index === clubpoints.index);
                    return (
                      <TableCell
                        align='center'
                        key={level}
                        sx={{
                          backgroundColor: PlaceColors[clubResult?.place || 0],
                        }}
                      >
                        {clubResult?.points || ''}
                      </TableCell>
                    );
                  })}
                </StyledTableRow>
              );
            })}
            <StyledTableRow key={'summary'}>
              <TableCell></TableCell>
              <HeaderTableCell align='right'>Totals:</HeaderTableCell>
              <HeaderTableCell align='center'>{paddlers}</HeaderTableCell>
              <HeaderTableCell align='center'>{total}</HeaderTableCell>
              <TableCell colSpan={filteredLevelColumns.length}></TableCell>
            </StyledTableRow>
          </TableBody>
        </Table>
      ) : (
        <div>Points pending publication</div>
      )}
      {nationals && (
        <Table size='small' sx={{ marginTop: '2em', pageBreakInside: 'avoid' }}>
          <TableHead>
            <TableRow>
              <HeaderTableCell>Award</HeaderTableCell>
              <HeaderTableCell>Criteria</HeaderTableCell>
              <HeaderTableCell>Winner</HeaderTableCell>
              <HeaderTableCell>Club</HeaderTableCell>
              <HeaderTableCell>Race</HeaderTableCell>
              <HeaderTableCell>Time</HeaderTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {points.trophies.map((trophy, row) => (
              <StyledTableRow key={row}>
                <TableCell>{trophy.name}</TableCell>
                <TableCell>{trophy.criteria}</TableCell>
                <TableCell>{trophy.winner}</TableCell>
                <TableCell>{trophy.winnerClub}</TableCell>
                <TableCell>{trophy.winnerRaceNum}</TableCell>
                <TableCell>{trophy.winnerTime}</TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
};

/**
 * Render individual points for an ACA regatta.
 * @returns {React.ReactElement}
 */
export const ACAIndividualPoints: React.FC<ACATeamPointsProps> = ({ results, showMastersDetail = false }) => {
  const points = acaPointsCalc(results);
  const levelColumns = orderList(Object.keys(points.levelTotals), PreferredLevelOrder);
  const paddlerClub: { [paddler: string]: string } = {};
  Object.keys(points.paddlersByClub).forEach((club) =>
    points.paddlersByClub[club].forEach((paddler) => (paddlerClub[paddler] = club)),
  );

  // Filter out columns starting with 'Masters' if not showing masters detail
  const filteredLevelColumns = showMastersDetail
    ? levelColumns
    : levelColumns.filter((lvl) => !lvl.startsWith('Masters'));

  return (
    <Table size='small'>
      <TableHead>
        <TableRow>
          <HeaderTableCell colSpan={3}>Combined Points By Paddler by Level</HeaderTableCell>
          <TableCell align='right'>Key:</TableCell>
          <TableCell align='center'>
            <Box sx={{ backgroundColor: PlaceColors[1] }}>1st</Box>
          </TableCell>
          <TableCell align='center'>
            <Box sx={{ backgroundColor: PlaceColors[2] }}>2nd</Box>
          </TableCell>
          <TableCell align='center'>
            <Box sx={{ backgroundColor: PlaceColors[3] }}>3rd</Box>
          </TableCell>
        </TableRow>
        <TableRow>
          <HeaderTableCell>Paddler</HeaderTableCell>
          <HeaderTableCell>Club</HeaderTableCell>
          <HeaderTableCell>Total</HeaderTableCell>

          {filteredLevelColumns.map((level) => (
            <HeaderTableCell align='center' key={level}>
              {level}
            </HeaderTableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {points.paddlerTotals.map((paddler) => {
          return (
            <StyledTableRow key={paddler.index}>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{paddler.index}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{paddlerClub[paddler.index]}</TableCell>
              <TableCell align='center' sx={{ backgroundColor: PlaceColors[paddler.place || 0] }}>
                {paddler.points}
              </TableCell>
              {filteredLevelColumns.map((level) => {
                const levelPoints = points.paddlerClassTotals[level] || [];
                const paddlerResult = levelPoints?.find((lvlPoints) => lvlPoints.index === paddler.index);
                return (
                  <TableCell
                    align='center'
                    key={level}
                    sx={{
                      backgroundColor: PlaceColors[paddlerResult?.place || 0],
                    }}
                  >
                    {paddlerResult?.points || ''}
                  </TableCell>
                );
              })}
            </StyledTableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

/**
 * Render ACA Points as either individual points or as team points.
 *
 * If nationals boolean is true then a nationals version of points is shown.  Note however
 * that for team points there is not a difference between nationals and non-nationals.
 *
 * @returns  {React.ReactElement} instance of ACAIndividualPoints or ACATeamPoints
 */
export const ACAPoints: React.FC<ACATeamPointsProps> = ({ nationals, results }) => {
  const [showPaddlers, setShowPaddlers] = useShowPaddlers();
  const [showMastersDetail, setShowMastersDetail] = React.useState(false);
  const regattaConfig = JSON.parse(results.regattaInfo.json || '{}');
  const showPoints = regattaConfig.showPoints === undefined || regattaConfig.showPoints === true;

  const Viewer = showPaddlers ? ACAIndividualPoints : ACATeamPoints;
  return (
    <Stack alignItems='center'>
      {showPoints && (
        <Stack direction='row' className='noprint'>
          <FormControlLabel
            labelPlacement='start'
            control={
              <Switch
                size='small'
                checked={showPaddlers}
                onChange={(event) => setShowPaddlers(event.target.checked)}
                name='showPaddlers'
                color='primary'
              />
            }
            label='Show Paddlers'
          />
          <FormControlLabel
            labelPlacement='start'
            control={
              <Switch
                size='small'
                checked={showMastersDetail}
                onChange={(event) => setShowMastersDetail(event.target.checked)}
                name='showMastersDetail'
                color='primary'
              />
            }
            label='Show Masters Detail'
            sx={{ ml: 2 }}
          />
        </Stack>
      )}
      <Viewer nationals={nationals} results={results} showMastersDetail={showMastersDetail} showPoints={showPoints} />
    </Stack>
  );
};

/**
 * A Component to render ACA Nationals points.
 *
 * @returns {React.ReactElement} instance of ACAPoints
 */
export const ACANationalsPoints: React.FC<ACATeamPointsProps> = ({ results }) => {
  return <ACAPoints results={results} nationals />;
};
