/* eslint-disable arrow-body-style */
import { buildRetryFetchBaseQuery } from './retryFetchBaseQuery';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IBoardProps } from '../components/BoardChart';
import queryString from 'query-string';

interface UserInfoArgs extends IBoardProps {
  craneUrl: string;
  id: any;
  status: any;
  adminName: any;
}

interface UserInfoResult {
  error: string;
  data: any; // 根据实际返回的数据结构定义
}

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
const token = JSON.parse(localStorage.getItem('userInfo'))?.Token;
console.log('token', token);

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
    getUserInfo: builder.query<UserInfoResult, UserInfoArgs>({
      providesTags: ['user'],
      query: (args) => {
        // const url = `${args.craneUrl}${URI}/list`;
        const url = `${URI}/list`;
        return {
          url,
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            Token: token || '',
          },
        };
      },
      transformResponse: (res: UserInfoResult, _meta, _arg: UserInfoArgs) => {
        // 根据实际需求处理返回的数据
        return res;
      },
    }),
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
    updateUserStatus: builder.query<UserInfoResult, UserInfoArgs>({
      providesTags: ['user'],
      query: (args) => {
        // const url = `${args.craneUrl}${URI}/list`;
        const url = `${URI}/update`;
        return {
          url,
          method: 'put',
          headers: {
            'Content-Type': 'application/json',
            Token: token || '',
          },
        };
      },
      transformResponse: (res: UserInfoResult, _meta, _arg: UserInfoArgs) => {
        // 根据实际需求处理返回的数据
        return res;
      },
    }),
  }),
});

export const { useGetUserInfoQuery, useLazyGetUserInfoQuery, useLoginUserMutation, useUpdateUserStatusQuery } = userApi;
