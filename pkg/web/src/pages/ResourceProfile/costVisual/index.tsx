import { PanelWrapper } from './PanelWrapper';
import { useCraneUrl } from 'hooks';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFetchDashboardDetailQuery, useFetchDashboardListQuery } from 'services/grafanaApi';
import { Row } from 'tdesign-react';

export default memo(() => {
  const { t } = useTranslation();

  const craneUrl: any = useCraneUrl();
  console.log('craneUrl', craneUrl);
  const dashboardList = useFetchDashboardListQuery({ craneUrl }, { skip: !craneUrl });
  console.log('dashboardList', dashboardList);

  // cluster-overview
  const selectedDashboard1 = (dashboardList?.data ?? []).find((dashboard: any) => dashboard.uid === 'cluster-overview');
  console.log('selectedDashboard1', selectedDashboard1);
  const dashboardDetail1 = useFetchDashboardDetailQuery(
    { dashboardUid: selectedDashboard1?.uid },
    { skip: !selectedDashboard1?.uid },
  );
  console.log('dashboardDetail1', dashboardDetail1);

  // namespace-costs
  const selectedDashboard2 = (dashboardList?.data ?? []).find((dashboard: any) => dashboard.uid === 'namespace-costs');

  const dashboardDetail2 = useFetchDashboardDetailQuery(
    { dashboardUid: selectedDashboard2?.uid },
    { skip: !selectedDashboard2?.uid },
  );
  console.log('dashboardDetail2', dashboardDetail2);
  return (
    <>
      {/* cluster-overview */}
      <Row style={{ marginTop: 10 }}>
        {!selectedDashboard1?.uid || dashboardDetail1?.data?.dashboard?.panels?.length === 0 ? (
          <span>{t('暂无数据')}</span>
        ) : (
          (dashboardDetail1?.data?.dashboard?.panels ?? []).map((panel: any) => (
            <PanelWrapper key={panel.id} panel={panel} selectedDashboard={selectedDashboard1} />
          ))
        )}
      </Row>

      {/* namespace-costs */}
      <Row style={{ marginTop: 10 }}>
        {!selectedDashboard2?.uid || dashboardDetail2?.data?.dashboard?.panels?.length === 0 ? (
          <span>{t('暂无数据')}</span>
        ) : (
          (dashboardDetail2?.data?.dashboard?.panels ?? []).map((panel: any) => (
            <PanelWrapper key={panel.id} panel={panel} selectedDashboard={selectedDashboard2} />
          ))
        )}
      </Row>
    </>
  );
});
