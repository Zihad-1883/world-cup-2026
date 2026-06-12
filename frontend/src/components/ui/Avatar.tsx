'use client';

interface AvatarProps {
  url: string | null;
  username: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Avatar({ url, username, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-4xl',
  };

  if (url) {
    return (
      <img
        src={url}
        alt={username}
        className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-green-500 flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
    >
      {username?.[0]?.toUpperCase() || '?'}
    </div>
  );
}
