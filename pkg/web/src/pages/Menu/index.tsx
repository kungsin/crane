import CommonStyle from '../../styles/common.module.less';
import './index.module.less';
import classnames from 'classnames';
import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormProps, useNavigate } from 'react-router-dom';
import { CheckCircleFilledIcon, CloseCircleFilledIcon } from 'tdesign-icons-react';
import {
  Button,
  Col,
  Dialog,
  DialogProps,
  Divider,
  Form,
  Input,
  Link,
  MessagePlugin,
  Radio,
  Row,
  Select,
  Space,
  Table,
  TableProps,
  Tag,
  Tooltip,
} from 'tdesign-react';
import FormItem from 'tdesign-react/es/form/FormItem';

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
    name: ['首页', '成本洞察', '应用总览'][i % 3],
    menuNumber: ['home', 'cost', 'workloaf-overview'][i % 3],
    parentNumber: [0, 0, 'cost'][i % 3],
    requestAddress: ['/home', '#', '/cost/workload-overview'][i % 3],
    sort: [1, 2, 1][i % 3],
    level: [1, 1, 2][i % 3],
    status: ['0', '1'][i % 2],
  });
}

const statusNameListMap = {
  0: { label: '启用', theme: 'success', icon: <CheckCircleFilledIcon /> },
  1: { label: '已禁用', theme: 'danger', icon: <CloseCircleFilledIcon /> },
};

export const SelectTable = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  // 选择器
  const [value, setValue] = useState('');
  const onChange = (value: string) => {
    setValue(value);
  };

  // dialog
  const [visible, setVisible] = useState(false);
  const handleClick = () => {
    setVisible(true);
  };
  const onConfirm: DialogProps['onConfirm'] = (context) => {
    console.log('点击了确认按钮', context);
    setVisible(false);
    setTimeout(() => {
      navigate(-1);
    }, 1000);
  };
  const onCancel: DialogProps['onCancel'] = (context) => {
    console.log('点击了取消按钮', context);
    setTimeout(() => {
      navigate(-1);
    }, 1000);
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

  // dialog-form
  const [form] = Form.useForm();

  const name = Form.useWatch('name', form);
  const gender = Form.useWatch('gender', form);
  console.log('name', name);
  console.log('gender', gender);

  const onSubmit: FormProps['onSubmit'] = (e) => {
    console.log(e);
    if (e.validateResult === true) {
      MessagePlugin.success('提交成功');
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    }
  };

  const onReset: FormProps['onReset'] = (e) => {
    console.log(e);
    MessagePlugin.info('重置成功');
  };

  const setMessage = () => {
    console.log(form);
    // form.setFields([
    //   { name: 'name', status: 'error', validateMessage: { type: 'error', message: '输入有误' } },
    //   { name: 'birthday', status: 'warning', validateMessage: { type: 'warning', message: '时间有误' } },
    // ]);
  };
  const PARENT_OPTIONS = [
    { label: '0', value: 1 },
    { label: 'home', value: 2 },
    { label: 'cost', value: 2 },
  ];
  const CLUSTER_OPTIONS = [
    { label: 'abcsaca', value: 1 },
    { label: 'abcsds2w', value: 2 },
  ];
  const STATUS_OPTIONS = [
    { label: '启用', value: 1 },
    { label: '禁用', value: 2 },
  ];

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
        { colKey: 'id', title: 'id', width: '50' },
        { colKey: 'name', title: '菜单名称', width: '100' },
        { colKey: 'menuNumber', title: '菜单编号', width: '180' },
        { colKey: 'parentNumber', title: '菜单父编号', width: '110' },
        { colKey: 'requestAddress', title: '请求地址', width: '200' },
        { colKey: 'sort', title: '排序', width: '80' },
        { colKey: 'level', title: '层级', width: '80' },
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
        { colKey: 'createTime', title: '操作时间', width: '140' },
        {
          colKey: 'operation',
          title: '操作',
          cell: ({ row }) => (
            <Space align='center'>
              <Link hover='color' theme='primary' onClick={handleClick}>
                修改
              </Link>
            </Space>
          ),
          width: 100,
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
          <Button onClick={handleClick}>{t('添加菜单')}</Button>
        </Col>
        {/* <Col span={1}>
          <Button>{t('生成注册码')}</Button>
        </Col> */}
      </Row>
      <Divider></Divider>
      {/* 选择器 */}
      <Row justify='start' style={{ marginBottom: '20px' }}>
        <Col span={3} style={{ display: 'flex', alignItems: 'center' }}>
          <span>菜单名称</span>
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
          <span>菜单层级</span>
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

      <Dialog
        header='修改/添加 菜单'
        visible={visible}
        confirmOnEnter
        onClose={handleClose}
        onConfirm={onConfirm}
        onCancel={onCancel}
        onEscKeydown={onKeydownEsc}
        onCloseBtnClick={onClickCloseBtn}
        onOverlayClick={onClickOverlay}
        cancelBtn={null}
        confirmBtn='修改/添加'
      >
        <Form form={form} onSubmit={onSubmit} onReset={onReset} colon labelWidth={100}>
          <FormItem label='菜单名称' name='menuName'>
            <Input style={{ width: '300px' }} placeholder='请输入菜单名称' />
          </FormItem>
          <FormItem label='菜单编号' name='menuNumber'>
            <Input style={{ width: '300px' }} placeholder='请输入用户名' />
          </FormItem>

          <FormItem label='菜单父编号' name='parentNumber'>
            <Select style={{ width: '300px' }} options={PARENT_OPTIONS} clearable></Select>
          </FormItem>

          <FormItem label='请求地址' name='requestAddress'>
            <Input style={{ width: '300px' }} placeholder='请输入菜单请求地址' />
          </FormItem>

          <FormItem label='排序' name='requestAddress'>
            <Input style={{ width: '300px' }} placeholder='请输入排序' />
          </FormItem>

         

       
          <FormItem label='状态' name='status'>
            <Select style={{ width: '300px' }} options={STATUS_OPTIONS} clearable></Select>
          </FormItem>

         
        </Form>
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
