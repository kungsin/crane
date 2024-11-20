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
    console.log('================', panel.title);
    return (
      panel.title === 'Estimated Monthly Cluster Resource Costs' ||
      panel.title === 'Node Resource Cost & Utilization' ||
      panel.title === 'CPU Hourly Costs Over Time By Namespace ${namespace}' ||
      panel.title === 'RAM Hourly Costs Over Time By Namespace ${namespace}' ||
      panel.title === 'Hourly Costs Over Time By Namespace ${namespace}' ||
      panel.title === 'namespace(${namespace}) total usage costs'
    );
  };
  let dashboardTitle: string | null = null;
  if (panel?.title === 'Estimated Monthly Cluster Resource Costs') {
    dashboardTitle = '预计每月集群资源成本';
  } else if (panel?.title === 'Node Resource Cost & Utilization') {
    dashboardTitle = '节点资源成本与利用率';
  } else if (panel?.title === 'CPU Hourly Costs Over Time By Namespace crane-system') {
    dashboardTitle = '不同命名空间的 CPU 每小时成本 crane-system';
  } else if (panel?.title === 'RAM Hourly Costs Over Time By Namespace crane-system') {
    dashboardTitle = '不同命名空间的 内存 每小时成本 crane-system';
  } else if (panel?.title === 'Hourly Costs Over Time By Namespace crane-system') {
    dashboardTitle = '不同命名空间的每小时成本 crane-system';
  } else if (panel?.title === 'namespace(crane-system) total usage costs') {
    dashboardTitle = 'namespace(crane-system) 总使用成本';
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
