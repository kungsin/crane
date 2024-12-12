import CommonStyle from '../../../styles/common.module.less';
import './index.module.less';
import classnames from 'classnames';
import React, { memo, useState } from 'react';
import { Table, Radio, Space, Tag } from 'tdesign-react';
import type { TableProps } from 'tdesign-react';

import { useFetchNamespaceListQuery } from '../../../services/namespaceApi';
import { useSelector } from 'react-redux';

// const total = 28;

export function SelectTable() {
  const data: TableProps['data'] = [];

  const isNeedSelectNamespace = true;
  const clusterId = useSelector((state) => state.insight.selectedClusterId);
  const namespaceList = useFetchNamespaceListQuery({ clusterId }, { skip: !clusterId || !isNeedSelectNamespace });
  console.log('namespaceList', namespaceList?.data?.data?.items);
  for (let i = 0; i < namespaceList?.data?.data?.totalCount; i++) {
    data.push({
      index: i + 1,
      name: namespaceList?.data?.data?.items[i],
      priority: 3,
      updateTime: '2024-12-11 15:47:36',
      
      
    });
  }

  const total = namespaceList?.data?.data?.totalCount || 0;
  // <!-- 当数据为空需要占位时，会显示 cellEmptyContent -->
  const table = (
    <Table
      data={data}
      columns={[
        { colKey: 'index', title: '序号', width: '100' },
        { colKey: 'name', title: '应用', },
        { colKey: 'priority', title: '优先级' },
        { colKey: 'updateTime', title: '修改时间' },
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
  );
  return <Space direction='vertical'>{table}</Space>;
}

const selectPage: React.FC = () => (
  <div className={classnames(CommonStyle.pageWithPadding, CommonStyle.pageWithColor)}>
    <SelectTable />
  </div>
);

export default memo(selectPage);
