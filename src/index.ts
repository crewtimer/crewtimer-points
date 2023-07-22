import React from 'react';
import { Results } from 'crewtimer-common';
import { SimpleTeamPoints } from './components/SimpleTeamPoints';
import { BarnesPointsTraditional, BarnesFullWeighted, BarnesSimpleWeighted } from './components/BarnesPoints';
import { ACANationalsPoints, ACAPoints } from './components/ACATeamPoints';
import { FIRAPointsTraditional } from './components/FIRAPoints';

export interface PointsViewerInfo {
  name: string; /// User presentable string
  key: string; /// key used for selection storage.  Do not change after initial deployment.
  ui: React.FC<{ results: Results }>; /// A react component to render results
}

/**
 * A list of points viewers.
 */
export const PointsViewers: PointsViewerInfo[] = [
  // Roughly alphabetic order
  {
    name: 'ACA Regatta',
    key: 'ACA',
    ui: ACAPoints,
  },
  {
    name: 'ACA National Championships',
    key: 'ACANat',
    ui: ACANationalsPoints,
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
    name: 'Basic Points',
    key: 'Basic',
    ui: SimpleTeamPoints,
  },
  {
    name: 'FIRA Points Traditional (Mitchell System)',
    key: 'FIRATraditional',
    ui: FIRAPointsTraditional,
  },
];
