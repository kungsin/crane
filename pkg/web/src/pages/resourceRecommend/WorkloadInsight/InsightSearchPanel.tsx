import { QueryWindow, useQueryWindowOptions } from '../../../models';
import CommonStyle from '../../../styles/common.module.less';
import classnames from 'classnames';
import { Card } from 'components/common/Card';
import { useCraneUrl, useSelector } from 'hooks';
import { insightAction } from 'modules/insightSlice';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { DatePicker, DateValue, Radio, RadioValue, Select } from 'tdesign-react';
import { rangeMap } from 'utils/rangeMap';
import { useFetchNamespaceListQuery } from '../../../services/namespaceApi';
import { useFetchSeriesListQuery } from '../../../services/grafanaApi';
import _ from 'lodash';

const ALL_NAMESPACE_VALUE = 'ALL';

export const InsightSearchPanel = React.memo(() => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const customRange = useSelector((state) => state.insight.customRange);
  const selectedWindow = useSelector((state) => state.insight.window);
  const selectedNamespace = useSelector((state) => state.insight.selectedNamespace);
  const selectedWorkload = useSelector((state) => state.insight.selectedWorkload);
  const selectedWorkloadType = useSelector((state) => state.insight.selectedWorkloadType);
  const clusterId = useSelector((state) => state.insight.selectedClusterId);

  const isNeedSelectNamespace = true;
  const craneUrl: any = useCraneUrl();

  const namespaceList = useFetchNamespaceListQuery({ clusterId }, { skip: !clusterId || !isNeedSelectNamespace });

  const queryWindowOptions = useQueryWindowOptions();

  const namespaceOptions = React.useMemo(
    () => [
      ...(namespaceList?.data?.data?.items ?? []).map((namespace) => ({
        label: namespace,
        value: namespace,
      })),
    ],
    [namespaceList?.data?.data?.items],
  );

  const workloadTypeList = useFetchSeriesListQuery(
    {
      craneUrl,
      start: (Date.parse(customRange.start) / 1000).toString(),
      end: (Date.parse(customRange.end) / 1000).toString(),
      match: `crane_analysis_resource_recommendation{namespace=~"(${
        selectedNamespace === 'ALL'
          ? namespaceOptions
              .filter((option) => option.label !== ALL_NAMESPACE_VALUE)
              .map((option) => option.label)
              .join('|')
          : selectedNamespace
      })"}`,
    },
    { skip: !selectedNamespace },
  );

  const workloadTypeOptions: any[] = React.useMemo(
    () =>
      _.unionBy(
        (workloadTypeList.data?.data ?? []).map((data: any) => ({
          label: data.owner_kind,
          value: data.owner_kind,
        })),
        'value',
      ),
    [workloadTypeList.data],
  );

  const workloadList = useFetchSeriesListQuery({
    craneUrl,
    start: (Date.parse(customRange.start) / 1000).toString(),
    end: (Date.parse(customRange.end) / 1000).toString(),
    match: `crane_analysis_resource_recommendation{namespace=~"(${
      selectedNamespace === 'ALL'
        ? namespaceOptions
            .filter((option) => option.label !== ALL_NAMESPACE_VALUE)
            .map((option) => option.label)
            .join('|')
        : selectedNamespace
    })"${selectedWorkloadType ? `, owner_kind="${selectedWorkloadType}"` : ''}}`,
  });

  const workloadOptions: any[] = React.useMemo(() => {
    const options = _.uniqBy(
      [
        ...(workloadList.data?.data ?? []).map((data: any) => ({
          label: data.owner_name,
          value: data.owner_name,
        })),
      ],
      'value',
    );

    return options;
  }, [workloadList.data]);

  React.useEffect(() => {
    if (namespaceList.isSuccess && isNeedSelectNamespace && namespaceOptions?.[0]?.value && !selectedNamespace) {
      dispatch(insightAction.selectedNamespace(namespaceOptions[0].value));
    }
  }, [dispatch, isNeedSelectNamespace, namespaceList.isSuccess, namespaceOptions]);

  React.useEffect(() => {
    if (workloadTypeList.isSuccess && workloadTypeOptions?.[0]?.value && !selectedWorkloadType) {
      dispatch(insightAction.selectedWorkloadType(workloadTypeOptions[0].value));
    }
  }, [dispatch, workloadTypeList.isSuccess, workloadTypeOptions]);

  React.useEffect(() => {
    if (workloadList.isSuccess && workloadOptions?.[0]?.value && !selectedWorkload) {
      dispatch(insightAction.selectedWorkload(workloadOptions[0].value));
    }
  }, [dispatch, workloadList.isSuccess, workloadOptions]);

  /* React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlWorkload = urlParams.get('workload');
    const urlWorkloadType = urlParams.get('workloadType');

    if (urlWorkloadType) {
      dispatch(insightAction.selectedWorkloadType(urlWorkloadType));
    }

    if (urlWorkload) {
      dispatch(insightAction.selectedWorkload(urlWorkload));
    }
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (selectedWorkloadType) {
      params.set('workloadType', selectedWorkloadType);
    }
    if (selectedWorkload) {
      params.set('workload', selectedWorkload);
    }
    const search = params.toString();
    const url = window.location.origin + window.location.pathname + window.location.hash.split('?')[0]; + (search ? `?${search}` : '');
    window.history.replaceState({path: url}, '', url);
  }, [selectedWorkloadType, selectedWorkload]);
*/

  return (
    <div className={classnames(CommonStyle.pageWithPadding, CommonStyle.pageWithColor)}>
      <Card style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: '1rem',
            marginTop: 5,
            marginBottom: 5,
          }}
        >
          <div style={{ marginRight: '1rem', width: '80px' }}>{t('命名空间')}</div>
          <Select
            options={namespaceOptions}
            placeholder={t('命名空间')}
            filterable
            value={selectedNamespace ?? undefined}
            onChange={(value: any) => {
              dispatch(insightAction.selectedNamespace(value));
              dispatch(insightAction.selectedWorkloadType(undefined));
              dispatch(insightAction.selectedWorkload(undefined));
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: '1rem',
            marginTop: 5,
            marginBottom: 5,
          }}
        >
          <div style={{ marginRight: '1rem', width: '140px' }}>{t('Workload类型')}</div>
          <Select
            options={workloadTypeOptions}
            placeholder={t('Workload类型')}
            filterable
            value={selectedWorkloadType ?? undefined}
            onChange={(value: any) => {
              dispatch(insightAction.selectedWorkloadType(value));
              dispatch(insightAction.selectedWorkload(undefined));
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: '1rem',
            marginTop: 5,
            marginBottom: 5,
          }}
        >
          <div style={{ marginRight: '1rem', width: '80px' }}>{t('Workload')}</div>
          <Select
            options={workloadOptions}
            placeholder={t('Workload')}
            filterable
            value={selectedWorkload ?? undefined}
            onChange={(value: any) => {
              dispatch(insightAction.selectedWorkload(value));
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: '1rem',
            marginTop: 5,
            marginBottom: 5,
          }}
        >
          <div style={{ marginRight: '0.5rem', width: '70px' }}>{t('时间范围')}</div>
          <div style={{ marginRight: '0.5rem' }}>
            <Radio.Group
              value={selectedWindow}
              onChange={(value: RadioValue) => {
                dispatch(insightAction.window(value as QueryWindow));
                const [start, end] = rangeMap[value as QueryWindow];
                dispatch(
                  insightAction.customRange({ start: start.toDate().toISOString(), end: end.toDate().toISOString() }),
                );
              }}
            >
              {queryWindowOptions.map((option) => (
                <Radio.Button key={option.value} value={option.value}>
                  {option.text}
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>
          <DatePicker
            mode='date'
            style={{ marginRight: '0.5rem' }}
            value={customRange?.start}
            onChange={(start: DateValue) => {
              dispatch(insightAction.window(null as any));
              dispatch(
                insightAction.customRange({
                  ...customRange,
                  start: start as string,
                }),
              );
            }}
          />
          <DatePicker
            mode='date'
            style={{ marginRight: '0.5rem' }}
            value={customRange?.end ?? null}
            onChange={(end: any) => {
              dispatch(insightAction.window(null as any));
              dispatch(
                insightAction.customRange({
                  ...customRange,
                  end,
                }),
              );
            }}
          />
        </div>
      </Card>
    </div>
  );
});
