import React from 'react';
import { Col, Row } from 'tdesign-react';
import Style from './NetworkIoChart.module.less';
import SeriesLineChart, { ISeriesLineChart } from '../../../../components/SeriesLineChart';
import { useTranslation } from 'react-i18next';

const MemoryChart = () => {
  const { t } = useTranslation();

  // 网络 IO 监控配置
  const networkIOMetrics: ISeriesLineChart = {
    title: t('网络 IO 使用'),
    subTitle: '(bytes/second)',
    datePicker: true, 
    step: '1h',
    xAxis: { type: 'time' },
    lines: [
      {
        name: 'receive_bytes',
        query: `sum(rate(node_network_receive_bytes_total{device!~"veth.*|docker.*|cni.*|flannel.*|cali.*|cbr.*"}[5m]) * on (instance) group_left() max(kube_node_labels{label_beta_kubernetes_io_instance_type!="eklet", label_node_kubernetes_io_instance_type!~"eklet"}) by (instance))`,
      },
      {
        name: 'transmit_bytes',
        query: `sum(rate(node_network_transmit_bytes_total{device!~"veth.*|docker.*|cni.*|flannel.*|cali.*|cbr.*"}[5m]) * on (instance) group_left() max(kube_node_labels{label_beta_kubernetes_io_instance_type!="eklet", label_node_kubernetes_io_instance_type!~"eklet"}) by (instance))`,
      },
      {
        name: 'receive_packets',
        query: `sum(rate(node_network_receive_packets_total{device!~"veth.*|docker.*|cni.*|flannel.*|cali.*|cbr.*"}[5m]) * on (instance) group_left() max(kube_node_labels{label_beta_kubernetes_io_instance_type!="eklet", label_node_kubernetes_io_instance_type!~"eklet"}) by (instance))`,
      },
      {
        name: 'transmit_packets',
        query: `sum(rate(node_network_transmit_packets_total{device!~"veth.*|docker.*|cni.*|flannel.*|cali.*|cbr.*"}[5m]) * on (instance) group_left() max(kube_node_labels{label_beta_kubernetes_io_instance_type!="eklet", label_node_kubernetes_io_instance_type!~"eklet"}) by (instance))`,
      }
    ],
  };

  return (
    <Row gutter={[16, 16]} className={Style.networkIoChartPanel}>
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

export default React.memo(NetworkIoChart);
