import { buildRetryFetchBaseQuery } from './retryFetchBaseQuery';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// 定义查询 node 的参数和返回类型
export interface FetchNodeListArgs {
  clusterId?: string;
}

export interface FetchNodeListResult {
  error?: any;
  data: {
    totalCount: number;
    items: Array<string>;
  };
}

// 创建 nodeApi
export const nodeApi = createApi({
  reducerPath: 'nodeApi', // 修改 reducerPath
  tagTypes: ['nodeList'], // 修改 tagTypes
  baseQuery: buildRetryFetchBaseQuery(
    fetchBaseQuery({
      baseUrl: '/api/v1/nodes', // 修改 baseUrl
      timeout: 15000,
      prepareHeaders: (headers, _api) => {
        headers.set('Content-Type', 'application/json');
        headers.set('Accept', 'application/json');
        return headers;
      },
    }),
  ),
  endpoints: (builder) => ({
    fetchNodeList: builder.query<FetchNodeListResult, FetchNodeListArgs>({
      query: (args) => ({
        url: `/${args.clusterId}`, // 修改 query 路径
      }),
    }),
  }),
});

// 导出查询 node 的 Hooks
export const { useLazyFetchNodeListQuery, useFetchNodeListQuery } = nodeApi;