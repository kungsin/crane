import { QueryWindow, useQueryWindowOptions } from '../../../models';
import CommonStyle from '../../../styles/common.module.less';
import classnames from 'classnames';
import { Card } from 'components/common/Card';
import { useCraneUrl, useSelector } from 'hooks';
import { insightAction } from 'modules/insightSlice';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { DatePicker, DateValue, InputNumber, Radio, RadioValue, Select } from 'tdesign-react';
import { rangeMap } from 'utils/rangeMap';
import { useFetchNamespaceListQuery } from '../../../services/namespaceApi';
import _ from 'lodash';

const ALL_NAMESPACE_VALUE = 'All';

export const OverviewSearchPanel = React.memo(() => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const customRange = useSelector((state) => state.insight.customRange);
  const window = useSelector((state) => state.insight.window);
  const selectedNamespace = useSelector((state) => state.insight.selectedNamespace);
  const clusterId = useSelector((state) => state.insight.selectedClusterId);
  const discount = useSelector((state) => state.insight.discount);
  const isNeedSelectNamespace = true;

  const namespaceList = useFetchNamespaceListQuery({ clusterId }, { skip: !clusterId || !isNeedSelectNamespace });

  const queryWindowOptions = useQueryWindowOptions();

  const namespaceOptions = React.useMemo(
    () => [
      {
        value: ALL_NAMESPACE_VALUE,
        label: 'All',
      },
      ...(namespaceList?.data?.data?.items ?? []).map((namespace) => ({
        label: namespace,
        value: namespace,
      })),
    ],
    [namespaceList?.data?.data?.items],
  );

  React.useEffect(() => {
    if (namespaceList.isSuccess && isNeedSelectNamespace && namespaceOptions?.[0]?.value) {
      dispatch(insightAction.selectedNamespace(namespaceOptions[0].value));
    }
  }, [dispatch, isNeedSelectNamespace, namespaceList.isSuccess, namespaceOptions]);

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
          <div style={{ marginRight: '0.5rem', width: '70px' }}>{t('时间范围')}</div>
          <div style={{ marginRight: '0.5rem' }}>
            <Radio.Group
              value={window}
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
          <div style={{ marginRight: '1rem', width: '70px' }}>{t('Discount')}</div>
          <InputNumber
            min={0}
            theme='column'
            value={discount}
            onChange={(value) => {
              dispatch(insightAction.discount(value));
            }}
          />
        </div>
      </Card>
    </div>
  );
});
