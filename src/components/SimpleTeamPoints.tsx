import React from "react";
import { simplePointsCalc } from "../calculators/SimpleTeamPointsCalc";
import Table from "@mui/material/Table";
import { TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Results } from "../common/CrewTimerTypes";
import { barnesPointsCalc } from "../calculators/BarnesPointsCalc";


export interface SimplePointsProps {
  results: Results;
  barnesPoints?: boolean;
}

/**
 * Render a set of team points.
 * @param points - An array of points results in sorted order.
 *
 */
export const SimpleTeamPoints: React.FC<SimplePointsProps> = ({
  results,
  barnesPoints
}) => {
  const points = barnesPoints 
    ? barnesPointsCalc(results)  
    : simplePointsCalc(results);

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

export const BarnesPoints: React.FC<SimplePointsProps> = ({
  results,
}) => {
  // the simple barnes points can be calculated from the same results
  return < SimpleTeamPoints barnesPoints results={results} />
}
