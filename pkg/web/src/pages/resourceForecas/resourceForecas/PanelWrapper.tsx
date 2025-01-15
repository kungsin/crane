import { Card } from 'components/common/Card';
import { useCraneUrl, useGrafanaQueryStrPre, useIsNeedSelectNamespace, useIsValidPanel, useSelector } from 'hooks';
import React from 'react';
import { Col } from 'tdesign-react';

export interface PanelWrapperProps {
  panel: any;
  selectedDashboard: any;
}

export const PanelWrapper = React.memo(({ panel, selectedDashboard }: PanelWrapperProps) => {
  const baselineHeight = useSelector((state) => state.config.chartBaselineHeight);
  const defaultHeight = useSelector((state) => state.config.chartDefaultHeight);
  const selectedNamespace = useSelector((state) => state.insight.selectedNamespace);

  // if it is using current cluster, use crane url from env
  const craneUrl = useCraneUrl();
  const isValidPanel = useIsValidPanel({ panel });
  const isNeedSelectNamespace = useIsNeedSelectNamespace({ selectedDashboard });
  const queryStr = useGrafanaQueryStrPre({ panelId: panel.id, selectedDashboard });

  const span = panel?.gridPos?.w > 0 && panel?.gridPos?.w <= 24 ? Math.floor(panel.gridPos.w / 2) : 6;
  const minHeight = panel?.gridPos?.h ? Math.max(panel.gridPos.h * baselineHeight, defaultHeight) : defaultHeight;

  
  return (isNeedSelectNamespace && !selectedNamespace) || !isValidPanel ? null : (
    <Col key={panel.id} span={span}>
      <>`${craneUrl}/grafana/d-solo/${selectedDashboard?.uid}/costs-by-dimension?${queryStr}`</>
      <Card style={{ marginBottom: '0.5rem', marginTop: '0.5rem', height: minHeight }}>
        <iframe
          frameBorder='0'
          height='100%'
          src={`${craneUrl}/grafana/d-solo/${selectedDashboard?.uid}/costs-by-dimension?${queryStr}`}
          width='100%'
        />
      </Card>
    </Col>
  );
});
