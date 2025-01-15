import { QueryWindow, usePredictQueryWindowOptions } from '../../../models';
import CommonStyle from '../../../styles/common.module.less';
import classnames from 'classnames';
import { Card } from 'components/common/Card';
import { useSelector } from 'hooks';
import { insightAction } from 'modules/insightSlice';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { DatePicker, DateValue, Radio, RadioValue } from 'tdesign-react';
import { rangeMap } from 'utils/rangeMap';
import { useFetchNamespaceListQuery } from '../../../services/namespaceApi';

const ALL_NAMESPACE_VALUE = 'All';

export const OverviewSearchPanel = React.memo(() => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const customRangePre = useSelector((state) => state.insight.customRangePre);
  const windowPre = useSelector((state) => state.insight.windowPre);
  const clusterId = useSelector((state) => state.insight.selectedClusterId);
  const isNeedSelectNamespace = true;

  const namespaceList = useFetchNamespaceListQuery({ clusterId }, { skip: !clusterId || !isNeedSelectNamespace });

  const queryWindowOptions = usePredictQueryWindowOptions();

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
              value={windowPre}
              onChange={(value: RadioValue) => {
                dispatch(insightAction.windowPre(value as QueryWindow));
                const [start, end] = rangeMap[value as QueryWindow];
                dispatch(
                  insightAction.customRangePre({ start: start.toDate().toISOString(), end: end.toDate().toISOString() }),
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
            value={customRangePre?.start}
            onChange={(start: DateValue) => {
              dispatch(insightAction.windowPre(null as any));
              dispatch(
                insightAction.customRangePre({
                  ...customRangePre,
                  start: start as string,
                }),
              );
            }}
          />
          <DatePicker
            mode='date'
            style={{ marginRight: '0.5rem' }}
            value={customRangePre?.end ?? null}
            onChange={(end: any) => {
              dispatch(insightAction.windowPre(null as any));
              dispatch(
                insightAction.customRangePre({
                  ...customRangePre,
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
