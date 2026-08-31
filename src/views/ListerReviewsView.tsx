import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  Building2,
  Reply,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ArrowRight,
  AlertCircle,
  ThumbsUp,
  CornerDownRight,
  Edit2,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PropertyReview } from '../types';

export const ListerReviewsView: React.FC = () => {
  const {
    currentUser,
    listerListings = [],
    listerReviews = [],
    addReviewReply,
    editReviewReply,
    deleteReviewReply,
    reportReview,
    setCurrentView,
    selectedPropertyId,
    setSelectedPropertyId,
    targetReviewId,
    setTargetReviewId
  } = useApp();

  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unreplied' | 'replied'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedReviewId, setHighlightedReviewId] = useState<string | null>(null);
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null);

  // Active reply form states
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('');

  // Auto-scroll and highlight target review when targetReviewId is set
  useEffect(() => {
    if (!targetReviewId) {
      if (selectedPropertyId && selectedPropertyId !== 'all') {
        const propExists = listerListings.some((p) => p.id.toLowerCase() === selectedPropertyId.toLowerCase());
        if (propExists) {
          const matchedProp = listerListings.find((p) => p.id.toLowerCase() === selectedPropertyId.toLowerCase());
          setSelectedPropertyFilter(matchedProp ? matchedProp.id : selectedPropertyId);
        } else {
          setSelectedPropertyFilter('all');
        }
      }
      return;
    }

    // Locate target review to match property filter
    const targetRev = listerReviews.find((r) => r.id === targetReviewId);
    if (targetRev) {
      setSelectedPropertyFilter(targetRev.propertyId);
      setNotFoundMessage(null);
      setStatusFilter('all');
      setSearchQuery('');
      setHighlightedReviewId(targetReviewId);

      const attemptScroll = () => {
        const reviewElement =
          document.getElementById(`review-${targetReviewId}`) ||
          document.getElementById(`lister-review-card-${targetReviewId}`);

        if (reviewElement) {
          reviewElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          return true;
        }
        return false;
      };

      // Multi-step scroll attempts to handle DOM rendering and layout stabilization
      const timer1 = setTimeout(attemptScroll, 100);
      const timer2 = setTimeout(attemptScroll, 280);
      const timer3 = setTimeout(attemptScroll, 500);

      const clearTimer = setTimeout(() => {
        setHighlightedReviewId(null);
        setTargetReviewId(null);
      }, 3800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(clearTimer);
      };
    } else {
      // Review not found in lister reviews
      if (selectedPropertyId && selectedPropertyId !== 'all') {
        const propExists = listerListings.some((p) => p.id.toLowerCase() === selectedPropertyId.toLowerCase());
        if (propExists) {
          const matchedProp = listerListings.find((p) => p.id.toLowerCase() === selectedPropertyId.toLowerCase());
          setSelectedPropertyFilter(matchedProp ? matchedProp.id : selectedPropertyId);
        } else {
          setSelectedPropertyFilter('all');
        }
      } else {
        setSelectedPropertyFilter('all');
      }

      setNotFoundMessage('This review could not be found.');
      const notFoundTimer = setTimeout(() => {
        setNotFoundMessage(null);
        setTargetReviewId(null);
      }, 5000);

      return () => clearTimeout(notFoundTimer);
    }
  }, [targetReviewId, selectedPropertyId, listerReviews, listerListings, setTargetReviewId]);

  // Filter reviews
  const filteredReviews = listerReviews.filter((rev) => {
    if (selectedPropertyFilter !== 'all' && rev.propertyId !== selectedPropertyFilter) {
      return false;
    }
    if (statusFilter === 'unreplied' && rev.reply) {
      return false;
    }
    if (statusFilter === 'replied' && !rev.reply) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAuthor = rev.authorName.toLowerCase().includes(q);
      const matchComment = rev.comment ? rev.comment.toLowerCase().includes(q) : false;
      const prop = listerListings.find((p) => p.id === rev.propertyId);
      const matchProp = prop?.name.toLowerCase().includes(q) || false;
      return matchAuthor || matchComment || matchProp;
    }
    return true;
  });

  const totalReviewsCount = listerReviews.length;
  const repliedCount = listerReviews.filter((r) => !!r.reply).length;
  const unrepliedCount = totalReviewsCount - repliedCount;
  const avgRating =
    totalReviewsCount > 0
      ? (
          listerReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount
        ).toFixed(1)
      : '0.0';

  const handleStartReply = (review: PropertyReview) => {
    setReplyingReviewId(review.id);
    setEditingReplyId(null);
    setReplyText('');
    setDeleteConfirmId(null);
  };

  const handleStartEdit = (review: PropertyReview) => {
    if (review.reply) {
      setReplyingReviewId(null);
      setEditingReplyId(review.id);
      setReplyText(review.reply.replyText);
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
    <div id="lister-reviews-page" className="min-h-[calc(100vh-4rem)] bg-white dark:bg-[#000000] pb-24 text-neutral-900 dark:text-[#F5F5F5] font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-[#262626]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black px-2.5 py-0.5 rounded">
                Lister Portal
              </span>
              <span className="text-xs text-neutral-500 dark:text-[#8A8A8A] font-semibold">
                Feedback & Ratings
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight mt-1">
              Tenant & Property Reviews
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#A3A3A3] mt-0.5">
              Read tenant experiences, reply publicly to reviews, and manage your property reputation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentView('lister-dashboard')}
              className="px-4 py-2.5 bg-white dark:bg-[#151515] border border-neutral-200 dark:border-[#292929] hover:border-black dark:hover:border-[#555555] text-neutral-800 dark:text-[#F5F5F5] font-bold rounded-xl text-xs transition-all shadow-2xs cursor-pointer"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Graceful Not Found Banner */}
        {notFoundMessage && (
          <div
            id="review-not-found-alert"
            className="p-4 bg-neutral-50 dark:bg-[#151515] border border-neutral-200 dark:border-[#292929] text-neutral-900 dark:text-[#F5F5F5] rounded-2xl flex items-center justify-between gap-3 text-xs animate-in fade-in"
          >
            <div className="flex items-center gap-2.5 font-bold">
              <AlertCircle className="w-4 h-4 text-neutral-700 dark:text-[#A3A3A3] shrink-0" />
              <span>{notFoundMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotFoundMessage(null)}
              className="text-neutral-700 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white font-bold px-2 py-1 hover:bg-neutral-100 dark:hover:bg-[#202020] rounded-lg cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-neutral-200 dark:border-[#292929] shadow-xs space-y-1">
            <span className="text-xs font-bold text-neutral-500 dark:text-[#8A8A8A] uppercase tracking-wider">
              Total Ratings
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-[#F5F5F5]">
              {totalReviewsCount}
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-[#7D7D7D]">Across your listings</p>
          </div>

          <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-neutral-200 dark:border-[#292929] shadow-xs space-y-1">
            <span className="text-xs font-bold text-neutral-500 dark:text-[#8A8A8A] uppercase tracking-wider">
              Average Rating
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-[#F5F5F5] flex items-center gap-1.5">
              <span>{avgRating}</span>
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-[#7D7D7D]">Out of 5.0 stars</p>
          </div>

          <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-neutral-200 dark:border-[#292929] shadow-xs space-y-1">
            <span className="text-xs font-bold text-neutral-500 dark:text-[#8A8A8A] uppercase tracking-wider">
              Awaiting Reply
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-[#F5F5F5]">
              {unrepliedCount}
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-[#7D7D7D]">Needs your response</p>
          </div>

          <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-neutral-200 dark:border-[#292929] shadow-xs space-y-1">
            <span className="text-xs font-bold text-neutral-500 dark:text-[#8A8A8A] uppercase tracking-wider">
              Official Replies
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {repliedCount}
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Publicly answered</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white dark:bg-[#111111] p-4 rounded-2xl border border-neutral-200 dark:border-[#292929] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 dark:text-[#7D7D7D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews by tenant name, comment, or property..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#292929] text-neutral-900 dark:text-[#F5F5F5] placeholder-neutral-400 dark:placeholder-[#7D7D7D] rounded-xl text-xs focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Property Filter Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <Building2 className="w-3.5 h-3.5 text-neutral-500 dark:text-[#8A8A8A]" />
              <select
                value={selectedPropertyFilter}
                onChange={(e) => setSelectedPropertyFilter(e.target.value)}
                className="bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#292929] rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-[#F5F5F5] focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none cursor-pointer"
              >
                <option value="all">All Managed Properties ({listerListings.length})</option>
                {listerListings.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter Tabs */}
            <div className="bg-neutral-100 dark:bg-[#181818] p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-neutral-600 dark:text-[#8A8A8A] hover:text-black dark:hover:text-white'
                }`}
              >
                All ({totalReviewsCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('unreplied')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'unreplied'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-neutral-600 dark:text-[#8A8A8A] hover:text-black dark:hover:text-white'
                }`}
              >
                Unanswered ({unrepliedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('replied')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'replied'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-neutral-600 dark:text-[#8A8A8A] hover:text-black dark:hover:text-white'
                }`}
              >
                Replied ({repliedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-white dark:bg-[#111111] p-12 rounded-3xl border border-neutral-200 dark:border-[#292929] text-center space-y-3 shadow-2xs">
              <MessageSquare className="w-12 h-12 text-neutral-300 dark:text-[#7D7D7D] mx-auto" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-[#F5F5F5]">
                No reviews found
              </h3>
              <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] max-w-sm mx-auto">
                {searchQuery || selectedPropertyFilter !== 'all' || statusFilter !== 'all'
                  ? 'No reviews match your current search and filter criteria. Try adjusting filters.'
                  : 'Your managed properties have not received tenant reviews yet. Reviews will appear here once submitted.'}
              </p>
            </div>
          ) : (
            filteredReviews.map((rev) => {
              const prop = listerListings.find((p) => p.id === rev.propertyId);
              const isReplying = replyingReviewId === rev.id;
              const isEditing = editingReplyId === rev.id;
              const isDeleting = deleteConfirmId === rev.id;
              const isReporting = reportingReviewId === rev.id;
              const isHighlighted = highlightedReviewId === rev.id;

              return (
                <div
                  key={rev.id}
                  id={`review-${rev.id}`}
                  className={`p-5 sm:p-6 rounded-2xl border space-y-4 transition-all duration-500 ${
                    isHighlighted
                      ? 'border-black dark:border-white ring-2 ring-black dark:ring-white bg-neutral-50/90 dark:bg-[#151515] shadow-md scale-[1.008]'
                      : 'border-neutral-200 dark:border-[#292929] bg-white dark:bg-[#111111] shadow-xs'
                  }`}
                >
                  {/* Highlight Badge when navigated from notification */}
                  {isHighlighted && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold rounded-lg mb-1 animate-pulse">
                      <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span>Review from Notification</span>
                    </div>
                  )}

                  {/* Review Top Header: Property Name + Rating */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-[#262626]">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPropertyId(rev.propertyId);
                          setCurrentView('property-detail');
                        }}
                        className="text-xs font-extrabold text-neutral-950 dark:text-[#F5F5F5] hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5 text-black dark:text-white" />
                        <span>{prop?.name || 'Property'}</span>
                      </button>
                      <span className="text-[10px] bg-neutral-100 dark:bg-[#181818] font-semibold px-2 py-0.5 rounded text-neutral-600 dark:text-[#A3A3A3]">
                        {prop?.location.estate || ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-[#181818] px-2.5 py-1 rounded-lg">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((starIndex) => (
                            <Star
                              key={starIndex}
                              className={`w-3.5 h-3.5 ${
                                starIndex <= rev.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-neutral-300 dark:text-[#444444]'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-neutral-900 dark:text-[#F5F5F5] ml-0.5">{rev.rating}.0</span>
                      </div>
                      <span className="text-xs text-neutral-400 dark:text-[#7D7D7D]">•</span>
                      <span className="text-xs text-neutral-500 dark:text-[#8A8A8A] font-medium">{rev.date}</span>
                    </div>
                  </div>

                  {/* Seeker Review Details */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      {rev.authorAvatar ? (
                        <img
                          src={rev.authorAvatar}
                          alt={rev.authorName}
                          className="w-9 h-9 rounded-full object-cover border border-neutral-200 dark:border-[#292929]"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-[#1E1E1E] text-neutral-800 dark:text-[#E0E0E0] flex items-center justify-center font-bold text-xs">
                          {rev.authorName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-neutral-950 dark:text-[#F5F5F5]">{rev.authorName}</h4>
                        <span className="text-[11px] text-neutral-400 dark:text-[#7D7D7D]">Resident / Seeker</span>
                      </div>
                    </div>

                    {rev.comment && rev.comment.trim() && (
                      <p className="text-xs sm:text-sm text-neutral-700 dark:text-[#D4D4D4] leading-relaxed">
                        "{rev.comment}"
                      </p>
                    )}

                    {rev.wouldRecommend === true && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-[#F5F5F5]">
                        <ThumbsUp className="w-3.5 h-3.5 text-black dark:text-white" />
                        <span>Recommends this property to future tenants</span>
                      </div>
                    )}
                    {rev.wouldRecommend === false && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-[#8A8A8A]">
                        <span>Does not recommend this property</span>
                      </div>
                    )}

                    {rev.reported && (
                      <div className="inline-flex items-center gap-1 text-[11px] text-neutral-800 dark:text-[#D4D4D4] bg-neutral-100 dark:bg-[#1E1E1E] px-2.5 py-1 rounded-md border border-neutral-300 dark:border-[#333333] font-semibold">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                        <span>Under Administrative Moderation Review</span>
                      </div>
                    )}
                  </div>

                  {/* Public Lister Reply (if posted) */}
                  {rev.reply && !isEditing && (
                    <div
                      id={`lister-response-${rev.id}`}
                      className="mt-3 ml-2 sm:ml-6 pl-4 border-l-2 border-black dark:border-white bg-neutral-50 dark:bg-[#181818] p-4 rounded-r-2xl space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {rev.reply.listerAvatar ? (
                            <img
                              src={rev.reply.listerAvatar}
                              alt={rev.reply.listerName}
                              className="w-7 h-7 rounded-full object-cover border border-neutral-300 dark:border-[#333333]"
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

                      <p className="text-xs sm:text-sm text-neutral-800 dark:text-[#D4D4D4] leading-relaxed italic">
                        "{rev.reply.replyText}"
                      </p>
                    </div>
                  )}

                  {/* Reply Form (Create or Edit) */}
                  {(isReplying || isEditing) && (
                    <div className="mt-3 ml-2 sm:ml-6 p-4 bg-neutral-50 dark:bg-[#151515] rounded-2xl border border-neutral-200 dark:border-[#292929] space-y-3 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-[#F5F5F5]">
                        <CornerDownRight className="w-3.5 h-3.5 text-black dark:text-white" />
                        <span>
                          {isEditing ? 'Edit Your Official Response' : `Reply to ${rev.authorName}`}
                        </span>
                      </div>

                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a response to this review..."
                        className="w-full p-3 bg-white dark:bg-[#1A1A1A] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] placeholder-neutral-400 dark:placeholder-[#7D7D7D] rounded-xl text-xs focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none leading-relaxed"
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
                          className="px-4 py-1.5 text-xs font-bold bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                        >
                          {isEditing ? 'Save Changes' : 'Post Reply'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Delete Confirmation Prompt */}
                  {isDeleting && (
                    <div className="mt-3 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs space-y-2 animate-in fade-in">
                      <div className="flex items-center gap-2 text-red-800 dark:text-red-300 font-bold">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span>Delete your official response?</span>
                      </div>
                      <p className="text-[11px] text-red-700 dark:text-red-300">
                        This will remove your reply. The tenant's original review will remain untouched.
                      </p>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReply(rev.id)}
                          className="px-3.5 py-1 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Report Review Modal / Prompt */}
                  {isReporting && (
                    <div className="mt-3 p-3.5 bg-neutral-50 dark:bg-[#151515] border border-neutral-200 dark:border-[#292929] rounded-xl text-xs space-y-2 animate-in fade-in">
                      <span className="font-bold text-neutral-900 dark:text-[#F5F5F5] block">Report Review for Admin Moderation</span>
                      <input
                        type="text"
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="Reason (e.g. false tenant claim, spam, abusive language)..."
                        className="w-full p-2 bg-white dark:bg-[#1A1A1A] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] placeholder-neutral-400 dark:placeholder-[#7D7D7D] rounded-lg text-xs focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
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

                  {/* Lister Action Controls (Requirements 2, 5, 10) */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-[#262626] text-xs">
                    <div className="flex items-center gap-2">
                      {!rev.reply ? (
                        /* If no reply yet: "Reply" button */
                        !isReplying && (
                          <button
                            type="button"
                            id={`lister-reply-btn-${rev.id}`}
                            onClick={() => handleStartReply(rev)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer shadow-xs"
                          >
                            <Reply className="w-3.5 h-3.5" />
                            <span>Reply</span>
                          </button>
                        )
                      ) : (
                        /* If reply exists: "Edit Reply" and "Delete Reply" buttons */
                        !isEditing &&
                        !isDeleting && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              id={`lister-edit-reply-btn-${rev.id}`}
                              onClick={() => handleStartEdit(rev)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-[#1E1E1E] hover:bg-neutral-200 dark:hover:bg-[#2A2A2A] text-neutral-800 dark:text-[#E0E0E0] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit Reply</span>
                            </button>
                            <button
                              type="button"
                              id={`lister-delete-reply-btn-${rev.id}`}
                              onClick={() => setDeleteConfirmId(rev.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-[#1E1E1E] hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-700 dark:text-[#A3A3A3] hover:text-red-700 dark:hover:text-red-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete Reply</span>
                            </button>
                          </div>
                        )
                      )}
                    </div>

                    {/* Report Review for Moderation */}
                    {!isReporting && (
                      <button
                        type="button"
                        onClick={() => setReportingReviewId(rev.id)}
                        className="text-[11px] text-neutral-400 dark:text-[#7D7D7D] hover:text-neutral-700 dark:hover:text-neutral-300 font-semibold cursor-pointer"
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
      </div>
    </div>
  );
};
