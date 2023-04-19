import React from "react";
import { acaPointsCalc } from "../calculators/ACATeamPointsCalc";
import { Results } from "../common/CrewTimerTypes";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";

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
  "Bantam",
  "Juvenile",
  "Junior",
  "Senior",
  "Masters",
  "MastersA",
  "MastersB",
  "MastersC",
  "Open",
  "ParaCanoe",
];

const Trophies: { [key: string]: string } = {
  C4: "Coach Bill Bragg Trophy",
  "Mens K4": "Chris Barlow Trophy",
  "Womens K4": "Alan Anderson Trophy",
};

const PlaceColors = [
  undefined,
  "#c9daf8", // 1st
  "#f4cccc", // 2nd
  "#fff2cc", // 2rd
];

export interface ACATeamPointsProps {
  results: Results;
  nationals?: boolean;
}

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const HeaderTableCell = styled(TableCell)(() => ({
  fontWeight: "bold",
}));

/**
 * Render a set of team points.
 * @param results - Results from the regatta.
 *
 */
export const ACATeamPoints: React.FC<ACATeamPointsProps> = ({
  results,
  nationals,
}) => {
  const points = acaPointsCalc(results);
  let paddlers = 0;
  let total = 0;
  let levelColumns = orderList(
    Object.keys(points.levelTotals),
    PreferredLevelOrder
  );
  const c4 = points.classTotals["C4"] || [];
  const mk4 = points.genderLevelTotals["Mens K4"] || [];
  const wk4 = points.genderLevelTotals["Womens K4"] || [];

  if (nationals) {
    levelColumns = [...levelColumns, "C4", "Mens K4", "Womens K4"];
  }
  const levelTotals = nationals
    ? { ...points.levelTotals, C4: c4, "Mens K4": mk4, "Womens K4": wk4 }
    : points.levelTotals;

  const [, , , ...partialLevelColumns] = levelColumns;

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <HeaderTableCell colSpan={3}>
            Combined Points By Club by Level
          </HeaderTableCell>
          <TableCell align="right">Key:</TableCell>
          <TableCell align="center">
            <Box sx={{ backgroundColor: PlaceColors[1] }}>1st</Box>
          </TableCell>
          <TableCell align="center">
            <Box sx={{ backgroundColor: PlaceColors[2] }}>2nd</Box>
          </TableCell>
          <TableCell align="center">
            <Box sx={{ backgroundColor: PlaceColors[3] }}>3rd</Box>
          </TableCell>

          {partialLevelColumns.map((l) => (
            <HeaderTableCell key={l} align="center">
              {Trophies[l] || ""}
            </HeaderTableCell>
          ))}
        </TableRow>
        {/* <TableRow>
          <HeaderTableCell colSpan={7} sx={{ fontSize: 16, fontWeight: 'bold' }}></HeaderTableCell>

          {partialLevelColumns.map((l) => (
            <HeaderTableCell key={l} align="center">
              {Trophies[l] || ''}
            </HeaderTableCell>
          ))}
        </TableRow> */}
        <TableRow>
          <HeaderTableCell align="center">Place</HeaderTableCell>
          <HeaderTableCell>Club</HeaderTableCell>
          <HeaderTableCell align="center">Paddlers</HeaderTableCell>
          <HeaderTableCell align="center">Club Score</HeaderTableCell>
          {levelColumns.map((level) => (
            <HeaderTableCell align="center" key={level}>
              {level}
            </HeaderTableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {points.clubTotals.map((clubpoints) => {
          const numPaddlers = points.paddlersByClub[clubpoints.club].size;
          paddlers += numPaddlers;
          total += clubpoints.points;
          return (
            <StyledTableRow key={clubpoints.club}>
              <TableCell align="center">{clubpoints.place}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {clubpoints.club}
              </TableCell>
              <TableCell align="center">{numPaddlers}</TableCell>
              <TableCell
                align="center"
                sx={{ backgroundColor: PlaceColors[clubpoints.place || 0] }}
              >
                {clubpoints.points}
              </TableCell>
              {levelColumns.map((level) => {
                const clubResult = levelTotals[level]?.find(
                  (lvlPoints) => lvlPoints.club === clubpoints.club
                );
                return (
                  <TableCell
                    align="center"
                    key={level}
                    sx={{
                      backgroundColor: PlaceColors[clubResult?.place || 0],
                    }}
                  >
                    {clubResult?.points || ""}
                  </TableCell>
                );
              })}
            </StyledTableRow>
          );
        })}
        <StyledTableRow key={"summary"}>
          <TableCell></TableCell>
          <HeaderTableCell align="right">Totals:</HeaderTableCell>
          <HeaderTableCell align="center">{paddlers}</HeaderTableCell>
          <HeaderTableCell align="center">{total}</HeaderTableCell>
          <TableCell colSpan={levelColumns.length}></TableCell>
        </StyledTableRow>
      </TableBody>
    </Table>
  );
};
export const ACANationalsPoints: React.FC<ACATeamPointsProps> = ({
  results,
}) => {
  return <ACATeamPoints nationals results={results} />; // For now use the same result.  TODO: Add Trophies.
};
