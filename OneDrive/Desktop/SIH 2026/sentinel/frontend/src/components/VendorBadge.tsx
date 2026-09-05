import React from 'react';
import { Vendor } from '../types';
import { Network, ShieldCheck, Server } from 'lucide-react';

interface VendorBadgeProps {
  vendor: Vendor;
}

export const VendorBadge: React.FC<VendorBadgeProps> = ({ vendor }) => {
  const getVendorDetails = () => {
    switch (vendor) {
      case 'cisco':
        return {
          label: 'Cisco IOS',
          color: 'bg-cyan-950/50 border-cyan-800/60 text-cyan-300',
          icon: <Network className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
        };
      case 'fortinet':
        return {
          label: 'Fortinet FortiOS',
          color: 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300',
          icon: <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
        };
      case 'linux':
        return {
          label: 'Linux OS',
          color: 'bg-purple-950/50 border-purple-800/60 text-purple-300',
          icon: <Server className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
        };
      default:
        return {
          label: vendor,
          color: 'bg-slate-800 border-slate-700 text-slate-300',
          icon: <Server className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
        };
    }
  };

  const { label, color, icon } = getVendorDetails();

  return (
    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-md border font-medium ${color}`}>
      {icon}
      {label}
    </span>
  );
};
