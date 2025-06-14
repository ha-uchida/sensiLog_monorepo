import dotenv from 'dotenv';
dotenv.config();

module.exports = {
  'sensilog-api': {
    input: {
      target: `${process.env.NEXT_PUBLIC_API_URL}/docs/json`,
    },
    output: {
      mode: 'tags-split',
      target: './packages/api-client/src/api',
      schemas: './packages/api-client/src/schemas',
      client: 'react-query',
      mock: false,
      prettier: true,
      override: {
        operations: {
          // 設定記録一覧の無限スクロール対応
          getSettingsRecords: {
            query: {
              useQuery: true,
              useInfinite: true,
              useInfiniteQueryParam: 'offset',
              options: {
                staleTime: 5 * 60 * 1000, // 5分
              },
            },
          },
          // 試合データ一覧の無限スクロール対応
          getMatchData: {
            query: {
              useQuery: true,
              useInfinite: true,
              useInfiniteQueryParam: 'offset',
              options: {
                staleTime: 10 * 60 * 1000, // 10分
              },
            },
          },
          // ユーザー情報のキャッシュ設定
          getAuthMe: {
            query: {
              options: {
                staleTime: 30 * 60 * 1000, // 30分
                cacheTime: 60 * 60 * 1000, // 1時間
              },
            },
          },
          // 分析データのキャッシュ設定
          getAnalyticsPerformance: {
            query: {
              options: {
                staleTime: 15 * 60 * 1000, // 15分
              },
            },
          },
        },
        query: {
          useQuery: true,
          useInfinite: true,
          options: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 2 * 60 * 1000, // 2分
          },
        },
        mutator: {
          path: './packages/api-client/src/mutator.ts',
        },
      },
    },
  },
};
