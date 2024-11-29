/* eslint-disable arrow-body-style */
import { buildRetryFetchBaseQuery } from './retryFetchBaseQuery';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IBoardProps } from '../components/BoardChart';
import queryString from 'query-string';
import { useEffect, useState } from 'react';

// updateUser
interface updateUserInfoArgs extends IBoardProps {
  id?: any;
  adminName?: any;
  body?: {
    username: string;
    phone: string;
    password: string;
    isAdmin: boolean;
    clusters: number[];
    status: number;
  };
}

// updateUserStatus
interface UserStatusArgs extends IBoardProps {
  id?: any;
  status?: any;
  adminName?: any;
}

// userInfo
interface UserInfoArgs extends IBoardProps {
  pageNum?: any;
  pageSize?: any;
  id?: any;
}

interface UserInfoResult {
  error: string;
  data: any; // 根据实际返回的数据结构定义
}

// userLogin
interface UserLoginArgs extends IBoardProps {
  username: string;
  password: string;
}

interface UserLoginResult {
  error?: string;
  token?: string; // 假设返回一个 token
  data?: any; // 根据实际返回的数据结构定义
}

// const URI = 'http://192.168.3.92:9999/user';
// const URI = '/req/user';
const URI = 'http://10.1.60.127:9999/user';
// const URI = '/req/user';

// 获取token
// const token = JSON.parse(localStorage.getItem('userInfo'))?.Token;
// console.log('token', token);
const getToken = () => {
  return JSON.parse(localStorage.getItem('userInfo'))?.Token || '';
};

export const userApi = createApi({
  reducerPath: 'user',
  tagTypes: ['user'],
  baseQuery: buildRetryFetchBaseQuery(
    fetchBaseQuery({
      baseUrl: ``,
      cache: 'no-cache',
      timeout: 15000,
    }),
  ),
  endpoints: (builder) => ({
    // 获取用户列表
    getUserList: builder.query<UserInfoResult, UserInfoArgs>({
      providesTags: ['user'],
      query: (args) => {
        // const url = `${args.craneUrl}${URI}/list`;
        // const url = `${URI}/list?pageNum=${args.pageNum}&pageSize=${args.pageSize}`;
        const url = `${URI}/list`;
        const params = new URLSearchParams({
          pageNum: args.pageNum,
          pageSize: args.pageSize,
        });
        return {
          url,
          method: 'get',
          params: params.toString(),
          headers: {
            'Content-Type': 'application/json',
            Token: getToken() || '',
          },
        };
      },
      transformResponse: (res: UserInfoResult, _meta, _arg: UserInfoArgs) => {
        // 根据实际需求处理返回的数据
        return res;
      },
    }),
    // 用户登录
    loginUser: builder.mutation<UserLoginResult, UserLoginArgs>({
      invalidatesTags: ['user'],

      query: (args) => {
        const params = new URLSearchParams({
          username: args.username,
          password: args.password,
        });

        return {
          url: `${URI}/login`,
          method: 'post',
          body: params.toString(),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            // 'Content-Type': 'application/json',
          },
        };
      },

      transformResponse: (res: UserLoginResult, _meta, _arg: UserLoginArgs) => {
        // 根据实际需求处理返回的数据
        return res;
      },
    }),
    // 注册用户
    registerUser: builder.mutation<UserInfoResult, UserInfoArgs>({
      invalidatesTags: ['user'],
      query: (args) => {
        const url = `${URI}/register`;
        return {
          url,
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      transformResponse: (res: UserInfoResult, _meta, _arg: UserInfoArgs) => {
        // 根据实际需求处理返回的数据
        return res;
      },
      //
    }),
    // 更改用户状态
    updateUserStatus: builder.mutation<UserInfoResult, UserStatusArgs>({
      invalidatesTags: ['user'],
      query: (args) => {
        const url = `${URI}/updateStatus`;

        const params = new URLSearchParams({
          id: args.id,
          status: args.status,
          adminName: args.adminName,
        });

        return {
          url,
          method: 'put',
          params: params.toString(),
          headers: {
            'Content-Type': 'application/json',
            Token: getToken() || '',
          },
        };
      },
      transformResponse: (res: UserInfoResult, _meta, _arg: UserStatusArgs) => {
        // 根据实际需求处理返回的数据
        return res;
      },
    }),
    // 获取用户信息
    getUserInfo: builder.query<UserInfoResult, UserInfoArgs>({
      providesTags: ['user'],
      query: (args) => {
        // const url = `${args.craneUrl}${URI}/list`;
        // const url = `${URI}/list?pageNum=${args.pageNum}&pageSize=${args.pageSize}`;
        const url = `${URI}/info`;
        const params = new URLSearchParams({
          id: args.id,
        });
        return {
          url,
          method: 'get',
          params: params.toString(),
          headers: {
            'Content-Type': 'application/json',
            Token: getToken() || '',
          },
        };
      },
      transformResponse: (res: UserInfoResult, _meta, _arg: UserInfoArgs) => {
        // 根据实际需求处理返回的数据
        return res;
      },
    }),
    // 修改用户信息
    updateUserInfo: builder.mutation<UserInfoResult, updateUserInfoArgs>({
      invalidatesTags: ['user'],

      query: (args) => {
        const params = new URLSearchParams({
          id: args.id,
          adminName: args.adminName,
        });

        return {
          url: `${URI}/updateInfo`,
          method: 'put',
          params: params.toString(),
          body: args.body,
          headers: {
            // 'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Type': 'application/json',
            Token: getToken() || '',
          },
        };
      },

      transformResponse: (res: UserInfoResult, _meta, _arg: updateUserInfoArgs) => {
        // 根据实际需求处理返回的数据
        return res;
      },
    }),
  }),
});

export const {
  useGetUserListQuery,
  useLoginUserMutation,
  useRegisterUserMutation,
  useUpdateUserStatusMutation,
  useGetUserInfoQuery,
  useUpdateUserInfoMutation,
} = userApi;
