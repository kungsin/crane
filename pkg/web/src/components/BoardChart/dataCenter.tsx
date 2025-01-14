import React from 'react';
import { ChevronRightIcon, CloseCircleIcon, UsergroupIcon, InfoCircleIcon } from 'tdesign-icons-react';
import { Card, MessagePlugin, Tooltip } from 'tdesign-react';
import classnames from 'classnames';
import Style from './index.module.less';
import { useInstantPrometheusQuery, useRangePrometheusQuery } from '../../services/prometheusApi';
import { useCraneUrlAll } from '../../hooks';
import ReactEcharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';

export enum ETrend {
  up,
  down,
  error,
}

export enum DataSource {
  Prometheus = 'Prometheus',
}

export enum ChartType {
  Pie = 'Pie',
  Line = 'Line',
}

export enum TimeType {
  Instant = 'Instant',
  Range = 'Range',
}

export interface IBoardProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  count?: string;
  countPrefix?: string;
  Icon?: React.ReactElement;
  desc?: string;
  trend?: ETrend;
  trendNum?: string;
  dark?: boolean;
  border?: boolean;
  lineColor?: string;
  dataSource?: DataSource;
  chartType?: ChartType;
  timeType?: TimeType;
  query?: string;
  timeRange?: number;
  step?: string;
  start?: number;
  end?: number;
  tips?: string;
}

const fetchData = (craneUrls: string[], { query, timeType, start, end, step }: IBoardProps) => {
  if (typeof query !== 'string')
    return {
      error: 'must be set query',
    };

  // 处理多个 craneUrl
  const results = craneUrls.map((craneUrl) => {
    let result;
    let preTime;
    let preResult;

    switch (timeType) {
      case TimeType.Instant:
        result = useInstantPrometheusQuery({ craneUrl, query });
        return result;
      case TimeType.Range:
        result = useRangePrometheusQuery({ craneUrl, start, end, step, query });
        preTime = (Math.floor(Date.now() / 1000) - 604800) * 1000; // 1 week ago
        preResult = useInstantPrometheusQuery({ craneUrl, query, time: preTime });
        return { result, preResult };
      default:
        return { error: 'must be set timeType' };
    }
  });

  // 计算所有结果的累加值
  const sumResult = results.reduce(
    (acc, curr) => {
      if (curr?.result?.data?.latestValue) {
        acc.latestValue += parseFloat(curr.result.data.latestValue) || 0;
      }
      if (curr?.preResult?.data?.latestValue) {
        acc.preLatestValue += parseFloat(curr.preResult.data.latestValue) || 0;
      }
      return acc;
    },
    { latestValue: 0, preLatestValue: 0 },
  );

  return {
    result: { data: { latestValue: sumResult.latestValue.toString(), values: [] } }, // 确保返回的数据结构包含 values
    preResult: { data: { latestValue: sumResult.preLatestValue.toString(), values: [] } },
    error: '',
  };
};

const buildIcon = ({ data }: any, { title, timeType, lineColor = '#0352d9' }: any): { Icon: any; error: string } => {
  // 检查 data 是否存在，以及 data.data 是否为数组且不为空
  const source = data?.data?.[0]?.values || [];

  const dynamicChartOption = {
    dataset: {
      dimensions: ['timestamp', title],
      source: source, // 使用经过检查的 source
    },
    xAxis: {
      type: 'time',
      show: false,
    },
    yAxis: {
      show: false,
    },
    grid: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      tooltip: {
        show: false,
      },
    },
    color: [lineColor],
    series: [
      {
        name: title,
        type: 'line',
        smooth: false,
        encode: {
          x: 'timestamp',
          y: title,
        },
        showSymbol: false,
      },
    ],
  };

  // 如果数据为空，返回默认图标
  if (!data || !data.data || data.data.length === 0 || data.emptyData) {
    return {
      Icon: (
        <div className={Style.iconWrap}>
          <UsergroupIcon className={Style.svgIcon} />
        </div>
      ),
      error: '',
    };
  }

  switch (timeType) {
    case TimeType.Range:
      return {
        Icon: (
          <div className={Style.paneLineChart}>
            <ReactEcharts option={dynamicChartOption} notMerge={true} lazyUpdate={true} style={{ height: 56 }} />
          </div>
        ),
        error: '',
      };
    case TimeType.Instant:
      return {
        Icon: {},
        error: '',
      };
    default:
      return {
        Icon: '',
        error: 'must be set timeType',
      };
  }
};

