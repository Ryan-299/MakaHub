import React, { useState } from 'react';
import { X, CheckCircle, XCircle, MapPin, ShieldCheck, AlertOctagon, AlertTriangle } from 'lucide-react';
import { PropertyListing } from '../types';
import { useApp } from '../context/AppContext';

interface AdminPropertyReviewModalProps {
  property: PropertyListing;
  onClose: () => void;
}

export const AdminPropertyReviewModal: React.FC<AdminPropertyReviewModalProps> = ({
  property,
  onClose
}) => {
  const { approveProperty, rejectProperty, suspendProperty } = useApp();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState<'approved' | 'rejected' | 'suspended' | null>(null);

  const handleApprove = () => {
    approveProperty(property.id);
    setActionDone('approved');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleConfirmReject = () => {
    const trimmed = rejectReason.trim();
    if (!trimmed) {
      setRejectError('Please state the specific rejection reason for the landlord');
      return;
    }
    setRejectError(null);
    rejectProperty(property.id, trimmed);
    setShowRejectDialog(false);
    setActionDone('rejected');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleConfirmSuspend = () => {
    if (suspendProperty) {
      suspendProperty(property.id, suspendReason.trim() || 'Suspended by platform administrator');
    }
    setShowSuspendDialog(false);
    setActionDone('suspended');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const isPending = property.status === 'Pending';
  const isApproved = property.status === 'Approved';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs font-sans">
      <div className="bg-white dark:bg-[#111111] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-[#292929] animate-in zoom-in-95 duration-150 overflow-hidden relative text-neutral-900 dark:text-[#F5F5F5]">
        
        {/* Sticky Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-neutral-200 dark:border-[#262626] flex items-center justify-between bg-white dark:bg-[#111111] shrink-0">
          <div className="min-w-0 pr-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  property.status === 'Approved'
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40'
                    : property.status === 'Pending'
                    ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40'
                    : 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40'
                }`}
              >
                {property.status === 'Approved' ? 'Approved & Live' : property.status === 'Pending' ? 'Pending Moderation' : 'Rejected'}
              </span>
              <span className="text-xs text-neutral-500 dark:text-[#7D7D7D] font-mono">ID: {property.id}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-editorial font-bold text-neutral-950 dark:text-[#F5F5F5] mt-1 truncate">
              {property.name}
            </h3>
          </div>

          <button
            type="button"
            id="admin-review-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-xl hover:bg-neutral-100 dark:hover:bg-[#1E1E1E] flex items-center justify-center text-neutral-400 dark:text-[#8A8A8A] hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Completion Screen */}
        {actionDone ? (
          <div className="p-10 sm:p-14 text-center space-y-3 my-auto flex-1 flex flex-col justify-center items-center">
            {actionDone === 'approved' ? (
              <>
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-editorial font-bold text-neutral-950 dark:text-[#F5F5F5]">Listing Approved!</h4>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#A3A3A3] max-w-sm">
                  <span className="font-semibold text-neutral-800 dark:text-[#E0E0E0]">{property.name}</span> has been approved and is now live and discoverable for property seekers.
                </p>
              </>
            ) : actionDone === 'rejected' ? (
              <>
                <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-1">
                  <XCircle className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-editorial font-bold text-neutral-950 dark:text-[#F5F5F5]">Listing Rejected</h4>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#A3A3A3] max-w-sm">
                  Rejection notification and feedback recorded for the property lister.
                </p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-1">
                  <AlertOctagon className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-editorial font-bold text-neutral-950 dark:text-[#F5F5F5]">Listing Suspended</h4>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#A3A3A3] max-w-sm">
                  Listing has been temporarily taken offline and hidden from discovery.
                </p>
              </>
            )}
          </div>
        ) : (
          /* Scrollable Property Information */
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-6 text-xs sm:text-sm">
            {/* 1. Photos & Video Media */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8A8A8A] mb-2.5">
                1. Uploaded Media ({property.images.length} Photos{property.video ? ', 1 Video Tour' : ''})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {property.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${property.name} ${idx + 1}`}
                    className="h-28 w-full object-cover rounded-xl border border-neutral-200 dark:border-[#2E2E2E]"
                  />
                ))}
              </div>
              {property.video && (
                <div className="mt-3 rounded-xl overflow-hidden bg-black border border-neutral-200 dark:border-[#2E2E2E] aspect-16/9 max-h-56">
                  <video
                    src={property.video}
                    controls
                    autoPlay={false}
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* 2. Lister Details */}
            <div className="bg-neutral-50 dark:bg-[#161616] p-4 rounded-xl border border-neutral-200 dark:border-[#292929]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8A8A8A] mb-2.5">
                2. Property Lister Profile
              </h4>
              <div className="flex items-center gap-3">
                <img
                  src={property.lister?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
                  alt={property.lister?.name || 'Lister'}
                  className="w-11 h-11 rounded-full object-cover border border-neutral-200 dark:border-[#383838]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 dark:text-[#F5F5F5] text-sm">{property.lister?.name || 'Property Owner'}</span>
                    {property.lister?.verified && (
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  <span className="text-xs text-neutral-600 dark:text-[#A3A3A3] block">{property.lister?.type || 'Landlord / Property Owner'}</span>
                  <span className="text-xs text-neutral-500 dark:text-[#7D7D7D]">{property.lister?.phone || 'Phone verified (+254)'}</span>
                </div>
              </div>
            </div>

            {/* 3 & 4. Location & Pricing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-neutral-50 dark:bg-[#161616] p-4 rounded-xl border border-neutral-200 dark:border-[#292929] space-y-1.5 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8A8A8A] mb-2">
                  3. Location Specification
                </h4>
                <p><strong className="text-neutral-900 dark:text-[#F5F5F5]">County:</strong> {property.location.county}</p>
                <p><strong className="text-neutral-900 dark:text-[#F5F5F5]">Sub-County:</strong> {property.location.subCounty}</p>
                <p><strong className="text-neutral-900 dark:text-[#F5F5F5]">Ward:</strong> {property.location.ward}</p>
                <p><strong className="text-neutral-900 dark:text-[#F5F5F5]">Estate:</strong> {property.location.estate}</p>
                {property.location.address && (
                  <p className="text-neutral-500 dark:text-[#8A8A8A]"><strong>Address:</strong> {property.location.address}</p>
                )}
                <div className="pt-1 text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Map Pin Coordinates Verified</span>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-[#161616] p-4 rounded-xl border border-neutral-200 dark:border-[#292929] space-y-1.5 text-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8A8A8A] mb-2">
                  4. Pricing & Availability
                </h4>
                <p><strong className="text-neutral-900 dark:text-[#F5F5F5]">Property Type:</strong> {property.type}</p>
                <p><strong className="text-neutral-900 dark:text-[#F5F5F5]">Monthly Rent:</strong> KSh {property.monthlyRent.toLocaleString()}</p>
                <p><strong className="text-neutral-900 dark:text-[#F5F5F5]">Deposit:</strong> KSh {property.deposit.toLocaleString()}</p>
                <p><strong className="text-neutral-900 dark:text-[#F5F5F5]">Service Charge:</strong> KSh {property.serviceCharge.toLocaleString()}</p>
                <div className="pt-2 border-t border-neutral-200 dark:border-[#2E2E2E] flex gap-3 text-xs font-bold">
                  <span className="text-emerald-700 dark:text-emerald-400">{property.vacancies} Vacant</span>
                  <span className="text-neutral-700 dark:text-[#A3A3A3]">{property.occupied} Occupied</span>
                  <span className="text-neutral-700 dark:text-[#A3A3A3]">{property.underRepair} Repair</span>
                </div>
              </div>
            </div>

            {/* 5. Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8A8A8A] mb-1.5">
                5. Property Description
              </h4>
              <p className="text-neutral-700 dark:text-[#D5D5D5] text-xs leading-relaxed bg-neutral-50 dark:bg-[#161616] p-3.5 rounded-xl border border-neutral-200 dark:border-[#292929]">
                {property.description}
              </p>
            </div>

            {/* 6. Included Amenities */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8A8A8A] mb-2">
                6. Included Amenities
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {property.amenities.map((a, idx) => (
                  <span
                    key={idx}
                    className="bg-neutral-100 dark:bg-[#1C1C1C] text-neutral-800 dark:text-[#D5D5D5] border border-neutral-200 dark:border-[#2E2E2E] text-xs px-2.5 py-1 rounded-md font-medium"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* If previously rejected, show prior rejection note */}
            {property.rejectionReason && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-800 dark:text-rose-300">
                <span className="font-bold block mb-0.5">Recorded Rejection Reason:</span>
                {property.rejectionReason}
              </div>
            )}
          </div>
        )}

        {/* Sticky Moderation Action Bar */}
        {!actionDone && (
          <div className="px-5 sm:px-6 py-3.5 border-t border-neutral-200 dark:border-[#292929] bg-white dark:bg-[#0D0D0D] shrink-0 flex items-center justify-between gap-3">
            {isPending ? (
              <>
                <button
                  type="button"
                  id="admin-reject-listing-btn"
                  onClick={() => {
                    setRejectReason('');
                    setRejectError(null);
                    setShowRejectDialog(true);
                  }}
                  className="flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 min-h-[44px] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 border bg-white dark:bg-transparent text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Listing</span>
                </button>

                <button
                  type="button"
                  id="admin-approve-listing-btn"
                  onClick={handleApprove}
                  className="flex-1 sm:flex-initial px-5 sm:px-8 py-2.5 min-h-[44px] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 bg-[#111111] hover:bg-black text-white dark:bg-[#F5F5F5] dark:hover:bg-white dark:text-[#111111] shadow-xs"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  <span>Approve Listing</span>
                </button>
              </>
            ) : isApproved ? (
              <>
                <button
                  type="button"
                  id="admin-close-approved-btn"
                  onClick={onClose}
                  className="px-4 py-2.5 min-h-[44px] text-xs font-bold text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  id="admin-suspend-listing-btn"
                  onClick={() => {
                    setSuspendReason('');
                    setShowSuspendDialog(true);
                  }}
                  className="px-5 py-2.5 min-h-[44px] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 border bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/60"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Suspend Listing</span>
                </button>
              </>
            ) : (
              /* Already Rejected or Flagged */
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 min-h-[44px] text-xs font-bold text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  id="admin-reinstate-approve-btn"
                  onClick={handleApprove}
                  className="px-5 sm:px-7 py-2.5 min-h-[44px] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 bg-[#111111] hover:bg-black text-white dark:bg-[#F5F5F5] dark:hover:bg-white dark:text-[#111111] shadow-xs"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                  <span>Approve & Reinstate</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Reject Confirmation Dialog Overlay */}
        {showRejectDialog && (
          <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#151515] border border-neutral-200 dark:border-[#303030] rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-neutral-950 dark:text-[#F5F5F5]">Reject Property Listing</h4>
                  <p className="text-xs text-neutral-500 dark:text-[#A3A3A3]">Provide a specific rejection reason for the lister</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-[#CCCCCC]">
                  Reason for Rejection <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  id="admin-reject-reason-textarea"
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (rejectError) setRejectError(null);
                  }}
                  placeholder="e.g. Unclear photos, incomplete building documentation, or invalid rent/deposit terms."
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-[#111111] border border-neutral-300 dark:border-[#383838] focus:border-rose-500 dark:focus:border-rose-500 rounded-xl text-xs text-neutral-900 dark:text-[#F5F5F5] placeholder-neutral-400 focus:outline-none resize-none leading-relaxed"
                  autoFocus
                />
                {rejectError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{rejectError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  id="admin-cancel-reject-btn"
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectError(null);
                  }}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl text-neutral-600 dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#202020] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="admin-confirm-reject-btn"
                  onClick={handleConfirmReject}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Listing</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Suspend Confirmation Dialog Overlay */}
        {showSuspendDialog && (
          <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#151515] border border-neutral-200 dark:border-[#303030] rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-neutral-950 dark:text-[#F5F5F5]">Suspend Listing</h4>
                  <p className="text-xs text-neutral-500 dark:text-[#A3A3A3]">Temporarily hide this property from public search</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-[#CCCCCC]">
                  Reason for Suspension (Optional)
                </label>
                <textarea
                  rows={3}
                  id="admin-suspend-reason-textarea"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="e.g. Under investigation for dispute report or updated terms."
                  className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-[#111111] border border-neutral-300 dark:border-[#383838] focus:border-amber-500 dark:focus:border-amber-500 rounded-xl text-xs text-neutral-900 dark:text-[#F5F5F5] placeholder-neutral-400 focus:outline-none resize-none leading-relaxed"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  id="admin-cancel-suspend-btn"
                  onClick={() => setShowSuspendDialog(false)}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl text-neutral-600 dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#202020] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="admin-confirm-suspend-btn"
                  onClick={handleConfirmSuspend}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Suspend Listing</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

