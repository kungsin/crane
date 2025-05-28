import { BaseQueryFn, retry } from '@reduxjs/toolkit/query/react';

/**
 * BuildRetryFetchBaseQuery
 * https://redux-toolkit.js.org/rtk-query/usage/customizing-queries#automatic-retries
 *
 * RTK Query exports a utility called retry that you can wrap the baseQuery in your API definition with. It defaults to 5 attempts with a basic exponential backoff.
 * The default behavior would retry at these intervals:
 *
 * 600ms * random(0.4, 1.4)
 * 1200ms * random(0.4, 1.4)
 * 2400ms * random(0.4, 1.4)
 * 4800ms * random(0.4, 1.4)
 * 9600ms * random(0.4, 1.4)
 * @param fn fetchBaseQuery
 * @returns
 */
export const buildRetryFetchBaseQuery = (fn: any): BaseQueryFn => {
  // 包装原始的 fetchBaseQuery 函数，添加自定义请求头
  const baseQueryWithHeaders = async (args: any, api: any, extraOptions: any) => {
    const originalArgs = typeof args === 'string' ? { url: args } : args;
    const modifiedArgs = {
      ...originalArgs,
      headers: {
        ...originalArgs.headers,
        'ngrok-skip-browser-warning': 'true',
      },
    };
    return fn(modifiedArgs, api, extraOptions);
  };

  const staggeredBaseQuery = retry(baseQueryWithHeaders, {
    maxRetries: 10,
  });
  return staggeredBaseQuery;
};
