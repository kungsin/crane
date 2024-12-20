import CommonStyle from '../../../styles/common.module.less';
import SearchForm from './components/SearchForm';
import './index.module.less';
import classnames from 'classnames';
import { useCraneUrl, useDashboardControl } from 'hooks';
import React, { memo, useState } from 'react';
import { Button, Col, Dialog, Divider, MessagePlugin, Row, Space, Table, Tag } from 'tdesign-react';
import {
  recommendationApi,
  RecommendationSimpleInfo,
  RecommendationType,
  useFetchRecommendationListQuery,
} from '../../../services/recommendationApi';
import { useNavigate } from 'react-router-dom';
import JsYaml from 'js-yaml';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Prism } from '@mantine/prism';
import { copyToClipboard } from '../../../utils/copyToClipboard';
import { insightAction } from '../../../modules/insightSlice';
import { useGetNamespaceListQuery } from '../../../services/mineApi';

const Editor = React.lazy(() => import('components/common/Editor'));

export const SelectTable = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [yamlDialogVisible, setYamlDialogVisible] = useState<boolean>(false);
  const [currentSelection, setCurrentSelection] = useState<RecommendationSimpleInfo | null>(null);
  const [commandDialogVisible, setCommandDialogVisible] = useState<boolean>(false);

  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([0, 1]);
  const [visible, setVisible] = useState(false);
  const [filterParams, setFilterParams] = useState({
    namespace: undefined,
    workloadType: undefined,
    name: undefined,
    namespacePriority: undefined,
  });
  const craneUrl: any = useCraneUrl();
  const dashboardControl: any = useDashboardControl();
  const clusterId = useSelector((state) => state.insight.selectedClusterId);

  const { data, isFetching, isError, isSuccess, error } = useFetchRecommendationListQuery({
    craneUrl,
    recommendationType: RecommendationType.Replicas,
  });

  // 获取命名空间列表的 React Query
  const { data: namespaceList } = useGetNamespaceListQuery({ clusterId, pageSize: 9999 }, { skip: !clusterId });

  console.log('namespaceList', namespaceList?.data);

  // const recommendation = data?.data?.items || [];

  let recommendation: any[];
  if (isSuccess) {
    recommendation = data?.data?.items || [];
  } else {
    recommendation = [];
    if (isError) MessagePlugin.error(`${error.status} ${error.error}`);
  }

  console.log('recommendation', recommendation);

  // 将recommendation的写入优先级
  // 创建一个以 namespace 为键的映射，方便快速查找
  const namespacePriorityMap = namespaceList?.data.reduce((map, item) => {
    map[item.Namespace] = item.Priority;
    return map;
  }, {});

  // 遍历数组 a，根据 namespace 查找 Priority
  const result = recommendation.map((item) => {
    const namespace = item.namespace;
    const priority = namespacePriorityMap[namespace] || 3; // 如果找不到，默认设置为 3
    return {
      ...item,
      priority: priority,
    };
  });

  console.log('result', result);
  recommendation = result;

  const filterResult = recommendation
    .filter((recommendation) => {
      if (filterParams?.name) {
        return new RegExp(`${filterParams.name}.*`).test(recommendation.name);
      }
      return true;
    })
    .filter((recommendation) => {
      if (filterParams?.workloadType) return filterParams?.workloadType === recommendation.workloadType;
      return true;
    })
    .filter((recommendation) => {
      if (filterParams?.namespace) return filterParams?.namespace === recommendation?.namespace;
      return true;
    })
    .filter((recommendation) => {
      // 新增优先级筛选条件
      if (filterParams?.namespacePriority && filterParams?.namespacePriority != 0) {
        return recommendation?.priority === filterParams.namespacePriority;
      }
      return true;
    });

  console.log('filterResult', filterResult);
  console.log('filterParams', filterParams);
  function onSelectChange(value: (string | number)[]) {
    setSelectedRowKeys(value);
  }

  // function rehandleClickOp(record: any) {
  //   console.log(record);
  // }

  // function handleClickDelete(record: any) {
  //   console.log(record);
  //   setVisible(true);
  // }

  function handleClose() {
    setVisible(false);
  }

  const toYaml = (resource: any) => {
    let yaml = null;
    try {
      yaml = JsYaml.dump(resource);
    } catch (error) {
      //
    }
    console.log(yaml);
    return yaml;
  };

  return (
    <>
      <Row>
        <Button onClick={() => navigate('/resourceRecommend/recommendationRule')}>{t('查看推荐规则')}</Button>
      </Row>
      <Divider></Divider>
      <Row justify='start' style={{ marginBottom: '20px' }}>
        <Col>
          <SearchForm recommendation={recommendation} setFilterParams={setFilterParams} />
        </Col>
      </Row>
      <Table
        loading={isFetching || isError}
        data={filterResult}
        verticalAlign='middle'
        columns={[
          {
            title: t('名称'),
            colKey: 'metadata.name',
            ellipsis: true,
          },
          {
            title: t('推荐目标名称'),
            colKey: 'spec.targetRef.name',
          },
          {
            title: t('Namespace'),
            ellipsis: true,
            colKey: 'spec.targetRef.namespace',
          },
          {
            title: t('目标类型'),
            ellipsis: true,
            colKey: 'spec.targetRef',
            cell({ row }) {
              const { targetRef } = row.spec;
              return (
                <Space direction='vertical'>
                  <Tag theme='success' variant='light'>
                    {targetRef.kind}
                  </Tag>
                </Space>
              );
            },
          },
          {
            title: t('当前副本数'),
            ellipsis: true,
            colKey: 'status.currentInfo',
            cell({ row }) {
              console.log('row', row);
              if (typeof row.status.currentInfo === 'string') {
                const replicas = JSON.parse(row?.status?.currentInfo).spec?.replicas;
                return replicas;
              }
              return '';
            },
          },
          {
            title: t('副本数推荐'),
            ellipsis: true,
            colKey: 'status.recommendedValue.replicasRecommendation.replicas',
          },
          {
            title: t('创建时间'),
            ellipsis: true,
            colKey: 'metadata.creationTimestamp',
            cell({ row }) {
              const tmp = new Date(row.metadata.creationTimestamp);
              return `${tmp.toLocaleDateString()} ${tmp.toLocaleTimeString()}`;
            },
          },
          {
            title: t('更新时间'),
            ellipsis: true,
            colKey: 'status.lastUpdateTime',
            cell({ row }) {
              const tmp = new Date(row.status.lastUpdateTime);
              return `${tmp.toLocaleDateString()} ${tmp.toLocaleTimeString()}`;
            },
          },
          {
            align: 'left',
            fixed: 'right',
            width: 200,
            colKey: 'op',
            title: t('操作'),
            cell(record) {
              return dashboardControl ? (
                <>
                  <Button
                    theme='primary'
                    variant='text'
                    onClick={() => {
                      dispatch(insightAction.selectedWorkloadType(record.row.spec.targetRef.kind));
                      dispatch(insightAction.selectedWorkload(record.row.spec.targetRef.name));
                      dispatch(insightAction.selectedNamespace(record.row.namespace));
                      navigate('/resourceRecommend/monitor');
                    }}
                  >
                    {t('查看监控')}
                  </Button>
                  <Button
                    theme='primary'
                    variant='text'
                    onClick={() => {
                      const result: any = dispatch(
                        recommendationApi.endpoints.adoptRecommendation.initiate({
                          craneUrl,
                          namespace: record.row.namespace,
                          name: record.row.name,
                        }),
                      );
                      result
                        .unwrap()
                        .then(() => MessagePlugin.success(t('采纳推荐成功')))
                        .catch(() =>
                          MessagePlugin.error(
                            {
                              content: t('采纳推荐失败'),
                              closeBtn: true,
                            },
                            10000,
                          ),
                        );
                    }}
                  >
                    {t('采纳建议')}
                  </Button>
                  <Button
                    theme='primary'
                    variant='text'
                    onClick={() => {
                      setCurrentSelection(record.row as RecommendationSimpleInfo);
                      setYamlDialogVisible(true);
                    }}
                  >
                    {t('查看YAML')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    theme='primary'
                    variant='text'
                    onClick={() => {
                      dispatch(insightAction.selectedWorkloadType(record.row.spec.targetRef.kind));
                      dispatch(insightAction.selectedWorkload(record.row.spec.targetRef.name));
                      dispatch(insightAction.selectedNamespace(record.row.namespace));
                      navigate('/resourceRecommend/monitor');
                    }}
                  >
                    {t('查看监控')}
                  </Button>
                  <Button
                    theme='primary'
                    variant='text'
                    onClick={() => {
                      setCurrentSelection(record.row as RecommendationSimpleInfo);
                      setCommandDialogVisible(true);
                    }}
                  >
                    {t('查看采纳命令')}
                  </Button>
                  <Button
                    theme='primary'
                    variant='text'
                    onClick={() => {
                      setCurrentSelection(record.row as RecommendationSimpleInfo);
                      setYamlDialogVisible(true);
                    }}
                  >
                    {t('查看YAML')}
                  </Button>
                </>
              );
            },
          },
        ]}
        rowKey='index'
        selectedRowKeys={selectedRowKeys}
        hover
        onSelectChange={onSelectChange}
        pagination={{
          defaultCurrent: 1,
          defaultPageSize: 10,
          total: filterResult.length,
          showJumper: true,
          onChange(pageInfo) {
            console.log(pageInfo, 'onChange pageInfo');
          },
          onCurrentChange(current, pageInfo) {
            console.log(current, 'onCurrentChange current');
            console.log(pageInfo, 'onCurrentChange pageInfo');
          },
          onPageSizeChange(size, pageInfo) {
            console.log(size, 'onPageSizeChange size');
            console.log(pageInfo, 'onPageSizeChange pageInfo');
          },
        }}
      />
      <Dialog header={t('确认删除当前所选推荐规则？')} visible={visible} onClose={handleClose}>
        <p>{t('推荐规则将从API Server中删除,且无法恢复')}</p>
      </Dialog>
      <Dialog
        top='5vh'
        width={850}
        visible={yamlDialogVisible}
        onClose={() => {
          setYamlDialogVisible(false);
          setCurrentSelection(null);
        }}
        cancelBtn={null}
        onConfirm={() => {
          setYamlDialogVisible(false);
          setCurrentSelection(null);
        }}
      >
        <React.Suspense fallback={'loading'}>
          <Editor value={currentSelection ? toYaml(currentSelection) ?? '' : ''} />
        </React.Suspense>
      </Dialog>
      <Dialog
        width={850}
        header={t('查看命令')}
        visible={commandDialogVisible}
        cancelBtn={
          <Button
            onClick={async () => {
              try {
                await copyToClipboard(
                  `patchData=\`kubectl get recommend ${currentSelection?.metadata?.name} -n ${currentSelection?.spec?.targetRef?.namespace} -o jsonpath='{.status.recommendedInfo}'\`;kubectl patch ${currentSelection?.spec?.targetRef?.kind} ${currentSelection?.spec?.targetRef?.name} -n ${currentSelection?.spec?.targetRef?.namespace} --patch \"\${patchData}\"`,
                );
                await MessagePlugin.success('Copy command to clipboard.');
              } catch (err) {
                await MessagePlugin.error(`Failed to copy: ${err}`);
              }
            }}
          >
            Copy Code
          </Button>
        }
        confirmBtn={false}
        onClose={() => {
          setCommandDialogVisible(false);
          setCurrentSelection(null);
        }}
      >
        <Prism withLineNumbers language='bash' noCopy={true}>
          {`patchData=\`kubectl get recommend ${currentSelection?.metadata?.name} -n ${currentSelection?.spec?.targetRef?.namespace} -o jsonpath='{.status.recommendedInfo}'\`\nkubectl patch ${currentSelection?.spec?.targetRef?.kind} ${currentSelection?.spec?.targetRef?.name} -n ${currentSelection?.spec?.targetRef?.namespace} --patch \"\${patchData}\"`}
        </Prism>
      </Dialog>
    </>
  );
};

const selectPage: React.FC = () => (
  <div className={classnames(CommonStyle.pageWithPadding, CommonStyle.pageWithColor)}>
    <SelectTable />
  </div>
);

export default memo(selectPage);
