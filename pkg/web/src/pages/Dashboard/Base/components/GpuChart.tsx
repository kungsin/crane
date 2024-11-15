import React from 'react';
import { Col, Row } from 'tdesign-react';
import Style from './GpuChart.module.less';
import SeriesLineChart, { ISeriesLineChart } from '../../../../components/SeriesLineChart';
import { useTranslation } from 'react-i18next';

const GpuChart = () => {
  const { t } = useTranslation();

  const gpuMetrics: ISeriesLineChart = {
    title: t('GPU 资源使用'),
    subTitle: '(%)',
    datePicker: true,
    step: '1h',
    xAxis: { type: 'time' },
    lines: [
      {
        name: 'capacity',
        query: `sum(DCGM_FI_DEV_GPU_UTIL) * on (instance) group_left() max(kube_node_labels{label_beta_kubernetes_io_instance_type!="eklet", label_node_kubernetes_io_instance_type!~"eklet"}) by (instance)`,
      },
      {
        name: 'memory_used',
        query: `sum(DCGM_FI_DEV_FB_USED / DCGM_FI_DEV_FB_TOTAL * 100) * on (instance) group_left() max(kube_node_labels{label_beta_kubernetes_io_instance_type!="eklet", label_node_kubernetes_io_instance_type!~"eklet"}) by (instance)`,
      },
      {
        name: 'power_usage',
        query: `sum(DCGM_FI_DEV_POWER_USAGE / DCGM_FI_DEV_POWER_LIMIT * 100) * on (instance) group_left() max(kube_node_labels{label_beta_kubernetes_io_instance_type!="eklet", label_node_kubernetes_io_instance_type!~"eklet"}) by (instance)`,
      },
      {
        name: 'temperature',
        query: `sum(DCGM_FI_DEV_GPU_TEMP) * on (instance) group_left() max(kube_node_labels{label_beta_kubernetes_io_instance_type!="eklet", label_node_kubernetes_io_instance_type!~"eklet"}) by (instance)`,
      }
    ],
  };

  return (
    <Row gutter={[16, 16]} className={Style.gpuChartPanel}>
      <Col span={12}>
        <SeriesLineChart
          title={item.title}
          subTitle={item.subTitle}
          datePicker={item.datePicker}
          lines={item.lines}
          timeRange={item.timeRange}
          step={item.step}
          xAxis={item.xAxis}
        ></SeriesLineChart>
      </Col>
    </Row>
  );
};

export default React.memo(GpuChart);
