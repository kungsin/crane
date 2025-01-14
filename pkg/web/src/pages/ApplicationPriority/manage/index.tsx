import CommonStyle from '../../../styles/common.module.less';
import './index.module.less';
import classnames from 'classnames';
import React, { memo, useEffect, useState } from 'react';
import { Table, Radio, Space, Tag, Button, InputNumber, MessagePlugin, Tooltip } from 'tdesign-react';
import type { TableProps } from 'tdesign-react';

import { useFetchNamespaceListQuery } from '../../../services/namespaceApi';
import { useGetNamespaceListQuery, useUpdateNamespaceInfoMutation } from '../../../services/mineApi';
import { useSelector } from 'react-redux';
import { HelpCircleIcon, HelpIcon } from 'tdesign-icons-react';

// const total = 28;

export function SelectTable() {
  const data: TableProps['data'] = [];

  const isNeedSelectNamespace = true;
  const clusterId = useSelector((state) => state.insight.selectedClusterId);
  const dataNameSpaceList = useGetNamespaceListQuery(
    { clusterId, pageSize: 9999 },
    { skip: !clusterId || !isNeedSelectNamespace },
  );

  console.log('dataNameSpaceList', dataNameSpaceList?.data?.data);
  const namespaceList = useFetchNamespaceListQuery({ clusterId }, { skip: !clusterId || !isNeedSelectNamespace });
  console.log('namespaceList', namespaceList?.data?.data?.items);

  // 数组整合处理操作
  const array1 = dataNameSpaceList?.data?.data || [];
  const array2 = namespaceList?.data?.data?.items || [];

  // 将数组1转换为以Namespace为键的Map，便于快速查找
  const array1Map = new Map(array1.map((item) => [item.Namespace, item]));
  console.log('array1Map', array1Map);
  console.log('array1Map', array1Map.get('test_namespace1'));

  // 整合数组1和数组2
  const result = array2.map((namespace) => {
    if (array1Map.has(namespace)) {
      // 如果数组1中有匹配的Namespace，直接返回数组1中的对象
      return array1Map.get(namespace);
    }
    // eslint-disable-next-line no-else-return
    else {
      // 如果数组1中没有匹配的Namespace，创建一个新对象，Priority设置为3
      return {
        Namespace: namespace,
        Priority: 3,
      };
    }
  });
  console.log('result', result);

  // 使用 useUpdateNamespaceInfoMutation 获取 mutation 函数
  const [updateNamespaceInfo] = useUpdateNamespaceInfoMutation();
  const updateNamespace = async (clusterId, data) => {
    const data1 = await updateNamespaceInfo({ clusterId, body: data });
    console.log(111, data1?.data?.code);
    if (data1?.data?.code == 200) {
      MessagePlugin.success('同步成功');
    } else {
      MessagePlugin.error('同步失败');
    }
  };

  useEffect(() => {
    if (clusterId && result.length > 0) {
      updateNamespace(clusterId, result);
    }
  }, []);

  const total = namespaceList?.data?.data?.totalCount || 0;
  // <!-- 当数据为空需要占位时，会显示 cellEmptyContent -->
  const table = (
    <>
      <Table
        data={result}
        columns={[
          // { colKey: 'Id', title: '序号', width: '100' },
          { colKey: 'Namespace', title: '应用' },
          {
            colKey: 'Priority',
            // title: '优先级',
            title: () => (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                优先级
                <Tooltip content='优先级 1为最高, 5为最低' destroyOnClose showArrow theme='default'>
                  <HelpCircleIcon style={{ marginRight: 5 }}></HelpCircleIcon>
                </Tooltip>
              </span>
            ),
            // eslint-disable-next-line arrow-body-style
            cell: ({ row }) => {
              return (
                <>
                  {/* {row.Priority}| */}
                  <InputNumber
                    value={row.Priority}
                    max={5}
                    min={1}
                    theme='column'
                    onChange={async (v) => {
                      console.log(v);
                      console.log(row);

                      const body = result.map((item, index) => {
                        if (item.Namespace === row.Namespace) {
                          return { ...item, Priority: v };
                        } else return item;
                      });
                      // 更新优先级
                      const data = await updateNamespaceInfo({
                        clusterId,
                        body,
                      });
                      console.log(11, data?.data?.code);
                      if (data?.data?.code === 200) {
                        MessagePlugin.success('修改成功');
                      } else {
                        MessagePlugin.error('修改失败');
                      }
                    }}
                  />
                </>
              );
            },
          },
          { colKey: 'ClusterId', title: '集群Id' },
          { colKey: 'CreatTime', title: '创建时间' },
          { colKey: 'UpdateTime', title: '修改时间' },
        ]}
        rowKey='index'
        verticalAlign='top'
        rowClassName={({ rowIndex }) => `${rowIndex}-class`}
        cellEmptyContent={'-'}
        resizable
        // 与pagination对齐
        pagination={{
          defaultCurrent: 1,
          defaultPageSize: 10,
          total,
          showJumper: true,
          onChange(pageInfo) {
            console.log(pageInfo, 'onChange pageInfo');
          },
          onCurrentChange(current, pageInfo) {
            console.log(current, pageInfo, 'onCurrentChange current');
          },
          onPageSizeChange(size, pageInfo) {
            console.log(size, pageInfo, 'onPageSizeChange size');
          },
        }}
        onPageChange={(pageInfo) => {
          console.log(pageInfo, 'onPageChange');
        }}
        onRowClick={({ row, index, e }) => {
          console.log('onRowClick', { row, index, e });
        }}
      />
    </>
  );

  return (
    <>
      <Button theme='primary' variant='base' onClick={() => updateNamespace(clusterId, result)}>
        数据同步
      </Button>
      <Space direction='vertical'>{table}</Space>
    </>
  );
}

const selectPage: React.FC = () => (
  <div className={classnames(CommonStyle.pageWithPadding, CommonStyle.pageWithColor)}>
    <SelectTable />
  </div>
);

export default memo(selectPage);
