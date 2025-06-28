'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const MOCK_USERS = [
  {
    id: 0,
    name: 'SamplePlayer #0001',
    description: '一般ユーザー（サンプルデータ有り）',
    code: 'mock-code-0',
  },
  {
    id: 1,
    name: 'TestUser #0002',
    description: '一般ユーザー（最小データ）',
    code: 'mock-code-1',
  },
  {
    id: 2,
    name: 'AdminUser #0999',
    description: '管理者ユーザー',
    code: 'mock-code-2',
  },
];

function MockAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggingIn, loginError } = useAuth();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const state = searchParams.get('state');

  useEffect(() => {
    // 開発環境でない場合は404ページにリダイレクト
    if (process.env.NODE_ENV === 'production') {
      router.push('/404');
    }
  }, [router]);

  const handleLogin = (userIndex: number) => {
    const user = MOCK_USERS[userIndex];
    if (!user || !state) return;

    setSelectedUser(userIndex);

    login(
      { code: user.code, state },
      {
        onSuccess: () => {
          router.push('/dashboard');
        },
        onError: (error) => {
          console.error('Mock login failed:', error);
          setSelectedUser(null);
        },
      },
    );
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // 本番環境では何も表示しない
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
            開発用モック認証
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            テスト用のユーザーアカウントを選択してください
          </p>
          <div className='mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
            <p className='text-sm text-yellow-800'>
              ⚠️ これは開発環境専用の機能です
            </p>
          </div>
        </div>

        <div className='space-y-4'>
          {MOCK_USERS.map((user) => (
            <div
              key={user.id}
              className='border border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors'
            >
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <h3 className='text-lg font-medium text-gray-900'>
                    {user.name}
                  </h3>
                  <p className='text-sm text-gray-500 mt-1'>
                    {user.description}
                  </p>
                </div>
                <Button
                  onClick={() => handleLogin(user.id)}
                  disabled={isLoggingIn}
                  variant={selectedUser === user.id ? 'secondary' : 'default'}
                  size='sm'
                >
                  {selectedUser === user.id && isLoggingIn ? (
                    <>
                      <span className='animate-spin mr-2'>⏳</span>
                      ログイン中...
                    </>
                  ) : (
                    'ログイン'
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {loginError && (
          <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
            <p className='text-sm text-red-800'>
              ログインに失敗しました: {loginError.message}
            </p>
          </div>
        )}

        <div className='text-center'>
          <Button onClick={handleCancel} variant='ghost' disabled={isLoggingIn}>
            キャンセル
          </Button>
        </div>

        <div className='mt-8 p-4 bg-gray-50 border border-gray-200 rounded-md'>
          <h4 className='text-sm font-medium text-gray-900 mb-2'>開発情報</h4>
          <dl className='text-xs text-gray-600 space-y-1'>
            <div>
              <dt className='inline font-medium'>State:</dt>
              <dd className='inline ml-1 font-mono'>{state || 'なし'}</dd>
            </div>
            <div>
              <dt className='inline font-medium'>環境:</dt>
              <dd className='inline ml-1'>{process.env.NODE_ENV}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

export default function MockAuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MockAuthContent />
    </Suspense>
  );
}
