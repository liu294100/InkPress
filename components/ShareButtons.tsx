'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

interface SharePlatform {
  name: string;
  icon: React.ReactNode;
  getShareUrl: (url: string, title: string, description?: string) => string;
  color: string;
}

export default function ShareButtons({ url, title, description = '', className = '' }: ShareButtonsProps) {
  const t = useTranslations('share');
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedUrl = encodeURIComponent(fullUrl);

  const platforms: SharePlatform[] = [
    {
      name: 'facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      getShareUrl: (url, title) => `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`
    },
    {
      name: 'twitter',
      color: 'bg-black hover:bg-gray-800',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      getShareUrl: (url, title) => `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
    },
    {
      name: 'linkedin',
      color: 'bg-blue-700 hover:bg-blue-800',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      getShareUrl: (url, title) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}`
    },
    {
      name: 'whatsapp',
      color: 'bg-green-500 hover:bg-green-600',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      ),
      getShareUrl: (url, title) => `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
    },
    {
      name: 'reddit',
      color: 'bg-orange-500 hover:bg-orange-600',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
        </svg>
      ),
      getShareUrl: (url, title) => `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`
    },
    {
      name: 'pinterest',
      color: 'bg-red-600 hover:bg-red-700',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
        </svg>
      ),
      getShareUrl: (url, title, description) => `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}${description ? '%20' + encodedDescription : ''}`
    },
    {
      name: 'telegram',
      color: 'bg-blue-500 hover:bg-blue-600',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      getShareUrl: (url, title) => `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
    },
    {
      name: 'line',
      color: 'bg-green-400 hover:bg-green-500',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
        </svg>
      ),
      getShareUrl: (url, title) => `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedTitle}`
    },
    {
      name: 'wechat',
      color: 'bg-green-600 hover:bg-green-700',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 4.882-1.932 7.621-.55-.302-2.676-2.476-4.991-5.693-6.196a8.9 8.9 0 0 0-4.673-.440zm-3.7 5.34a.96.96 0 0 1 .96-.96.96.96 0 0 1 .96.96.96.96 0 0 1-.96.96.96.96 0 0 1-.96-.96zm5.29 0a.96.96 0 0 1 .96-.96.96.96 0 0 1 .96.96.96.96 0 0 1-.96.96.96.96 0 0 1-.96-.96z"/>
          <path d="M15.322 9.53c-1.886 0-3.322.955-3.322 2.136 0 .465.465.93 1.395 1.395l-.465 1.395 1.86-1.395c.465 0 .93.465 1.395.465 1.886 0 3.322-.955 3.322-2.136s-1.436-1.86-3.185-1.86zm-1.86 1.395a.465.465 0 0 1 .465-.465.465.465 0 0 1 .465.465.465.465 0 0 1-.465.465.465.465 0 0 1-.465-.465zm2.79 0a.465.465 0 0 1 .465-.465.465.465 0 0 1 .465.465.465.465 0 0 1-.465.465.465.465 0 0 1-.465-.465z"/>
        </svg>
      ),
      getShareUrl: (url, title) => `javascript:void(0)` // WeChat sharing requires QR code
    },
    {
      name: 'weibo',
      color: 'bg-red-500 hover:bg-red-600',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.31 8.17c-2.36.23-4.27 2.16-4.27 4.69 0 2.84 2.53 5.14 5.66 5.14s5.66-2.3 5.66-5.14c0-2.53-1.91-4.46-4.27-4.69zm.7 7.44c-1.64 0-2.97-1.33-2.97-2.97s1.33-2.97 2.97-2.97 2.97 1.33 2.97 2.97-1.33 2.97-2.97 2.97zm0-4.69c-.94 0-1.72.77-1.72 1.72s.77 1.72 1.72 1.72 1.72-.77 1.72-1.72-.77-1.72-1.72-1.72zm8.44-6.61c-.47-.47-1.25-.47-1.72 0l-1.41 1.41c-.47.47-.47 1.25 0 1.72.47.47 1.25.47 1.72 0l1.41-1.41c.47-.47.47-1.25 0-1.72zm-3.13 3.13c-.47-.47-1.25-.47-1.72 0l-.7.7c-.47.47-.47 1.25 0 1.72.47.47 1.25.47 1.72 0l.7-.7c.47-.47.47-1.25 0-1.72z"/>
        </svg>
      ),
      getShareUrl: (url, title) => `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`
    },
    {
      name: 'qq',
      color: 'bg-blue-500 hover:bg-blue-600',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.5c-3.31 0-6 2.69-6 6 0 1.66.67 3.16 1.76 4.24l-.71.71C6.34 14.16 6 15.08 6 16c0 1.66 1.34 3 3 3h6c1.66 0 3-1.34 3-3 0-.92-.34-1.84-1.05-2.55l-.71-.71C17.33 11.66 18 10.16 18 8.5c0-3.31-2.69-6-6-6zm0 2c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm-3 11c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1z"/>
        </svg>
      ),
      getShareUrl: (url, title) => `https://connect.qq.com/widget/shareqq/index.html?url=${encodedUrl}&title=${encodedTitle}`
    },
    {
      name: 'qzone',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-1.41-1.41L10.17 14H6v-2h4.17l-1.58-1.59L10 9l4 4-4 4zm6-6h-4.17l1.58 1.59L12 14l-4-4 4-4 1.41 1.41L11.83 9H16v2z"/>
        </svg>
      ),
      getShareUrl: (url, title) => `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodedUrl}&title=${encodedTitle}`
    },
    {
      name: 'douban',
      color: 'bg-green-700 hover:bg-green-800',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13H7v-2h10v2zm0-4H7V9h10v2zm0-4H7V5h10v2z"/>
        </svg>
      ),
      getShareUrl: (url, title) => `https://www.douban.com/share/service?href=${encodedUrl}&name=${encodedTitle}`
    },
    {
      name: 'email',
      color: 'bg-gray-600 hover:bg-gray-700',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      ),
      getShareUrl: (url, title) => `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleShare = (platform: SharePlatform) => {
    if (platform.name === 'wechat') {
      // For WeChat, we need to show a QR code
      // Check if we're on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // On mobile, try to open WeChat directly
        const wechatUrl = `weixin://dl/business/?t=${encodeURIComponent(title)}`;
        window.location.href = wechatUrl;
      } else {
        // On desktop, show QR code (you would implement QR code generation here)
        alert('微信分享：请使用微信扫描二维码功能分享此页面');
      }
      return;
    }
    
    const shareUrl = platform.getShareUrl(fullUrl, title, description);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={t('title')}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
        <span>{t('share')}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="fixed top-16 right-4 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50 p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('title')}</h3>
            
            {/* 复制链接 */}
            <div className="mb-4">
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{copied ? t('linkCopied') : t('copyLink')}</span>
              </button>
            </div>

            {/* 社交平台 */}
            <div className="grid grid-cols-4 gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.name}
                  onClick={() => handleShare(platform)}
                  className={`flex items-center justify-center p-3 rounded-lg text-white transition-colors ${platform.color}`}
                  title={t(`platforms.${platform.name}`)}
                  aria-label={t(`platforms.${platform.name}`)}
                >
                  {platform.icon}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}