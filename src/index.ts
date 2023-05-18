import React from 'react';
import { Results } from './common/CrewTimerTypes';
import { SimpleTeamPoints } from './components/SimpleTeamPoints';
import { BarnesPointsTraditional, BarnesFullWeighted, BarnesSimpleWeighted } from './components/BarnesPoints';
import { ACATeamPoints, ACANationalsPoints } from './components/ACATeamPoints';

export interface PointsViewerInfo {
  name: string; /// User presentable string
  key: string; /// key used for selection storage.  Do not change after initial deployment.
  ui: React.FC<{ results: Results }>; /// A react component to render results
}

/**
 * A list of points viewers.
 */
export const PointsViewers: PointsViewerInfo[] = [
  {
    name: 'Basic Points',
    key: 'Basic',
    ui: SimpleTeamPoints,
  },
  {
    name: 'Barnes - Mitten Series',
    key: 'BarnesFullWeighted',
    ui: BarnesFullWeighted,
  },
  {
    name: 'Barnes - Michigan States',
    key: 'BarnesSimpleWeighted',
    ui: BarnesSimpleWeighted,
  },
  {
    name: 'Barnes Points Traditional',
    key: 'BarnesTraditional',
    ui: BarnesPointsTraditional,
  },
  {
    name: 'ACA Regatta',
    key: 'ACA',
    ui: ACATeamPoints,
  },
  {
    name: 'ACA National Championships',
    key: 'ACANat',
    ui: ACANationalsPoints,
  },
];
