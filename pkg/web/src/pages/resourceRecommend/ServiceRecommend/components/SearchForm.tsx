import React, { memo, useEffect, useState } from 'react';
import { Button, Col, Form, Input, Row, Select } from 'tdesign-react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useGetNamespaceListQuery } from '../../../../services/mineApi';
import { useSelector } from 'react-redux';
const { FormItem } = Form;

export type SearchFormProps = {
  recommendation: any;
  setFilterParams: any;
};

const SearchForm: React.FC<SearchFormProps> = ({ recommendation, setFilterParams }) => {
  const { t } = useTranslation();
  const clusterId = useSelector((state) => state.insight.selectedClusterId);
  // 初始化状态
  const [filteredNameSpaceOptions, setFilteredNameSpaceOptions] = useState([]);
  const [namespacePriority, setNamespacePriority] = useState(0);

  // 获取命名空间列表的 React Query
  const { data: namespaceList } = useGetNamespaceListQuery(
    { clusterId, pageSize: 9999, priority: namespacePriority == 0 ? '' : namespacePriority },
    { skip: !clusterId },
  );
  // 当 namespacePriority 变化时，更新 filteredNameSpaceOptions
  useEffect(() => {
    console.log('namespaceList', namespaceList?.data);
    if (namespaceList?.data && Array.isArray(namespaceList.data)) {
      const options = namespaceList?.data.map((ns) => ({
        value: ns.Namespace,
        label: ns.Namespace,
      }));
      setFilteredNameSpaceOptions(options);
    } else {
      setFilteredNameSpaceOptions([]);
    }
  }, [namespaceList, namespacePriority]);

  const [renderKey, setRenderKey] = useState(0);

  const onValuesChange = (changeValues: any, allValues: any) => {
    console.log('changeValues', changeValues);
    console.log('allValues', allValues);
    // 更新 namespacePriority 状态
    if (changeValues.namespacePriority !== undefined) {
      setNamespacePriority(changeValues.namespacePriority);

      // 如果切换了优先级，且 namespace 有选中值，则清空 namespace
      if (allValues.namespace) {
        allValues.namespace = undefined; // 清空 namespace 的选中值
        setRenderKey(renderKey + 1);
        allValues.namespacePriority = changeValues.namespacePriority;
      }
    }
    if (!allValues.name) delete allValues.name;
    if (!allValues.namespace) delete allValues.namespace;
    if (!allValues.workloadType) delete allValues.workloadType;
    if (!allValues.namespacePriority) delete allValues.namespacePriority;
    setFilterParams(allValues);
  };

  const onReset = () => {
    setFilterParams({});
    setNamespacePriority(0);
    setFilteredNameSpaceOptions(nameSpaceOptions); // 重置时显示所有选项
  };

  const nameSpaceOptions = _.uniqBy(
    recommendation.map((r: { namespace: any; label: any }) => ({ value: r.namespace, label: r.namespace })),
    'value',
  );

  const nameSpacePriorityOptions = [
    { label: 'All', value: 0 },
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
  ];

  const workloadTypeOptions = _.uniqBy(
    recommendation.map((r: { workloadType: any }) => ({ value: r.workloadType, label: r.workloadType })),
    'value',
  );

  return (
    // <div className='list-common-table-query' key={renderKey}>
    <div className='list-common-table-query'>
      <Form
        onValuesChange={onValuesChange}
        onReset={onReset}
        labelWidth={80}
        layout={'inline'}
        initialValues={{ namespacePriority: 0, namespace: undefined }}
      >
        <Row>
          <Col>
            <Row>
              <Col>
                <FormItem label={t('推荐名称')} name='name'>
                  <Input placeholder={t('请输入推荐名称')} />
                </FormItem>
              </Col>
              <Col>
                {/* {namespacePriority} */}
                <FormItem label={t('Namespace优先级')} name='namespacePriority' style={{ margin: '0px 10px' }}>
                  <Select
                    value={namespacePriority}
                    options={nameSpacePriorityOptions}
                    placeholder={t('请选择Namespace优先级')}
                    filterable
                    style={{ margin: '0px 0px' }}
                  />
                </FormItem>
              </Col>
              <Col>
                <FormItem label={t('Namespace')} name='namespace' style={{ margin: '0px 10px' }}>
                  <Select
                    options={filteredNameSpaceOptions}
                    placeholder={t('请选择Namespace')}
                    filterable
                    style={{ margin: '0px 0px' }}
                  />
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col>
            <Row>
              {/* <Col>
                <FormItem label={t('工作负载类型')} name='workloadType'>
                  <Select
                    options={workloadTypeOptions}
                    placeholder={t('请选择工作负载类型')}
                    filterable
                    style={{ margin: '0px 0px' }}
                  />
                </FormItem>
              </Col> */}
              <Col>
                <Button type='reset' variant='base' theme='default'>
                  {t('重置')}
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default memo(SearchForm);
