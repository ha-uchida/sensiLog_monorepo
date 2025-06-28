'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiUtils } from '@/lib/api-client/mutator/custom-instance';
import { useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  gameName?: string;
  tagLine?: string;
  riotPuuid?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // 認証状態の確認
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<AuthUser> => {
      const token = apiUtils.getAuthToken();
      if (!token) {
        throw new Error('No auth token');
      }

      // TODO: API clientが生成されたら復元
      // return await getAuthMe();
      throw new Error('API client not generated yet');
    },
    enabled: !!apiUtils.getAuthToken(),
    retry: false,
    staleTime: 30 * 60 * 1000, // 30分
  });

  // ログイン処理
  const loginMutation = useMutation({
    mutationFn: async () => {
      // TODO: API clientが生成されたら復元
      // return await postAuthRiotCallback(credentials);
      throw new Error('API client not generated yet');
    },
    onSuccess: (data: { user: AuthUser }) => {
      // ユーザー情報をキャッシュに設定
      queryClient.setQueryData(['auth', 'me'], data?.user);
      // 他のクエリを無効化
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['match-data'] });
    },
  });

  // ログアウト処理
  const logoutMutation = useMutation({
    mutationFn: async () => {
      apiUtils.removeAuthToken();
    },
    onSuccess: () => {
      // 全てのクエリキャッシュをクリア
      queryClient.clear();
    },
  });

  // トークンリフレッシュ
  const refreshMutation = useMutation({
    mutationFn: async () => {
      // TODO: リフレッシュトークン実装
      return false;
    },
    onSuccess: (success) => {
      if (success) {
        refetch();
      } else {
        logoutMutation.mutate();
      }
    },
  });

  // 初期化処理
  useEffect(() => {
    const token = apiUtils.getAuthToken();
    if (token && !user && !isLoading) {
      refetch();
    }
    setIsInitialized(true);
  }, [user, isLoading, refetch]);

  // Riot OAuth認証URL取得
  const getRiotAuthUrl = async (): Promise<{
    authUrl: string;
    state: string;
  }> => {
    // TODO: API clientが生成されたら復元
    // return await getAuthRiotLogin();
    throw new Error('API client not generated yet');
  };

  return {
    // 状態
    user,
    isAuthenticated: !!user,
    isLoading: !isInitialized || isLoading,
    error,

    // アクション
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    refresh: refreshMutation.mutate,
    getRiotAuthUrl,

    // ローディング状態
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRefreshing: refreshMutation.isPending,

    // エラー
    loginError: loginMutation.error as Error | null,
    logoutError: logoutMutation.error as Error | null,
    refreshError: refreshMutation.error as Error | null,

    // リセット
    resetLoginError: loginMutation.reset,
  };
}
