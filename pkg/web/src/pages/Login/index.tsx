import React, { useEffect, useState } from 'react';
import { Form, Input, Button, MessagePlugin, Image, Space } from 'tdesign-react';
import type { CustomValidator, Data, FormProps, FormRules, ImageProps, InternalFormInstance } from 'tdesign-react';

import { DesktopIcon, LockOnIcon, CallIcon } from 'tdesign-icons-react';

import { useNavigate } from 'react-router-dom';
import { useLoginUserMutation, useRegisterUserMutation } from '../../services/mineApi';

import { setUserInfo } from '../../utils/user';
import { useDispatch } from 'react-redux';

import Logo from '../../assets/logo.jpg';

const { FormItem } = Form;

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginUser, { data, error, isLoading }] = useLoginUserMutation();
  const [registerUser] = useRegisterUserMutation();

  const [loading, setLoading] = useState(false);

  const [register, setRegister] = useState(false);

  const handleSubmit: FormProps['onSubmit'] = async (e) => {
    console.log(e);
    console.log(e.fields);
    if (register) {
      if (e.validateResult === true) {
        console.log('进入注册');
        const body = {
          username: e.fields.account,
          password: e.fields.password,
          confirmPassword: e.fields.rePassword,
          phoneNumber: e.fields.phone,
        };
        console.log('body', body);
        try {
          setLoading(true);
          const { data } = await registerUser({ ...body });
          console.log('data', data);
          if (data.code === 200) {
            MessagePlugin.success('注册成功，为您跳转登录页面');
            setTimeout(() => {
              setRegister(!register);
            }, 1000);
          } else {
            MessagePlugin.error('注册失败,请联系开发人员');
          }
        } catch (error) {
          MessagePlugin.error('接口调用失败');
        } finally {
          setLoading(false);
        }
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (e.validateResult === true) {
        const body = {
          username: e.fields.account,
          password: e.fields.password,
        };
        try {
          setLoading(true);
          const { data } = await loginUser({ username: body.username, password: body.password });

          if (data.code === 200) {
            console.log(data.data);
            console.log(data.data.Clusters);
            const Clusters = data.data.Clusters || [];
            const IsAdmin = data.data.IsAdmin || false;
            if (Clusters.length > 0 || IsAdmin) {
              MessagePlugin.success('登录成功');

              setUserInfo(JSON.stringify(data.data));
              setTimeout(() => {
                navigate('/dashboard');
              }, 1000);
            } else {
              MessagePlugin.error('需要添加一个集群以启用Dashboard,请联系管理员添加集群');
            }
          } else {
            MessagePlugin.error('登录失败,请检查账号和密码!');
          }
        } catch (error) {
          MessagePlugin.error('接口调用失败');
        } finally {
          setLoading(false);
        }
      }
    }
  };
  const handleReset: FormProps['onReset'] = (e) => {
    console.log(e);
    console.log('==================');
    console.log(e);
    MessagePlugin.info('重置成功');
  };
  // 图片
  const [src, setSrc] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      // setSrc('https://tdesign.gtimg.com/demo/demo-image-1.png');
      setSrc(Logo);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // 表单
  // eslint-disable-next-line arrow-body-style
  const LoginForm = ({ onSubmit, onReset, loading, changeForm }) => {
    return (
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
          <Input clearable={true} prefixIcon={<DesktopIcon />} placeholder='请输入用户名' />
        </FormItem>
        <FormItem label='密码' name='password' rules={[{ required: true, message: '密码必填', type: 'error' }]}>
          <Input type='password' prefixIcon={<LockOnIcon />} clearable={true} placeholder='请输入密码' />
        </FormItem>
        <FormItem>
          <Button theme='primary' type='submit' block loading={loading}>
            登录
          </Button>
        </FormItem>
        <FormItem style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {/* 注册账号切换表单 */}
          <Button theme='primary' variant='text' type='button' onClick={() => changeForm()}>
            注册账号
          </Button>
        </FormItem>
      </Form>
    );
  };
  // eslint-disable-next-line arrow-body-style
  const RegisterForm = ({ onSubmit, onReset, loading, changeForm }) => {
    const form = React.useRef<InternalFormInstance>();
    // 自定义异步校验器
    const rePassword: CustomValidator = (val) =>
      new Promise((resolve) => {
        const timer = setTimeout(() => {
          resolve(form?.current.getFieldValue('password') === val);
          clearTimeout(timer);
        });
      });
    // 自定义校验规则：校验密码是否包含数字、大写字母和小写字母
    const validatePasswordComplexity = (val) =>
      new Promise((resolve) => {
        const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/; // 正则表达式
        const timer = setTimeout(() => {
          if (val && !regex.test(val)) {
            resolve(false);
            clearTimeout(timer);
          } else {
            resolve(true);
            clearTimeout(timer);
          }
        });
      });
    // 自定义校验规则：校验手机号格式
    const validatePhone = (val) =>
      new Promise((resolve) => {
        const regex = /^1[3-9]\d{9}$/; // 正则表达式
        const timer = setTimeout(() => {
          if (val && !regex.test(val)) {
            resolve(false);
            clearTimeout(timer);
          } else {
            resolve(true);
            clearTimeout(timer);
          }
        });
      });
    const rules: FormRules<Data> = {
      account: [
        { required: true, message: '姓名必填', type: 'error' },
        { min: 2, message: '至少需要两个字', type: 'error' },
      ],
      phone: [
        { required: true, message: '手机号必填', type: 'error' },
        { validator: validatePhone, type: 'error' }, // 自定义校验规则
      ],
      password: [
        { required: true, message: '密码必填', type: 'error' },
        { validator: validatePasswordComplexity, message: '密码至少六位，且包含数字、大写字母和小写字母' },
      ],
      rePassword: [
        // 自定义校验规则
        { required: true, message: '密码必填', type: 'error' },
        { validator: rePassword, message: '两次密码不一致' },
      ],
    };
    return (
      <Form
        ref={form}
        statusIcon={true}
        onSubmit={onSubmit}
        onReset={onReset}
        colon={true}
        labelWidth={0}
        rules={rules}
      >
        <FormItem label='用户名' name='account'>
          <Input clearable={true} prefixIcon={<DesktopIcon />} placeholder='请输入用户名' />
        </FormItem>
        <FormItem label='手机号' name='phone'>
          <Input clearable={true} prefixIcon={<CallIcon />} placeholder='请输入手机号' />
        </FormItem>
        <FormItem label='密码' name='password' initialData=''>
          <Input type='password' clearable={true} prefixIcon={<LockOnIcon />} placeholder='请输入密码' />
        </FormItem>
        <FormItem label='确认密码' name='rePassword' initialData=''>
          <Input type='password' clearable={true} prefixIcon={<LockOnIcon />} placeholder='请确认密码' />
        </FormItem>
        <FormItem>
          <Button theme='primary' type='submit' block loading={loading}>
            注册
          </Button>
        </FormItem>
        <FormItem style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button theme='primary' variant='text' type='button' onClick={() => changeForm()}>
            返回登录
          </Button>
        </FormItem>
      </Form>
    );
  };

  const toggleForm = () => {
    setRegister(!register);
  };

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
          <div style={{ fontSize: '30px', lineHeight: 1, fontWeight: 'bold' }}>算力资源应用感知平台</div>
          <div style={{ marginTop: '16px', fontSize: '17px' }}>
            <span style={{ width: 500, display: 'inline-block' }}>
              打造算网SLA及工业应用感知核心能力研究面向工业需求的算网SLA评估、业务流感知实现为不同类型的应用提供灵活的算网资源供给服务的能力综合服务平台
            </span>
          </div>
        </div>
      </div>
      <div style={{ width: 350 }}>
        {register ? (
          <RegisterForm onSubmit={handleSubmit} onReset={handleReset} loading={loading} changeForm={toggleForm} />
        ) : (
          <LoginForm onSubmit={handleSubmit} onReset={handleReset} loading={loading} changeForm={toggleForm} />
        )}
      </div>
    </div>
  );
}
