import React, { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFetchDashboardDetailQuery, useFetchDashboardListQuery } from 'services/grafanaApi';
import { Row } from 'tdesign-react';
import { PanelWrapper } from './PanelWrapper';
import { useCraneUrl } from 'hooks';
import { OverviewSearchPanel } from './OverviewSearchPanel';

export default memo(() => {
  const { t } = useTranslation();
  const craneUrl = useCraneUrl();
  const [selectedDashboard, setSelectedDashboard] = useState<any>(null);
  const [dashboardDetail, setDashboardDetail] = useState<any>(null);

  const dashboardListQuery = useFetchDashboardListQuery({ craneUrl }, { skip: !craneUrl });
  const dashboardList = dashboardListQuery.data || [];

  useEffect(() => {
    if (dashboardList.length > 0) {
      const selected = dashboardList.find((dashboard: any) => dashboard.uid === 'resourceForecasNew');
      setSelectedDashboard(selected);
    }
  }, [dashboardList]);

  const dashboardDetailQuery = useFetchDashboardDetailQuery(
    { dashboardUid: selectedDashboard?.uid },
    { skip: !selectedDashboard?.uid },
  );

  useEffect(() => {
    if (dashboardDetailQuery.data) {
      setDashboardDetail(dashboardDetailQuery.data);
    }
  }, [dashboardDetailQuery.data]);

  useEffect(() => {
    console.log('dashboardDetail', dashboardDetail);
  }, [dashboardDetail]);

  return (
    <>
      <OverviewSearchPanel />
      <Row style={{ marginTop: 10 }}>
        {!selectedDashboard?.uid ||
        !dashboardDetail?.dashboard?.panels ||
        dashboardDetail.dashboard.panels.length === 0 ? (
          <span>{t('暂无数据')}</span>
        ) : (
          dashboardDetail.dashboard.panels.map((panel: any) => (
            <PanelWrapper key={panel.id} panel={panel} selectedDashboard={selectedDashboard} />
          ))
        )}
      </Row>
    </>
  );
});
