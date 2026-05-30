'use client';

import React from 'react';

export type SharePlatform = 'facebook' | 'x' | 'linkedin' | 'wechat' | 'email';

export interface ShareButtonsProps {
  title: string;
  url: string;
  description: string;
  platforms: SharePlatform[];
}

/**
 * Generate a share URL for a given platform.
 * Exported separately for independent testing.
 */
export function generateShareUrl(
  platform: SharePlatform,
  title: string,
  url: string,
  description: string
): string {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  const encodedDescription = encodeURIComponent(description);

  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
    case 'x':
      return `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;
    case 'wechat':
      // WeChat doesn't have a direct web share URL; use a QR code service pointing to the URL
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
    case 'email':
      return `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
    default:
      return url;
  }
}

const platformIcons: Record<SharePlatform, { label: string; icon: React.ReactNode }> = {
  facebook: {
    label: 'Share on Facebook',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
  },
  x: {
    label: 'Share on X',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  linkedin: {
    label: 'Share on LinkedIn',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  wechat: {
    label: 'Share on WeChat',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.133 0 .24-.11.24-.245 0-.06-.024-.12-.04-.178l-.325-1.233a.493.493 0 01.177-.554C23.064 18.645 24 16.929 24 15.03c0-3.38-3.108-6.12-7.062-6.172zm-2.004 2.209c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z" />
      </svg>
    ),
  },
  email: {
    label: 'Share via Email',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
        <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
      </svg>
    ),
  },
};

export default function ShareButtons({ title, url, description, platforms }: ShareButtonsProps) {
  const handleShare = (platform: SharePlatform) => {
    const shareUrl = generateShareUrl(platform, title, url, description);

    if (platform === 'email') {
      // mailto links open in the same window
      window.location.href = shareUrl;
    } else if (platform === 'wechat') {
      // Open QR code in a new window for WeChat scanning
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=300,height=300');
    } else {
      // Open share dialog in a popup window
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  };

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Share buttons">
      {platforms.map((platform) => {
        const { label, icon } = platformIcons[platform];
        return (
          <button
            key={platform}
            onClick={() => handleShare(platform)}
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-full
              text-gray-600 dark:text-gray-400
              hover:text-white hover:bg-gray-700 dark:hover:bg-gray-600
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label={label}
            title={label}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
