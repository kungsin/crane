import CommonStyle from '../../styles/common.module.less';
import './index.module.less';
import classnames from 'classnames';
import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircleFilledIcon, CloseCircleFilledIcon } from 'tdesign-icons-react';
import { Button, Col, Divider, Link, Radio, Row, Select, Space, Table, TableProps, Tag, Tooltip } from 'tdesign-react';

// table相关
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const data: TableProps['data'] = [];
const total = 28;
type SizeEnum = 'small' | 'medium' | 'large';
for (let i = 0; i < total; i++) {
  data.push({
    index: i + 1,
    applicant: ['贾明', '张三', '王芳'][i % 3],
    channel: ['电子签署', '纸质签署', '纸质签署'][i % 3],
    detail: {
      email: ['w.cezkdudy@lhll.au', 'r.nmgw@peurezgn.sl', 'p.cumx@rampblpa.ru'][i % 3],
    },
    matters: ['宣传物料制作费用', 'algolia 服务报销', '相关周边制作费', '激励奖品快递费'][i % 4],
    time: [2, 3, 1, 4][i % 4],
    createTime: ['2022-01-01', '2022-02-01', '2022-03-01', '2022-04-01', '2022-05-01'][i % 4],

    id: i + 1,
    name: ['Demo Cluster', 'Demo Cluster', 'Demo Cluster'][i % 3],
    url: ['http://dashboard.gocrane.io', 'http://dashboard.gocrane.io', 'http://dashboard.gocrane.io'][i % 3],
    discount: [100, 100, 100][i % 3],
    status: ['0', '1'][i % 2],
  });
}

const statusNameListMap = {
  0: { label: '启用', theme: 'success', icon: <CheckCircleFilledIcon /> },
  1: { label: '已禁用', theme: 'danger', icon: <CloseCircleFilledIcon /> },
};

export const SelectTable = () => {
  const { t } = useTranslation();
  // 选择器
  const [value, setValue] = useState('');
  const onChange = (value: string) => {
    setValue(value);
  };

  // table
  const [stripe, setStripe] = useState(false);
  const [bordered, setBordered] = useState(false);
  const [hover, setHover] = useState(false);
  const [tableLayout, setTableLayout] = useState(false);
  const [size, setSize] = useState<SizeEnum>('medium');
  const [showHeader, setShowHeader] = useState(true);
  const table = (
    <Table
      data={data}
      columns={[
        { colKey: 'id', title: '集群id', width: '100' },
        { colKey: 'name', title: '集群名称', width: '150' },
        { colKey: 'url', title: 'URL', width: '300' },
        { colKey: 'discount', title: '折扣', width: '110' },

        {
          colKey: 'status',
          title: '状态',
          cell: ({ row }) => (
            <Tag
              shape='round'
              theme={
                statusNameListMap[row.status as keyof typeof statusNameListMap]?.theme as
                  | 'success'
                  | 'danger'
                  | 'warning'
                  | 'default'
                  | 'primary'
                  | undefined
              }
              variant='light-outline'
              icon={statusNameListMap[row.status as keyof typeof statusNameListMap].icon}
            >
              {statusNameListMap[row.status as keyof typeof statusNameListMap].label}
            </Tag>
          ),
        },
        { colKey: 'createTime', title: '操作时间' },
        {
          colKey: 'operation',
          title: '操作',
          cell: ({ row }) => (
            <Space align='center'>
              <Link hover='color' theme='primary'>
                修改
              </Link>
              <Link hover='color' theme='primary'>
                查看
              </Link>
              <Link hover='color' theme='danger'>
                删除
              </Link>
            </Space>
          ),
          width: 180,
          foot: '-',
          fixed: 'right',
        },
      ]}
      rowKey='index'
      verticalAlign='top'
      size={size}
      bordered={bordered}
      hover={hover}
      stripe={stripe}
      showHeader={showHeader}
      tableLayout={tableLayout ? 'auto' : 'fixed'}
      rowClassName={({ rowIndex }) => `${rowIndex}-class`}
      cellEmptyContent={'-'}
      resizable
      // 与pagination对齐
      pagination={{
        defaultCurrent: 1,
        defaultPageSize: 5,
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

  return (
    <>
      {/* 按钮 */}
      <Row>
        <Col span={1}>
          <Button>{t('添加集群')}</Button>
        </Col>
        {/* <Col span={1}>
          <Button>{t('生成注册码')}</Button>
        </Col> */}
      </Row>
      <Divider></Divider>
      {/* 选择器 */}
      <Row justify='start' style={{ marginBottom: '20px' }}>
        <Col span={4} style={{ display: 'flex', alignItems: 'center' }}>
          <span>集群名称/id</span>
          <Select
            value={value}
            onChange={onChange}
            style={{ marginLeft: '20px', width: '200px' }}
            clearable
            options={[
              { label: '架构云', value: '1', title: '架构云选项' },
              { label: '大数据', value: '2' },
              { label: '区块链', value: '3' },
              { label: '物联网', value: '4', disabled: true },
              {
                label: '人工智能',
                value: '5',
                content: (
                  <Tooltip content='人工智能'>
                    <span>人工智能（新）</span>
                  </Tooltip>
                ),
                title: null,
              },
            ]}
          />
        </Col>
      </Row>

      <Space direction='vertical' style={{ marginTop: '10px' }}>
        {/* <RadioGroup value={size} variant='default-filled' onChange={(size: SizeEnum) => setSize(size)}>
          <RadioButton value='small'>小尺寸</RadioButton>
          <RadioButton value='medium'>中尺寸</RadioButton>
          <RadioButton value='large'>大尺寸</RadioButton>
        </RadioGroup> */}
        {/* <Space>
          <Checkbox value={stripe} onChange={setStripe}>
            显示斑马纹
          </Checkbox>
          <Checkbox value={bordered} onChange={setBordered}>
            显示表格边框
          </Checkbox>
          <Checkbox value={hover} onChange={setHover}>
            显示悬浮效果
          </Checkbox>
          <Checkbox value={tableLayout} onChange={setTableLayout}>
            宽度自适应
          </Checkbox>
          <Checkbox value={showHeader} onChange={setShowHeader}>
            显示表头
          </Checkbox>
        </Space> */}

        {table}
      </Space>
    </>
  );
};

const selectPage: React.FC = () => (
  <div className={classnames(CommonStyle.pageWithPadding, CommonStyle.pageWithColor)}>
    <SelectTable />
  </div>
);

export default memo(selectPage);
