import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquarePlus,
  Reply,
  CornerDownRight,
  Edit2,
  Trash2,
  AlertCircle,
  ShieldAlert,
  CheckCircle,
  X
} from 'lucide-react';
import { PropertyListing, PropertyReview } from '../types';
import { useApp } from '../context/AppContext';

interface ReviewListProps {
  property: PropertyListing;
}

export const ReviewList: React.FC<ReviewListProps> = ({ property }) => {
  const {
    getPropertyReviews,
    addReview,
    addReviewReply,
    editReviewReply,
    deleteReviewReply,
    reportReview,
    currentUser,
    targetReviewId,
    setTargetReviewId
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [highlightedReviewId, setHighlightedReviewId] = useState<string | null>(null);

  // Active reply form states
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('');

  const reviews = getPropertyReviews(property.id);

  // Dynamic calculated average rating directly from actual review records
  const { averageRating, ratingCount, recommendationPercentage } = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { averageRating: 0, ratingCount: 0, recommendationPercentage: 0 };
    }
    const sum = reviews.reduce((acc, rev) => acc + (rev.rating || 0), 0);
    const avg = Math.round((sum / reviews.length) * 10) / 10;

    const recReviews = reviews.filter((r) => typeof r.wouldRecommend === 'boolean');
    const yesRecs = recReviews.filter((r) => r.wouldRecommend === true).length;
    const recPct =
      recReviews.length > 0 ? Math.round((yesRecs / recReviews.length) * 100) : 0;

    return {
      averageRating: avg,
      ratingCount: reviews.length,
      recommendationPercentage: recPct
    };
  }, [reviews]);

  // Auto-scroll and highlight target review when targetReviewId is set
  useEffect(() => {
    if (!targetReviewId) return;

    setHighlightedReviewId(targetReviewId);

    const scrollTimer = setTimeout(() => {
      const reviewElement =
        document.getElementById(`review-${targetReviewId}`) ||
        document.getElementById(`property-review-${targetReviewId}`);

      if (reviewElement) {
        reviewElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      } else {
        const sectionElement =
          document.getElementById('tenant-ratings-section') ||
          document.getElementById('property-reviews-section');
        if (sectionElement) {
          sectionElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    }, 120);

    const clearTimer = setTimeout(() => {
      setHighlightedReviewId(null);
      setTargetReviewId(null);
    }, 3800);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
    };
  }, [targetReviewId, setTargetReviewId]);

  // Strictly only the lister who owns this reviewed property can reply or manage replies
  const isPropertyOwner =
    currentUser?.role === 'lister' &&
    currentUser?.id &&
    property.lister?.id === currentUser.id;

  const handleStartReply = (rev: PropertyReview) => {
    setReplyingReviewId(rev.id);
    setEditingReplyId(null);
    setReplyText('');
    setDeleteConfirmId(null);
  };

  const handleStartEdit = (rev: PropertyReview) => {
    if (rev.reply) {
      setReplyingReviewId(null);
      setEditingReplyId(rev.id);
      setReplyText(rev.reply.replyText);
      setDeleteConfirmId(null);
    }
  };

  const handlePostReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    addReviewReply(reviewId, replyText.trim());
    setReplyingReviewId(null);
    setReplyText('');
  };

  const handleSaveEdit = (reviewId: string) => {
    if (!replyText.trim()) return;
    editReviewReply(reviewId, replyText.trim());
    setEditingReplyId(null);
    setReplyText('');
  };

  const handleDeleteReply = (reviewId: string) => {
    deleteReviewReply(reviewId);
    setDeleteConfirmId(null);
  };

  const handleReport = (reviewId: string) => {
    reportReview(reviewId, reportReason.trim() || 'Inappropriate review content');
    setReportingReviewId(null);
    setReportReason('');
  };

  return (
    <div id="tenant-ratings-section" className="space-y-6">
      {/* Header & General Property Rating */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-[#262626]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8A8A8A] font-sans block mb-1">
            Tenant Ratings
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-xl text-base font-extrabold font-sans shadow-2xs">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>{averageRating > 0 ? averageRating.toFixed(1) : 'New'}</span>
            </div>
            <div>
              <p className="text-sm font-bold font-sans text-neutral-900 dark:text-[#F5F5F5]">
                {ratingCount > 0
                  ? `Based on ${ratingCount} ${ratingCount === 1 ? 'rating' : 'ratings'}`
                  : 'No ratings yet'}
              </p>
              {ratingCount > 0 && recommendationPercentage > 0 && (
                <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] font-sans font-medium">
                  {recommendationPercentage}% would recommend this property
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Seekers can write reviews; property owners manage responses */}
        {!isPropertyOwner && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold font-sans px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-2xs self-start sm:self-auto active:scale-98"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Rate & Review</span>
          </button>
        )}
      </div>

      {/* Individual Review Cards */}
      <div className="space-y-4 pt-1">
        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-neutral-50 dark:bg-[#151515] rounded-2xl border border-neutral-200 dark:border-[#292929] text-neutral-500 dark:text-[#8A8A8A] text-sm font-sans">
            <p className="font-semibold text-neutral-800 dark:text-[#E0E0E0]">No ratings yet</p>
            <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] mt-1">
              Be the first to rate and review {property.name}!
            </p>
          </div>
        ) : (
          reviews.map((rev) => {
            const isReplying = replyingReviewId === rev.id;
            const isEditing = editingReplyId === rev.id;
            const isDeleting = deleteConfirmId === rev.id;
            const isReporting = reportingReviewId === rev.id;
            const isHighlighted = highlightedReviewId === rev.id;
            const hasComment = rev.comment && rev.comment.trim().length > 0;

            return (
              <div
                key={rev.id}
                id={`review-${rev.id}`}
                className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 transition-all duration-500 font-sans ${
                  isHighlighted
                    ? 'border-black dark:border-white ring-2 ring-black dark:ring-white bg-neutral-50/90 dark:bg-[#181818] shadow-md scale-[1.008]'
                    : 'border-neutral-200 dark:border-[#292929] bg-white dark:bg-[#151515] shadow-2xs'
                }`}
              >
                {/* Highlight Badge when navigated from notification */}
                {isHighlighted && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold rounded-lg mb-1 animate-pulse">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                    <span>Review & Lister Response</span>
                  </div>
                )}

                {/* Reviewer Header: Name, Date, Overall Star Rating */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {rev.authorAvatar ? (
                      <img
                        src={rev.authorAvatar}
                        alt={rev.authorName}
                        className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-[#333333]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-[#222222] flex items-center justify-center text-neutral-700 dark:text-[#E0E0E0] font-bold">
                        {rev.authorName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-[#F5F5F5]">{rev.authorName}</h4>
                      <p className="text-[11px] text-neutral-400 dark:text-[#7D7D7D]">{rev.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#222222] px-2.5 py-1 rounded-lg">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((starIndex) => (
                        <Star
                          key={starIndex}
                          className={`w-3.5 h-3.5 ${
                            starIndex <= rev.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-neutral-300 dark:text-[#4A4A4A]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-[#F5F5F5] ml-0.5">
                      {rev.rating}.0
                    </span>
                  </div>
                </div>

                {/* Written Comment (Rendered ONLY if provided) */}
                {hasComment && (
                  <p className="text-xs sm:text-sm text-neutral-800 dark:text-[#D5D5D5] leading-relaxed pl-0.5">
                    "{rev.comment}"
                  </p>
                )}

                {/* Recommendation Status */}
                {rev.wouldRecommend === true && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-[#F5F5F5] pt-0.5">
                    <ThumbsUp className="w-3.5 h-3.5 text-black dark:text-white" />
                    <span>Recommends this property</span>
                  </div>
                )}
                {rev.wouldRecommend === false && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-[#8A8A8A] pt-0.5">
                    <ThumbsDown className="w-3.5 h-3.5 text-neutral-400 dark:text-[#7D7D7D]" />
                    <span>Does not recommend this property</span>
                  </div>
                )}

                {rev.reported && (
                  <div className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50 font-semibold">
                    <ShieldAlert className="w-3 h-3" />
                    <span>Under Review</span>
                  </div>
                )}

                {/* Public Lister Response Display */}
                {rev.reply && !isEditing && (
                  <div
                    id={`lister-response-${rev.id}`}
                    className="mt-3 ml-3 sm:ml-6 pl-4 border-l-2 border-black dark:border-white bg-neutral-50 dark:bg-[#1A1A1A] p-4 rounded-r-2xl space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {rev.reply.listerAvatar ? (
                          <img
                            src={rev.reply.listerAvatar}
                            alt={rev.reply.listerName}
                            className="w-7 h-7 rounded-full object-cover border border-neutral-300 dark:border-[#383838]"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs">
                            {rev.reply.listerName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-neutral-950 dark:text-[#F5F5F5]">
                              Response from {rev.reply.listerName}
                            </span>
                            <span className="text-[10px] bg-black dark:bg-white text-white dark:text-black font-bold px-1.5 py-0.2 rounded">
                              Property Lister
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-400 dark:text-[#7D7D7D]">
                            {rev.reply.createdAt} {rev.reply.updatedAt ? `• ${rev.reply.updatedAt}` : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-800 dark:text-[#D5D5D5] leading-relaxed italic pl-0.5">
                      "{rev.reply.replyText}"
                    </p>
                  </div>
                )}

                {/* Reply Form for Property Owner (Create or Edit) */}
                {isPropertyOwner && (isReplying || isEditing) && (
                  <div className="mt-3 ml-2 sm:ml-6 p-4 bg-neutral-50 dark:bg-[#181818] rounded-2xl border border-neutral-200 dark:border-[#292929] space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-[#F5F5F5]">
                      <CornerDownRight className="w-3.5 h-3.5 text-black dark:text-white" />
                      <span>
                        {isEditing ? 'Edit Your Official Response' : `Write a Response to ${rev.authorName}`}
                      </span>
                    </div>

                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a response to this review..."
                      className="w-full p-3 bg-white dark:bg-[#111111] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-xs focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none leading-relaxed"
                      autoFocus
                    />

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingReviewId(null);
                          setEditingReplyId(null);
                          setReplyText('');
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => (isEditing ? handleSaveEdit(rev.id) : handlePostReply(rev.id))}
                        disabled={!replyText.trim()}
                        className="px-4 py-1.5 text-xs font-bold bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 transition-colors cursor-pointer shadow-2xs"
                      >
                        {isEditing ? 'Save Changes' : 'Post Reply'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Delete Confirmation Prompt */}
                {isPropertyOwner && isDeleting && (
                  <div className="mt-3 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span>Delete your official response?</span>
                    </div>
                    <p className="text-[11px] text-red-700 dark:text-red-400">
                      This will remove your response. The tenant's original review will remain untouched.
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1 text-xs font-bold text-neutral-700 dark:text-[#D5D5D5] hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteReply(rev.id)}
                        className="px-3.5 py-1 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                )}

                {/* Report Form */}
                {isReporting && (
                  <div className="mt-3 p-3.5 bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#292929] rounded-xl text-xs space-y-2 animate-in fade-in">
                    <span className="font-bold text-neutral-900 dark:text-[#F5F5F5] block">Report Review for Moderation</span>
                    <input
                      type="text"
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Reason (e.g. spam, abusive language, false claims)..."
                      className="w-full p-2 bg-white dark:bg-[#111111] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-lg text-xs focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setReportingReviewId(null);
                          setReportReason('');
                        }}
                        className="px-3 py-1 text-xs font-bold text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReport(rev.id)}
                        className="px-3.5 py-1 text-xs font-bold bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer"
                      >
                        Submit Report
                      </button>
                    </div>
                  </div>
                )}

                {/* Review Action Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-[#262626] text-xs">
                  {/* Property Owner Controls: Reply / Edit Reply / Delete Reply */}
                  {isPropertyOwner ? (
                    <div className="flex items-center gap-2">
                      {!rev.reply ? (
                        !isReplying && (
                          <button
                            type="button"
                            id={`owner-reply-btn-${rev.id}`}
                            onClick={() => handleStartReply(rev)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Reply className="w-3.5 h-3.5" />
                            <span>Reply</span>
                          </button>
                        )
                      ) : (
                        !isEditing &&
                        !isDeleting && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              id={`owner-edit-reply-btn-${rev.id}`}
                              onClick={() => handleStartEdit(rev)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-[#222222] hover:bg-neutral-200 dark:hover:bg-[#2D2D2D] text-neutral-800 dark:text-[#E0E0E0] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit Reply</span>
                            </button>
                            <button
                              type="button"
                              id={`owner-delete-reply-btn-${rev.id}`}
                              onClick={() => setDeleteConfirmId(rev.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-[#222222] hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-700 dark:text-[#D5D5D5] hover:text-red-700 dark:hover:text-red-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete Reply</span>
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Report Button (available for both lister or other viewers) */}
                  {!isReporting && (
                    <button
                      type="button"
                      onClick={() => setReportingReviewId(rev.id)}
                      className="text-[11px] text-neutral-400 dark:text-[#7D7D7D] hover:text-neutral-700 dark:hover:text-[#D5D5D5] font-semibold cursor-pointer"
                    >
                      Report Review
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Write Review Modal */}
      {modalOpen && (
        <WriteReviewModal
          property={property}
          onClose={() => setModalOpen(false)}
          onSubmit={(revData) => {
            addReview(property.id, revData);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

interface WriteReviewModalProps {
  property: PropertyListing;
  onClose: () => void;
  onSubmit: (revData: Omit<PropertyReview, 'id' | 'propertyId' | 'date'>) => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  property,
  onClose,
  onSubmit
}) => {
  const { currentUser } = useApp();
  const [authorName, setAuthorName] = useState(currentUser?.name || '');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(true);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 1:
        return '1 of 5 stars - Poor';
      case 2:
        return '2 of 5 stars - Fair';
      case 3:
        return '3 of 5 stars - Good';
      case 4:
        return '4 of 5 stars - Very Good';
      case 5:
        return '5 of 5 stars - Excellent';
      default:
        return `${score} of 5 stars`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanComment = comment.trim();
    onSubmit({
      authorId: currentUser?.id || 'demo-seeker-001',
      authorName: authorName.trim() || 'Resident',
      authorAvatar: currentUser?.avatar,
      rating,
      comment: cleanComment ? cleanComment : undefined,
      wouldRecommend
    });
  };

  const activeStarRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in">
      <div className="bg-white dark:bg-[#111111] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 dark:border-[#292929] animate-in zoom-in-95 duration-150 relative font-sans text-neutral-900 dark:text-[#F5F5F5]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1E1E1E] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-2xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] mb-1">
          Rate & Review {property.name}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] mb-5">
          Share your overall rating and feedback for this property.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Your Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-[#D5D5D5] mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Kevin Otieno"
              className="w-full px-3 py-2 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-xs focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
              required
            />
          </div>

          {/* Overall Property Rating (1 to 5 stars, required) */}
          <div className="p-4 bg-neutral-50 dark:bg-[#151515] rounded-2xl border border-neutral-200 dark:border-[#292929]">
            <label className="block text-xs font-bold text-neutral-800 dark:text-[#E0E0E0] uppercase tracking-wider mb-2">
              Overall Property Rating <span className="text-neutral-400 dark:text-[#7D7D7D] lowercase font-normal">(required)</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= activeStarRating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-neutral-300 dark:text-[#4A4A4A]'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-neutral-900 dark:text-[#F5F5F5] ml-2">
                {getRatingLabel(activeStarRating)}
              </span>
            </div>
          </div>

          {/* Recommendation: Yes / No */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-[#D5D5D5] mb-2">
              Would you recommend this property to other tenants?
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setWouldRecommend(true)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  wouldRecommend === true
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-2xs'
                    : 'bg-white dark:bg-[#151515] text-neutral-700 dark:text-[#D5D5D5] border-neutral-200 dark:border-[#303030] hover:border-neutral-400 dark:hover:border-neutral-500'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${wouldRecommend === true ? 'text-white dark:text-black' : 'text-neutral-500 dark:text-[#8A8A8A]'}`} />
                <span>Yes, I recommend</span>
              </button>

              <button
                type="button"
                onClick={() => setWouldRecommend(false)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  wouldRecommend === false
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-2xs'
                    : 'bg-white dark:bg-[#151515] text-neutral-700 dark:text-[#D5D5D5] border-neutral-200 dark:border-[#303030] hover:border-neutral-400 dark:hover:border-neutral-500'
                }`}
              >
                <ThumbsDown className={`w-4 h-4 ${wouldRecommend === false ? 'text-white dark:text-black' : 'text-neutral-500 dark:text-[#8A8A8A]'}`} />
                <span>No, I don't</span>
              </button>
            </div>
          </div>

          {/* Written Review / Comment (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-[#D5D5D5]">
                Written Review / Comment
              </label>
              <span className="text-[11px] text-neutral-400 dark:text-[#7D7D7D] font-medium">Optional</span>
            </div>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about your experience living here (optional)..."
              className="w-full px-3 py-2 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-xs focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
            />
            <p className="text-[11px] text-neutral-400 dark:text-[#7D7D7D] mt-1">
              You can submit a star rating with or without a written comment.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-[#262626]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-2xs cursor-pointer active:scale-98"
            >
              {comment.trim() ? 'Submit Rating & Review' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
