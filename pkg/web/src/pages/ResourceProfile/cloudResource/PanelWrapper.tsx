import { Card } from 'components/common/Card';
import { useCraneUrl, useGrafanaQueryStr, useIsNeedSelectNamespace, useIsValidPanel, useSelector } from 'hooks';
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
  const queryStr = useGrafanaQueryStr({ panelId: panel.id, selectedDashboard });

  const span = panel?.gridPos?.w > 0 && panel?.gridPos?.w <= 24 ? Math.floor(panel.gridPos.w / 2) : 6;
  const minHeight = panel?.gridPos?.h ? Math.max(panel.gridPos.h * baselineHeight, defaultHeight) : defaultHeight;

  const shouldRenderPanel = (panel) => {
    return (
      panel.title === 'CPU Utilization' ||
      panel.title === 'CPU Requests' ||
      panel.title === 'RAM Utilization' ||
      panel.title === 'RAM Requests' ||
      panel.title === 'Node CPU Utilization' ||
      panel.title === 'Node Memory Utilization'
    );
  };
  let dashboardTitle: string | null = null;
  if (panel?.title === 'CPU Utilization') {
    dashboardTitle = 'CPU利用率';
  } else if (panel?.title === 'CPU Requests') {
    dashboardTitle = 'CPU请求';
  } else if (panel?.title === 'RAM Utilization') {
    dashboardTitle = '内存利用率';
  } else if (panel?.title === 'RAM Requests') {
    dashboardTitle = '内存请求';
  } else if (panel?.title === 'Node CPU Utilization') {
    dashboardTitle = '节点CPU利用率';
  } else if (panel?.title === 'Node Memory Utilization') {
    dashboardTitle = '节点内存利用率';
  }

  return (isNeedSelectNamespace && !selectedNamespace) || !isValidPanel ? null : (
    <>
      {shouldRenderPanel(panel) && (
        <Col key={panel.id} span={span}>
          <Card style={{ marginBottom: '0.5rem', marginTop: '0.5rem', height: minHeight }}>
            <div>{dashboardTitle}</div>
            <iframe
              frameBorder='0'
              height='100%'
              src={`${craneUrl}/grafana/d-solo/${selectedDashboard?.uid}/costs-by-dimension?${queryStr}`}
              width='100%'
            />
          </Card>
        </Col>
      )}
    </>
  );
});
