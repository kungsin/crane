import React, { memo } from 'react';
import TopPanel from './components/TopPanel';
import MiddleChart from './components/MiddleChart';
import CpuChart from './components/CpuChart';
import MemoryChart from './components/MemoryChart';
import DiskIoChart from './components/DiskIoChart';
import NetworkIoChart from './components/NetworkIoChart';
import GpuChart from './components/GpuChart';

const DashBoard = () => (
  <div style={{ overflowX: 'hidden' }}>
    <TopPanel />
    <MiddleChart />
    <CpuChart />
    <MemoryChart />
    <NetworkIoChart />
    <GpuChart />
    <DiskIoChart />
  </div>
);

export default memo(DashBoard);
