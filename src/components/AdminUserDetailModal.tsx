import React, { useState } from 'react';
import { X, User, Building2, Shield, Phone, Mail, Calendar, CheckCircle2, Heart, MessageSquare, Star, ArrowRight, Ban, UserCheck, AlertTriangle } from 'lucide-react';
import { UserAccount, PropertyListing } from '../types';
import { useApp } from '../context/AppContext';

interface AdminUserDetailModalProps {
  user: UserAccount;
  properties: PropertyListing[];
  onClose: () => void;
  onSelectProperty?: (property: PropertyListing) => void;
  onViewListerProperties?: (listerId: string) => void;
}

export const AdminUserDetailModal: React.FC<AdminUserDetailModalProps> = ({
  user,
  properties,
  onClose,
  onSelectProperty,
  onViewListerProperties
}) => {
  const { suspendUserAccount, reinstateUserAccount } = useApp();
  const [isSuspended, setIsSuspended] = useState(user.isSuspended || false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleToggleSuspend = () => {
    if (isSuspended) {
      if (reinstateUserAccount) reinstateUserAccount(user.id);
      setIsSuspended(false);
      setStatusMessage('Account has been reinstated');
    } else {
      if (suspendUserAccount) suspendUserAccount(user.id, 'Administrative suspension for platform policy audit');
      setIsSuspended(true);
      setStatusMessage('Account has been suspended');
    }
    setTimeout(() => setStatusMessage(null), 3000);
  };
  const userProperties = properties.filter((p) => p.lister?.id === user.id);
  const activeCount = userProperties.filter((p) => p.status === 'Approved').length;
  const pendingCount = userProperties.filter((p) => p.status === 'Pending').length;
  const totalUnits = userProperties.reduce((acc, p) => acc + (p.occupied || 0) + (p.vacancies || 0), 0);
  const totalVacancies = userProperties.reduce((acc, p) => acc + (p.vacancies || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans">
      <div className="bg-white dark:bg-[#111111] rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-[#292929] animate-in zoom-in-95 duration-150 overflow-hidden text-neutral-900 dark:text-[#F5F5F5]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-[#262626] flex items-center justify-between bg-white dark:bg-[#111111] sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                user.role === 'admin'
                  ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50'
                  : user.role === 'lister'
                  ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50'
                  : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
              }`}
            >
              {user.role === 'admin' ? 'Administrator' : user.role === 'lister' ? 'Property Lister' : 'Property Seeker'}
            </span>
            <span className="text-xs text-neutral-400 dark:text-[#7D7D7D] font-mono">ID: {user.id}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 dark:hover:bg-[#1E1E1E] flex items-center justify-center text-neutral-400 dark:text-[#8A8A8A] hover:text-neutral-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm no-scrollbar">
          {/* User Profile Card */}
          <div className="flex items-center gap-4 bg-neutral-50 dark:bg-[#161616] p-4 rounded-2xl border border-neutral-200 dark:border-[#292929]">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border border-neutral-300 dark:border-[#383838] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-neutral-950 dark:text-[#F5F5F5] truncate">{user.name}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-neutral-400 dark:text-[#7D7D7D] shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
              {user.phone && (
                <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 dark:text-[#7D7D7D] shrink-0" />
                  <span>{user.phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Account Meta */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-neutral-50 dark:bg-[#161616] p-3.5 rounded-xl border border-neutral-200 dark:border-[#292929]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8A8A8A] block mb-1">
                Account Role
              </span>
              <span className="font-bold text-neutral-900 dark:text-[#F5F5F5] capitalize flex items-center gap-1.5">
                {user.role === 'admin' ? (
                  <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                ) : user.role === 'lister' ? (
                  <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
                {user.role} {user.listerSubtype ? `(${user.listerSubtype})` : ''}
              </span>
            </div>

            <div className="bg-neutral-50 dark:bg-[#161616] p-3.5 rounded-xl border border-neutral-200 dark:border-[#292929]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8A8A8A] block mb-1">
                Member Since
              </span>
              <span className="font-bold text-neutral-900 dark:text-[#F5F5F5] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500 dark:text-[#8A8A8A]" />
                {user.joinedAt || 'Active Test Account'}
              </span>
            </div>
          </div>

          {/* Role-Specific Activity */}
          {user.role === 'lister' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-700 dark:text-[#D5D5D5]">
                  Managed Properties ({userProperties.length})
                </h4>
                {onViewListerProperties && (
                  <button
                    type="button"
                    onClick={() => {
                      onViewListerProperties(user.id);
                      onClose();
                    }}
                    className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View in Dashboard</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-neutral-50 dark:bg-[#161616] p-3 rounded-xl border border-neutral-200 dark:border-[#292929]">
                  <div className="text-lg font-black text-neutral-950 dark:text-[#F5F5F5]">{activeCount}</div>
                  <div className="text-[10px] text-neutral-500 dark:text-[#8A8A8A] font-semibold">Live Listings</div>
                </div>
                <div className="bg-neutral-50 dark:bg-[#161616] p-3 rounded-xl border border-neutral-200 dark:border-[#292929]">
                  <div className="text-lg font-black text-neutral-950 dark:text-[#F5F5F5]">{totalUnits}</div>
                  <div className="text-[10px] text-neutral-500 dark:text-[#8A8A8A] font-semibold">Total Units</div>
                </div>
                <div className="bg-neutral-50 dark:bg-[#161616] p-3 rounded-xl border border-neutral-200 dark:border-[#292929]">
                  <div className="text-lg font-black text-emerald-700 dark:text-emerald-400">{totalVacancies}</div>
                  <div className="text-[10px] text-neutral-500 dark:text-[#8A8A8A] font-semibold">Vacancies</div>
                </div>
              </div>

              {/* Listing items */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {userProperties.map((prop) => (
                  <div
                    key={prop.id}
                    onClick={() => {
                      if (onSelectProperty) {
                        onSelectProperty(prop);
                      }
                    }}
                    className="p-3 rounded-xl border border-neutral-200 dark:border-[#292929] bg-white dark:bg-[#161616] hover:border-black dark:hover:border-white hover:shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={prop.coverPhoto || prop.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'}
                        alt={prop.name}
                        className="w-10 h-10 rounded-lg object-cover border border-neutral-200 dark:border-[#383838] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-neutral-900 dark:text-[#F5F5F5] truncate">{prop.name}</div>
                        <div className="text-[11px] text-neutral-500 dark:text-[#8A8A8A]">
                          {prop.location.estate} • KSh {prop.monthlyRent.toLocaleString()}/mo
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        prop.status === 'Approved'
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                          : prop.status === 'Pending'
                          ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {prop.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {user.role === 'seeker' && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-700 dark:text-[#D5D5D5]">
                Seeker Activity
              </h4>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-neutral-50 dark:bg-[#161616] p-3.5 rounded-xl border border-neutral-200 dark:border-[#292929]">
                  <div className="text-lg font-black text-neutral-950 dark:text-[#F5F5F5]">
                    {user.savedPropertyIds?.length || 1}
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-[#8A8A8A] font-semibold flex items-center justify-center gap-1 mt-0.5">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    Saved Homes
                  </div>
                </div>
                <div className="bg-neutral-50 dark:bg-[#161616] p-3.5 rounded-xl border border-neutral-200 dark:border-[#292929]">
                  <div className="text-lg font-black text-neutral-950 dark:text-[#F5F5F5]">1</div>
                  <div className="text-[10px] text-neutral-500 dark:text-[#8A8A8A] font-semibold flex items-center justify-center gap-1 mt-0.5">
                    <MessageSquare className="w-3 h-3 text-blue-500" />
                    Active Inquiries
                  </div>
                </div>
              </div>
            </div>
          )}

          {user.role === 'admin' && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-700 dark:text-[#D5D5D5]">
                Super Admin Permissions
              </h4>
              <div className="bg-neutral-50 dark:bg-[#161616] p-4 rounded-xl border border-neutral-200 dark:border-[#292929] space-y-2 text-xs text-neutral-700 dark:text-[#D5D5D5]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Full Property Moderation & Instant Approval/Rejection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Kenya Location Taxonomy & Geo Hierarchy Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Dispute Resolution & Audit Investigation Controls</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>User Directory & Permission Management</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#141414] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {user.role !== 'admin' && (
              <button
                type="button"
                onClick={handleToggleSuspend}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSuspended
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    : 'bg-rose-100 dark:bg-rose-950/40 hover:bg-rose-200 dark:hover:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
                }`}
              >
                {isSuspended ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Reinstate Account</span>
                  </>
                ) : (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>Suspend Account</span>
                  </>
                )}
              </button>
            )}
            {statusMessage && (
              <span className="text-xs text-neutral-600 dark:text-[#A3A3A3] font-medium animate-fade-in">
                {statusMessage}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
