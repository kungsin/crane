import React from 'react';
import { Col, Row } from 'tdesign-react';
import Style from './DiskIoChart.module.less';
import SeriesLineChart, { ISeriesLineChart } from '../../../../components/SeriesLineChart';
import { useTranslation } from 'react-i18next';

const DiskIoChart = () => {
  const { t } = useTranslation();

  // 磁盘 IO 监控配置
  const diskIOMetrics: ISeriesLineChart = {
    title: t('磁盘 IO 使用'),
    subTitle: '(bytes/second)', 
    datePicker: true,
    step: '1h',
    xAxis: { type: 'time' },
    lines: [
      {
        name: 'read_bytes',
        query: `sum(rate(node_disk_read_bytes_total{device!~"dm-.*"}[5m]) * on (instance) group_left() max(kube_node_labels{label_beta_kubernetes_io_instance_type!="eklet", label_node_kubernetes_io_instance_type!~"eklet"}) by (instance))`,
      },
      {
        name: 'written_bytes', 
        query: `sum(rate(node_disk_written_bytes_total{device!~"dm-.*"}[5m]) * on (instance) group_left() max(kube_node_labels{label_beta_kubernetes_io_instance_type!="eklet", label_node_kubernetes_io_instance_type!~"eklet"}) by (instance))`,
      },
      {
        name: 'io_time',
        query: `sum(rate(node_disk_io_time_seconds_total{device!~"dm-.*"}[5m]) * on (instance) group_left() max(kube_node_labels{label_beta_kubernetes_io_instance_type!="eklet", label_node_kubernetes_io_instance_type!~"eklet"}) by (instance))`,
      }
    ],
  };

  return (
    <Row gutter={[16, 16]} className={Style.diskIoChartPanel}>
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

export default React.memo(DiskIoChart);
