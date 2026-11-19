import { useState } from 'react';
import { Server } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  fallbackLabel?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  aspectClass = 'aspect-video',
  fallbackLabel,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${aspectClass} ${className} flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 border border-slate-200 text-slate-600 p-6 text-center`}
      >
        <Server className="w-8 h-8 text-slate-500 mb-3" strokeWidth={1.5} aria-hidden="true" />
        <span className="text-sm font-medium text-slate-700">{fallbackLabel || alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
