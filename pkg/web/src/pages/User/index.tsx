import CommonStyle from '../../styles/common.module.less';
import './index.module.less';
import classnames from 'classnames';
import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CheckCircleFilledIcon, CloseCircleFilledIcon, ErrorCircleFilledIcon } from 'tdesign-icons-react';
import {
  Button,
  Col,
  Dialog,
  DialogProps,
  Divider,
  Input,
  Link,
  Radio,
  Row,
  Select,
  Space,
  Table,
  TableProps,
  Tag,
  Tooltip,
} from 'tdesign-react';
import { useGetUserInfoQuery } from '../../services/userApi';

// table相关
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
// eslint-disable-next-line prefer-const
let data: TableProps['data'] = [];
// eslint-disable-next-line prefer-const
let total = 1;
type SizeEnum = 'small' | 'medium' | 'large';
// for (let i = 0; i < total; i++) {
//   data.push({
//     index: i + 1,
//     applicant: ['贾明', '张三', '王芳'][i % 3],
//     channel: ['电子签署', '纸质签署', '纸质签署'][i % 3],
//     detail: {
//       email: ['w.cezkdudy@lhll.au', 'r.nmgw@peurezgn.sl', 'p.cumx@rampblpa.ru'][i % 3],
//     },
//     matters: ['宣传物料制作费用', 'algolia 服务报销', '相关周边制作费', '激励奖品快递费'][i % 4],
//     time: [2, 3, 1, 4][i % 4],
//     createTime: ['2022-01-01', '2022-02-01', '2022-03-01', '2022-04-01', '2022-05-01'][i % 4],

//     id: i + 1,
//     name: ['王小', '李四', '张三'][i % 3],
//     phone: ['13000000000', '18600000000', '15200000000'][i % 3],
//     status: i % 3,
//     registCode: ['123456', '123457', '123458'][i % 3],
//     userPermission: ['0', '1'][i % 2],
//   });
// }

const statusNameListMap = {
  0: { label: '正常', theme: 'success', icon: <CheckCircleFilledIcon /> },
  1: { label: '已禁用', theme: 'danger', icon: <CloseCircleFilledIcon /> },
  2: { label: '待审核', theme: 'warning', icon: <ErrorCircleFilledIcon /> },
};

const userListMap = {
  0: { label: '管理员', theme: 'success', variant: 'dark' },
  1: { label: '普通用户', theme: 'default', variant: 'light' },
};

