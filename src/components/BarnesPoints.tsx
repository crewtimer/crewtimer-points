import React from "react";
import Table from "@mui/material/Table";
import { TableBody, TableCell, TableHead, TableRow, styled } from "@mui/material";
import { Results } from "../common/CrewTimerTypes";
import { barnesPointsCalc } from "../calculators/BarnesPointsCalc";

const categories = [
  "Combined Points",
  "Women's Sweep Points",
  "Men's Sweep Points",
  "Women's Scull Points",
  "Men's Scull Points",
]

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

const BarnesPoints: React.FC<{ results: Results, useScaledEvents: boolean }> = ({
  results,
  useScaledEvents
}) => {
  const points = barnesPointsCalc(results, useScaledEvents);
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <HeaderTableCell key="place">Place</HeaderTableCell>
          {categories.map(category => [<HeaderTableCell key={category}>
            {category}
          </HeaderTableCell>,
          <HeaderTableCell key={category + "_padding"}></HeaderTableCell>])}
        </TableRow>
      </TableHead>
      <TableBody>
        {points.combined.map((_, idx) => (
          <StyledTableRow key={idx}>
            <TableCell>{idx + 1}</TableCell>
            <TableCell>{points.combined[idx].team}</TableCell>
            <TableCell align="right">{points.combined[idx].points.toFixed(1)}</TableCell>
            <TableCell>{points.womensSweep[idx].team}</TableCell>
            <TableCell align="right">{points.womensSweep[idx].points.toFixed(1)}</TableCell>
            <TableCell>{points.mensSweep[idx].team}</TableCell>
            <TableCell align="right">{points.mensSweep[idx].points.toFixed(1)}</TableCell>
            <TableCell>{points.womensScull[idx].team}</TableCell>
            <TableCell align="right">{points.womensScull[idx].points.toFixed(1)}</TableCell>
            <TableCell>{points.mensScull[idx].team}</TableCell>
            <TableCell align="right">{points.mensScull[idx].points.toFixed(1)}</TableCell>
          </StyledTableRow>
        ))}
      </TableBody>
    </Table>
  );
};


/**
 * Render team points calculated by the Barnes Points system for all points categories.
 * An event's point values are scaled by Novice/Junior/Varsity category.
 * 
 * @param points - An array of points results in sorted order.
 *
 */
export const BarnesPointsWeighted: React.FC<{ results: Results }> = ({
  results
}) => {
  return <BarnesPoints useScaledEvents={true} results={results} />; // For now use the same result.  TODO: Add Trophies.
};

/**
 * Render team points calculated by the Barnes Points system for all points categories.
 * All events types (Novice/Varsity/Junior/etc) are weighted equially.
 * 
 * @param points - An array of points results in sorted order.
 *
 */
export const BarnesPointsTraditional: React.FC<{ results: Results }> = ({
  results
}) => {
  return <BarnesPoints useScaledEvents={false} results={results} />; // For now use the same result.  TODO: Add Trophies.
};

