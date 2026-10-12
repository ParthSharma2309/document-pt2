import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  status: 'uploaded' | 'processing' | 'ready' | 'failed' | 'sufficient' | 'insufficient';
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className }) => {
  const styles = {
    uploaded: 'bg-slate-100 text-slate-700 border-slate-200',
    processing: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
    ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
    sufficient: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    insufficient: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  const labels = {
    uploaded: 'Uploaded',
    processing: 'Processing...',
    ready: 'Ready',
    failed: 'Failed',
    sufficient: 'Grounded Evidence',
    insufficient: 'Insufficient Evidence',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        styles[status] || styles.uploaded,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {labels[status] || status}
    </span>
  );
};
