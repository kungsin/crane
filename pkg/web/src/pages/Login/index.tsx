import React, { useEffect, useState } from 'react';
import { Form, Input, Button, MessagePlugin, Image, Space } from 'tdesign-react';
import type { FormProps, ImageProps } from 'tdesign-react';

import { DesktopIcon, LockOnIcon } from 'tdesign-icons-react';

import { useNavigate } from 'react-router-dom';
import { useLoginUserMutation } from '../../services/userApi';

import { setUserInfo } from '../../utils/user';
import { useDispatch } from 'react-redux';

const { FormItem } = Form;

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginUser, { data, error, isLoading }] = useLoginUserMutation();

  const onSubmit: FormProps['onSubmit'] = async (e) => {
    console.log(e);
    console.log(e.fields);
    if (e.validateResult === true) {
      const body = {
        username: e.fields.account,
        password: e.fields.password,
      };
      // console.log(data);
      try {
        // const { data } = await loginUser({ data: body });
        const { data } = await loginUser({ username: body.username, password: body.password });
        console.log(data.code);
        console.log(data.msg);
        console.log(data.data);
        if (data.code === 200) {
          MessagePlugin.success('登录成功');
          setUserInfo(JSON.stringify(data.data));
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } else {
          MessagePlugin.error('登录失败,请检查账号和密码');
        }
      } catch (error) {
        MessagePlugin.error('接口调用失败');
      }
    }
  };

  const onReset: FormProps['onReset'] = (e) => {
    console.log(e);
    MessagePlugin.info('重置成功');
  };

  // 图片
  const [src, setSrc] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSrc('https://tdesign.gtimg.com/demo/demo-image-1.png');
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        margin: 0,
        height: '100vh',
        background: '#FFF',
      }}
    >
      <div style={{ width: 700, textAlign: 'center', margin: 0 }}>
        <div>
          <Space direction='vertical' align='start'>
            <Image
              src={src}
              fit='fill'
              fallback='https://tdesign.gtimg.com/demo/demo-image-1.png'
              style={{ width: 220, height: 220 }}
            />
          </Space>
        </div>
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '30px', lineHeight: 1, fontWeight: 'bold' }}>
            国家工程研究中心算网SLA及工业应用感知服务平台
          </div>
          <div style={{ marginTop: '16px', fontSize: '17px' }}>
            <span style={{ width: 500, display: 'inline-block' }}>
              打造算网SLA及工业应用感知核心能力研究面向工业需求的算网SLA评估、业务流感知实现为不同类型的应用提供灵活的算网资源供给服务的能力综合服务平台
            </span>
          </div>
        </div>
      </div>
      <div style={{ width: 350 }}>
        <Form statusIcon={true} onSubmit={onSubmit} onReset={onReset} colon={true} labelWidth={0}>
          <FormItem
            label='用户名'
            name='account'
            rules={[
              { whitespace: true, message: '姓名不能为空' },
              { required: true, message: '姓名必填', type: 'error' },
              { min: 2, message: '至少需要两个字', type: 'error' },
            ]}
          >
            <Input clearable={true} prefixIcon={<DesktopIcon />} placeholder='请输入账户名' />
          </FormItem>
          <FormItem label='密码' name='password' rules={[{ required: true, message: '密码必填', type: 'error' }]}>
            <Input type='password' prefixIcon={<LockOnIcon />} clearable={true} placeholder='请输入密码' />
          </FormItem>
          <FormItem>
            <Button theme='primary' type='submit' block>
              登录
            </Button>
          </FormItem>
        </Form>
      </div>
    </div>
  );
}
