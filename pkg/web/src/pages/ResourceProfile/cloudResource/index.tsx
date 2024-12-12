import { PanelWrapper } from './PanelWrapper';
import { useCraneUrl } from 'hooks';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFetchDashboardDetailQuery, useFetchDashboardListQuery } from 'services/grafanaApi';
import { Row } from 'tdesign-react';
// import { OverviewSearchPanel } from './OverviewSearchPanel';
export default memo(() => {
  const { t } = useTranslation();

  const craneUrl: any = useCraneUrl();
  console.log('craneUrl', craneUrl);
  const dashboardList = useFetchDashboardListQuery({ craneUrl }, { skip: !craneUrl });
  console.log('dashboardList', dashboardList);
  const selectedDashboard = (dashboardList?.data ?? []).find((dashboard: any) => dashboard.uid === 'CloudResource2');
  console.log('selectedDashboard', selectedDashboard);
  const dashboardDetail = useFetchDashboardDetailQuery(
    { dashboardUid: selectedDashboard?.uid },
    { skip: !selectedDashboard?.uid },
  );
  console.log('dashboardDetail', dashboardDetail);
  return (
    <>
      {/* <OverviewSearchPanel /> */}
      <Row style={{ marginTop: 10 }}>
        {!selectedDashboard?.uid || dashboardDetail?.data?.dashboard?.panels?.length === 0 ? (
          <span>{t('暂无数据')}</span>
        ) : (
          (dashboardDetail?.data?.dashboard?.panels ?? []).map((panel: any) => (
            <PanelWrapper key={panel.id} panel={panel} selectedDashboard={selectedDashboard} />
          ))
        )}
      </Row>
    </>
  );
});