export const SelectTable = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  // 选择器
  const [value, setValue] = useState('');
  const onChange = (value: string) => {
    setValue(value);
  };

  const { data: userInfo } = useGetUserInfoQuery();
  console.log(11111, userInfo?.data);
  const userList = userInfo?.data;
  data = [];
  total = userList?.length;
  for (let i = 0; i < userList?.length; i++) {
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

      id: userList[i].Id,
      name: userList[i].Username,
      phone: userList[i].Phone,
      status: 0,
      registCode: ['123456', '123457', '123458'][i % 3],
      userPermission: userList[i].IsAdmin ? 0 : 1,
    });
  }
  // data = userInfo.data;
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
        { colKey: 'id', title: 'id', width: '100' },
        { colKey: 'name', title: '用户名', width: '100' },
        { colKey: 'phone', title: '手机号', width: '200' },
        {
          colKey: 'status',
          title: '用户状态',
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
        { colKey: 'registCode', title: '用户注册码' },
        // userListMap
        {
          colKey: 'userPermission',
          title: '用户权限',
          cell: ({ row }) => (
            <Tag
              shape='round'
              theme={
                userListMap[row.userPermission as keyof typeof userListMap]?.theme as
                  | 'success'
                  | 'danger'
                  | 'warning'
                  | 'default'
                  | 'primary'
                  | undefined
              }
              variant={
                userListMap[row.userPermission as keyof typeof userListMap]?.variant as
                  | 'dark'
                  | 'light'
                  | 'light-outline'
                  | 'outline'
                  | undefined
              }
            >
              {userListMap[row.userPermission as keyof typeof userListMap].label}
            </Tag>
          ),
        },
        // { colKey: 'userPermission', title: '用户权限', ellipsis: true },
        { colKey: 'createTime', title: '操作时间' },
        {
          colKey: 'operation',
          title: '操作',
          cell: ({ row }) => (
            // <Space>
            //   {/* eslint-disable-next-line no-nested-ternary */}
            //   {row.status === 0 ? (
            //     <>
            //       <Link hover='color' theme='primary'>
            //         修改
            //       </Link>
            //       <Link hover='color' theme='primary'>
            //         禁用
            //       </Link>
            //     </>
            //   ) : row.status === 1 ? (
            //     <Link hover='color' theme='primary'>
            //       审核
            //     </Link>
            //   ) : (
            //     <Link hover='color' theme='primary'>
            //       进入
            //     </Link>
            //   )}
            // </Space>

            // eslint-disable-next-line prettier/prettier
            <Space align='center'>
              {(() => {
                if (row.status === 0) {
                  return (
                    <>
                      <Link hover='color' theme='primary' onClick={() => navigate('/user/add?flag=2')}>
                        修改
                      </Link>
                      <Link hover='color' theme='danger'>
                        禁用
                      </Link>
                    </>
                  );
                  // eslint-disable-next-line no-else-return
                } else if (row.status === 1) {
                  return (
                    <>
                      <Link hover='color' theme='primary'>
                        修改
                      </Link>
                      <Link hover='color' theme='success'>
                        启用
                      </Link>
                    </>
                  );
                } else if (row.status === 2) {
                  return (
                    <Link hover='color' theme='primary' onClick={() => navigate('/user/add?flag=3')}>
                      审核
                    </Link>
                  );
                } else {
                  return '没有操作选项';
                }
              })()}
            </Space>
          ),
          width: 140,
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

  // dialog
  const [visible, setVisible] = useState(false);
  const handleClick = () => {
    setVisible(true);
  };
  const onConfirm: DialogProps['onConfirm'] = (context) => {
    console.log('点击了确认按钮', context);
    setVisible(false);
  };
  const onCancel: DialogProps['onCancel'] = (context) => {
    console.log('点击了取消按钮', context);
  };
  const onClickCloseBtn: DialogProps['onCloseBtnClick'] = (context) => {
    console.log('点击了关闭按钮', context);
  };
  const onKeydownEsc: DialogProps['onEscKeydown'] = (context) => {
    console.log('按下了ESC', context);
  };
  const onClickOverlay: DialogProps['onOverlayClick'] = (context) => {
    console.log('点击了蒙层', context);
  };
  const handleClose: DialogProps['onClose'] = (context) => {
    console.log('关闭弹窗，点击关闭按钮、按下ESC、点击蒙层等触发', context);
    setVisible(false);
  };

  return (
    <>
      {/* 按钮 */}
      <Row>
        <Col span={1}>
          {/* <Button onClick={() => navigate('/recommend/recommendationRule')}>{t('创建用户')}</Button> */}
          <Button onClick={() => navigate('/user/add?flag=1')}>{t('创建用户')}</Button>
        </Col>
        <Col span={1}>
          <Button onClick={handleClick}>{t('生成注册码')}</Button>
        </Col>
      </Row>
      <Divider></Divider>
      {/* 选择器 */}
      <Row justify='start' style={{ marginBottom: '20px' }}>
        <Col span={3} style={{ display: 'flex', alignItems: 'center' }}>
          <span>角色权限</span>
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
        <Col span={3} style={{ display: 'flex', alignItems: 'center' }}>
          <span>用户状态</span>
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
        <Col span={3} style={{ display: 'flex', alignItems: 'center' }}>
          <span>用户名</span>
          <Input
            style={{ marginLeft: '20px', width: '200px' }}
            placeholder='请输入用户名（无默认值）'
            onChange={(value) => {
              console.log(value);
            }}
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

      <Dialog
        header='注册码'
        visible={visible}
        confirmOnEnter
        onClose={handleClose}
        onConfirm={onConfirm}
        onCancel={onCancel}
        onEscKeydown={onKeydownEsc}
        onCloseBtnClick={onClickCloseBtn}
        onOverlayClick={onClickOverlay}
        cancelBtn={null}
        placement='center'
        confirmBtn='确认'
      >
        <div style={{ textAlign: 'center' }}>
          <p>rh2121asd</p>
          <p>请仔细检查该用户的的信息,进行审核</p>
        </div>
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
