import {
  Button,
  Dialog,
  DialogProps,
  Form,
  FormProps,
  Input,
  MessagePlugin,
  Select,
  Space,
  Tooltip,
} from 'tdesign-react';
import CommonStyle from '../../../styles/common.module.less';
import '../index.module.less';
import classnames from 'classnames';
import React, { memo, useState } from 'react';
import FormItem from 'tdesign-react/es/form/FormItem';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const SelectTable = () => {
  const [searchParams] = useSearchParams();
  const flag = searchParams.get('flag');
  console.log('flag', flag);

  const navigate = useNavigate();

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
  const COLLEGE_OPTIONS = [
    { label: '管理员', value: 1 },
    { label: '普通用户', value: 2 },
  ];
  const CLUSTER_OPTIONS = [
    { label: 'abcsaca', value: 1 },
    { label: 'abcsds2w', value: 2 },
  ];
  const STATUS_OPTIONS = [
    { label: '启用', value: 1 },
    { label: '禁用', value: 2 },
  ];

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
  return (
    <>
      <Form form={form} onSubmit={onSubmit} onReset={onReset} colon labelWidth={100}>
        <FormItem label='手机号' name='phone'>
          <Input style={{ width: '300px' }} placeholder='请输入用户手机号' />
        </FormItem>
        <FormItem label='用户名' name='username'>
          <Input style={{ width: '300px' }} placeholder='请输入用户名' />
        </FormItem>
        {flag !== '3' && (
          <FormItem label='初始密码' name='password'>
            <Input style={{ width: '300px' }} placeholder='请输入用户初始密码' />
          </FormItem>
        )}
        <FormItem label='用户权限' name='userPermission'>
          <Select style={{ width: '300px' }} options={COLLEGE_OPTIONS} clearable></Select>
        </FormItem>

        {flag !== '3' && (
          <>
            <FormItem label='集群配置' name='userPermission'>
              <Select style={{ width: '300px' }} options={CLUSTER_OPTIONS} clearable></Select>
            </FormItem>
            <FormItem label='用户状态' name='status'>
              <Select style={{ width: '300px' }} options={STATUS_OPTIONS} clearable></Select>
            </FormItem>
          </>
        )}

        {flag !== '2' && (
          <FormItem label='用户注册码' name='registCode' initialData={'sadhsalkdhlsak'}>
            <Tooltip content='默认提供用户注册码'>
              <Input style={{ width: '300px' }} placeholder='请输入用户注册码' disabled />
            </Tooltip>
          </FormItem>
        )}

        <FormItem style={{ marginLeft: 100 }}>
          <Space>
            {/*  eslint-disable-next-line consistent-return */}
            {(() => {
              if (flag === '1') {
                return (
                  <>
                    <Button type='submit' theme='primary'>
                      注册
                    </Button>
                    {/* <Button onClick={setMessage}>设置信息</Button> */}
                    <Button type='reset' theme='default'>
                      重置
                    </Button>
                  </>
                );
              }
              // eslint-disable-next-line no-else-return
              else if (flag === '2') {
                return (
                  <Button theme='primary' onClick={() => navigate(-1)}>
                    修改
                  </Button>
                );
              } else if (flag === '3') {
                return (
                  <Button theme='primary' onClick={handleClick}>
                    操作
                  </Button>
                );
              }
            })()}
          </Space>
        </FormItem>
      </Form>

      <Dialog
        header='审核'
        visible={visible}
        confirmOnEnter
        onClose={handleClose}
        onConfirm={onConfirm}
        onCancel={onCancel}
        onEscKeydown={onKeydownEsc}
        onCloseBtnClick={onClickCloseBtn}
        onOverlayClick={onClickOverlay}
        cancelBtn='拒绝'
        confirmBtn='审核通过'
      >
        <p>请仔细检查该用户的的信息,进行审核</p>
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
