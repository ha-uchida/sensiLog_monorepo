'use client';

import { useEffect } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function AdSense({ 
  adSlot, 
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block' },
  className = ''
}: AdSenseProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  // AdSenseクライアントIDが設定されていない場合は何も表示しない
  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) {
    return null;
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive}
    />
  );
}

// 事前定義された広告コンポーネント
export function SidebarAd() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <AdSense 
        adSlot="1234567890"
        style={{ width: '300px', height: '250px' }}
        className="block"
      />
    </div>
  );
}

export function HeaderAd() {
  return (
    <div className="w-full bg-white border-b">
      <div className="container mx-auto px-4 py-2">
        <AdSense 
          adSlot="0987654321"
          adFormat="horizontal"
          style={{ height: '90px' }}
          className="w-full"
        />
      </div>
    </div>
  );
}

export function FooterAd() {
  return (
    <div className="w-full bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-4">
        <AdSense 
          adSlot="1122334455"
          adFormat="horizontal"
          style={{ height: '90px' }}
          className="w-full"
        />
      </div>
    </div>
  );
}

export function InlineAd() {
  return (
    <div className="my-8 flex justify-center">
      <AdSense 
        adSlot="5566778899"
        style={{ width: '728px', height: '90px' }}
        className="block"
      />
    </div>
  );
}