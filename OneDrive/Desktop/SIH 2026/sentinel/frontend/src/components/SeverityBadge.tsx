import React from 'react';
import { Severity } from '../types';
import { AlertOctagon, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const getStyles = () => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-950/60 border-rose-600/40 text-rose-400 glow-rose',
          icon: <AlertOctagon className="w-3.5 h-3.5 mr-1 text-rose-400" />
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-950/60 border-amber-600/40 text-amber-400 glow-amber',
          icon: <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" />
        };
      case 'MEDIUM':
        return {
          bg: 'bg-yellow-950/40 border-yellow-600/40 text-yellow-300',
          icon: <AlertCircle className="w-3.5 h-3.5 mr-1 text-yellow-400" />
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-slate-800/80 border-slate-700 text-slate-300',
          icon: <Info className="w-3.5 h-3.5 mr-1 text-slate-400" />
        };
    }
  };

  const { bg, icon } = getStyles();

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : size === 'lg' 
    ? 'text-sm px-3 py-1 font-semibold' 
    : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border ${bg} ${sizeClasses} tracking-wider font-mono uppercase`}>
      {icon}
      {severity}
    </span>
  );
};
