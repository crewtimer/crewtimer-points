import React from "react";
import { simplePointsCalc } from "../calculators/SimpleTeamPointsCalc";
import Table from "@mui/material/Table";
import { TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Results } from "../common/CrewTimerTypes";


export interface SimplePointsProps {
  results: Results;
  barnesPoints?: boolean;
}

/**
 * Render a set of team points.
 * @param points - An array of points results in sorted order.
 *
 */
export const SimpleTeamPoints: React.FC<{ results: Results }> = ({
  results
}) => {
  const points = simplePointsCalc(results);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Place</TableCell>
          <TableCell>Team Name</TableCell>
          <TableCell>Points</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {points.map((teampoints) => (
          <TableRow key={teampoints.team}>
            <TableCell>{teampoints.place}</TableCell>
            <TableCell>{teampoints.team}</TableCell>
            <TableCell>{teampoints.points}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};