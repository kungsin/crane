import React, { memo } from 'react';
import CpuChart from './components/CpuChart';
import MemoryChart from './components/MemoryChart';

import { PanelWrapper } from './PanelWrapper';
import { useCraneUrl } from 'hooks';
import { useTranslation } from 'react-i18next';
import { useFetchDashboardDetailQuery, useFetchDashboardListQuery } from 'services/grafanaApi';
import { Row } from 'tdesign-react';
import cluster from 'cluster';

const DashBoard = () => (
  <div style={{ overflowX: 'hidden' }}>
    <CpuChart />
    <MemoryChart />
  </div>
);

// export default memo(DashBoard);

export default memo(() => {
  const { t } = useTranslation();

  const craneUrl: any = useCraneUrl();
  console.log('craneUrl', craneUrl);
  const dashboardList = useFetchDashboardListQuery({ craneUrl }, { skip: !craneUrl });
  console.log('dashboardList', dashboardList);
  // cluster-overview
  const selectedDashboard1 = (dashboardList?.data ?? []).find((dashboard: any) => dashboard.uid === 'cluster-overview');
  console.log('selectedDashboard', selectedDashboard1);
  const dashboardDetail1 = useFetchDashboardDetailQuery(
    { dashboardUid: selectedDashboard1?.uid },
    { skip: !selectedDashboard1?.uid },
  );
  console.log('dashboardDetail', dashboardDetail1);

  // workload-overview
  const selectedDashboard2 = (dashboardList?.data ?? []).find(
    (dashboard: any) => dashboard.uid === 'workload-overview',
  );
  console.log('selectedDashboard', selectedDashboard2);
  const dashboardDetail2 = useFetchDashboardDetailQuery(
    { dashboardUid: selectedDashboard2?.uid },
    { skip: !selectedDashboard2?.uid },
  );
  console.log('dashboardDetail', dashboardDetail2);
  return (
    <>
      <DashBoard />
      <div>
        {/* workload-overview */}
        <Row style={{ marginTop: 10 }}>
          {!selectedDashboard2?.uid || dashboardDetail2?.data?.dashboard?.panels?.length === 0 ? (
            <span>{t('暂无数据')}</span>
          ) : (
            (dashboardDetail2?.data?.dashboard?.panels ?? []).map((panel: any) => (
              <PanelWrapper key={panel.id} panel={panel} selectedDashboard={selectedDashboard2} />
            ))
          )}
        </Row>
        {/* cluster-overview */}
        <Row style={{ marginTop: 100 }}>
          {!selectedDashboard1?.uid || dashboardDetail1?.data?.dashboard?.panels?.length === 0 ? (
            <span>{t('暂无数据')}</span>
          ) : (
            (dashboardDetail1?.data?.dashboard?.panels ?? []).map((panel: any) => (
              <PanelWrapper key={panel.id} panel={panel} selectedDashboard={selectedDashboard1} />
            ))
          )}
        </Row>
        -----------------------
      </div>
    </>
  );
});