export const TrendIcon = ({ trend, trendNum }: { trend?: ETrend; trendNum?: string | number }) => (
  <div
    className={classnames({
      [Style.trendColorUp]: trend === ETrend.up,
      [Style.trendColorDown]: trend === ETrend.down,
      [Style.trendColorError]: trend === ETrend.error,
    })}
  >
    <div
      className={classnames(Style.trendIcon, {
        [Style.trendIconUp]: trend === ETrend.up,
        [Style.trendIconDown]: trend === ETrend.down,
        [Style.trendColorError]: trend === ETrend.error,
      })}
    >
      {((trend?: ETrend) => {
        switch (trend) {
          case ETrend.up:
            return (
              <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M4.5 8L8 4.5L11.5 8' stroke='currentColor' strokeWidth='1.5' />
                <path d='M8 5V12' stroke='currentColor' strokeWidth='1.5' />
              </svg>
            );
          case ETrend.down:
            return (
              <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M11.5 8L8 11.5L4.5 8' stroke='currentColor' strokeWidth='1.5' />
                <path d='M8 11L8 4' stroke='currentColor' strokeWidth='1.5' />
              </svg>
            );
          case ETrend.error:
            return <CloseCircleIcon />;
          default:
            return <CloseCircleIcon />;
        }
      })(trend)}
    </div>
    {trendNum}
  </div>
);

function getPercentageChange(oldNumber: any, newNumber: any) {
  const decreaseValue = oldNumber - newNumber;
  return (decreaseValue / oldNumber) * 100;
}

const BoardChart = ({
  title,
  countPrefix,
  desc,
  Icon,
  dark,
  border,
  query,
  timeType,
  lineColor,
  start,
  end,
  step,
  tips,
}: IBoardProps) => {
  const craneUrls = useCraneUrlAll(); // 获取所有 craneUrl
  const { t } = useTranslation();

  let fetchDataResult;
  try {
    fetchDataResult = fetchData(craneUrls, { query, timeType, start, end, step });
  } catch (e) {
    fetchDataResult = {
      error: e,
      result: { data: { latestValue: '0', values: [] } }, // 确保返回的数据结构包含 values
    };
    console.log(e);
  }

  const { result, error } = fetchDataResult;

  let IconResult;
  if (!Icon && result?.isFetching !== true) {
    IconResult = buildIcon(result, { title, timeType, lineColor });
  }

  let count: React.ReactNode = null;
  if (error) {
    count = error as any;
  } else if (
    (typeof result?.isFetching === 'boolean' && result?.isFetching === true) ||
    (typeof result?.isError === 'boolean' && result?.isError === true) ||
    result?.data?.emptyData
  ) {
    count = 'No Data';
  } else {
    count = `${countPrefix || ''}${result?.data?.latestValue || ''}`;
  }

  let trendNum;
  let trend;
  if (
    fetchDataResult?.result?.data &&
    fetchDataResult?.preResult?.data &&
    !fetchDataResult?.preResult?.data?.emptyData
  ) {
    const calc = getPercentageChange(
      fetchDataResult.preResult?.data?.latestValue,
      fetchDataResult.result?.data?.latestValue,
    );
    trendNum = `${(Math.floor(calc * 100) / 100) * -1}%`;
    trend = calc < 0 ? ETrend.up : ETrend.down;
  } else {
    trendNum = t('历史数据不足');
    trend = ETrend.error;
  }

  if (result?.isError) MessagePlugin.error(`[${title}] Check Your Network Or Query Params !!!`);

  return (
    <Card
      loading={result?.isFetching}
      header={
        <div className={Style.boardTitle}>
          {title}
          <span style={{ marginLeft: '5px' }}>
            <Tooltip content={<p style={{ fontWeight: 'normal' }}>{tips}</p>} placement={'top'}>
              <InfoCircleIcon />
            </Tooltip>
          </span>
        </div>
      }
      className={classnames({
        [Style.boardPanelDark]: dark,
      })}
      bordered={border}
      footer={
        <div className={Style.boardItemBottom}>
          <div className={Style.boardItemDesc}>
            {desc}
            <TrendIcon trend={trend} trendNum={trendNum} />
          </div>
          <ChevronRightIcon className={Style.boardItemIcon} />
        </div>
      }
    >
      <div className={Style.boardItem}>
        <div className={Style.boardItemLeft}>{count}</div>
        <div className={Style.boardItemRight}>{Icon}</div>
      </div>
    </Card>
  );
};

export default React.memo(BoardChart);
