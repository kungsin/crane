import { Button, Form, FormProps, Input, MessagePlugin, Select } from 'tdesign-react';
import CommonStyle from '../../../styles/common.module.less';
import '../index.module.less';
import classnames from 'classnames';
import React, { memo, useEffect, useState } from 'react';
import FormItem from 'tdesign-react/es/form/FormItem';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGetUserInfoQuery, useUpdateUserInfoMutation } from '../../../services/mineApi';
import { useFetchClusterListQuery } from '../../../services/clusterApi';

export const SelectTable = () => {
  const [searchParams] = useSearchParams();
  const adminName = JSON.parse(localStorage.getItem('userInfo'))?.Username;
  const navigate = useNavigate();

  const [updateUser, { data, error, isLoading }] = useUpdateUserInfoMutation();
  // flag 1是新建  2是修改  3是审核
  // eslint-disable-next-line unused-imports/no-unused-vars
  const flag = searchParams.get('flag');
  const id = searchParams.get('id');

  const { data: UserInfo } = useGetUserInfoQuery({ id });
  const userInfo = UserInfo?.data;
  const clusterList = useFetchClusterListQuery({});
  const items = clusterList?.data?.data.items;
  const list = items?.map((item) => ({
    label: `${item.name}(${item.id})`,
    value: item.id,
  }));
  console.log('list', list);

  const [form] = Form.useForm();
  const username = Form.useWatch('username', form);

  useEffect(() => {
    if (userInfo) {
      // 将 userInfo 的数据填充到表单中
      form.setFieldsValue({
        username: userInfo.Username,
        phone: userInfo.Phone,
        password: userInfo.password,
        isAdmin: userInfo.IsAdmin ? 1 : 2,
        clusters: userInfo.Clusters,
        status: userInfo.Status,
      });
    }
  }, [userInfo, form]);
  console.log('username', username);

  const onSubmit: FormProps['onSubmit'] = async (e) => {
    console.log(e);
    console.log(e.fields);
    console.log(id);
    console.log(adminName);

    const params = {
      id,
      adminName,
    };
    const body = {
      ...e.fields,
      // eslint-disable-next-line no-unneeded-ternary
      isAdmin: e.fields.isAdmin === 1 ? true : false,
      clusters: Array.isArray(e.fields.clusters) ? e.fields.clusters : [e.fields.clusters],
    };
    console.log('params', params);
    console.log('body', body);

    try {
      const { data } = await updateUser({ ...params, body });
      console.log('data', data);
      if (data.code === 200) {
        MessagePlugin.success('修改成功');
        setTimeout(() => {
          navigate(-1);
        }, 1000);
      } else {
        MessagePlugin.error('修改失败,请联系开发人员');
      }
    } catch (error) {
      MessagePlugin.error('接口调用失败');
    }
  };

  const onReset: FormProps['onReset'] = (e) => {
    console.log(e);
    MessagePlugin.info('重置成功');
  };

  const setMessage = () => {
    console.log('form', form);
  };

  const COLLEGE_OPTIONS = [
    { label: '管理员', value: 1 },
    { label: '普通用户', value: 2 },
  ];
  // const CLUSTER_OPTIONS = [
  //   { label: 'abcsaca', value: 1 },
  //   { label: 'abcsds2w', value: 2 },
  // ];
  const CLUSTER_OPTIONS = list;
  const STATUS_OPTIONS = [
    { label: '启用', value: 1 },
    { label: '禁用', value: 2 },
  ];

  return (
    <>
      <Form form={form} onSubmit={onSubmit} onReset={onReset} colon labelWidth={100}>
        <FormItem label='用户名' name='username'>
          <Input style={{ width: '300px' }} placeholder='请输入用户名' />
        </FormItem>
        <FormItem label='手机号' name='phone'>
          <Input style={{ width: '300px' }} placeholder='请输入用户手机号' />
        </FormItem>

        {/* <FormItem label='密码' name='password'>
          <Input style={{ width: '300px' }} placeholder='请输入用户密码' />
        </FormItem> */}

        <FormItem label='用户权限' name='isAdmin'>
          <Select style={{ width: '300px' }} options={COLLEGE_OPTIONS} clearable></Select>
        </FormItem>

        <FormItem label='集群配置' name='clusters'>
          <Select style={{ width: '300px' }} options={CLUSTER_OPTIONS} clearable></Select>
        </FormItem>
        <FormItem label='用户状态' name='status'>
          <Select style={{ width: '300px' }} options={STATUS_OPTIONS} clearable></Select>
        </FormItem>

        <FormItem style={{ marginLeft: 100 }}>
          <Button theme='primary' type='submit'>
            修改
          </Button>
          {/* <Button onClick={setMessage}>设置信息</Button> */}
        </FormItem>
      </Form>
    </>
  );
};

const selectPage: React.FC = () => (
  <div className={classnames(CommonStyle.pageWithPadding, CommonStyle.pageWithColor)}>
    <SelectTable />
  </div>
);

export default memo(selectPage);
