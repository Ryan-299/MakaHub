import { useConvexAuth } from 'convex/react';
import { formatRelativeTime } from '../utils/formatTime';
import React, { useState, useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  ArrowLeft,
  MessageSquare,
  Phone,
  MoreVertical,
  Flag,
  Mail,
  MailCheck,
  Clock,
  CheckCircle2,
  Send,
  Building,
  ShieldCheck,
  Lock,
  ExternalLink,
  ChevronRight,
  User,
  Sparkles,
  Info,
  Sun,
  Moon,
  Megaphone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ListerEnquiry } from '../types';

export const SeekerEnquiriesView: React.FC = () => {
  const {
    seekerEnquiries = [],
    listerEnquiries = [],
    switchUserMode,
    setCurrentView,
    setSelectedListerId,
    setSelectedPropertyId,
    setTargetReviewId,
    properties = [],
    reviews = [],
    notifications = [],
    markNotificationRead,
    currentUser,
    resolvedTheme,
    toggleTheme,
    sendEnquiryReply,
    markEnquiryAsRead,
    targetEnquiryId,
    setTargetEnquiryId,
    messageTab,
    setMessageTab,
    targetMessageId,
    setTargetMessageId,

  } = useApp();
  const isDark = resolvedTheme === 'dark';
  const [chatMenuOpen, setChatMenuOpen] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reasonMenuOpen, setReasonMenuOpen] = useState(false);

  const reportReasons = [
    "Inappropriate or offensive messages",
    "Fraud or scam",
    "Spam or unsolicited messages",
    "Harassment or threats",
    "Other",
  ];
  const submitConversationReport = useMutation(
    api.conversationReports.submit
  );

  const {
    isAuthenticated: convexAuthed,
    isLoading: convexAuthLoading,
  } = useConvexAuth();

  // Selected enquiry id
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(() => {
    if (targetEnquiryId && seekerEnquiries.some((e) => e.id === targetEnquiryId)) {
      return targetEnquiryId;
    }
    return null;
  });
  useEffect(() => {
    const isChatOpen = selectedEnquiryId !== null && messageTab === 'inbox';

    document.body.classList.toggle('rentike-seeker-chat-open', isChatOpen);

    return () => {
      document.body.classList.remove('rentike-seeker-chat-open');
    };
  }, [selectedEnquiryId, messageTab]);


  const activityNotifications = notifications.filter(
    (notification) =>
      notification.type === 'review' &&
      notification.title === 'New Review Reply'
  );
  const unreadInboxCount = seekerEnquiries.filter(
    (enq) => !enq.readBySeeker
  ).length;
  const systemNotifications = notifications.filter(
    (notification) =>
      ['system', 'announcement'].includes(notification.type) &&
      !['Listing Submitted', 'Listing Resubmitted', 'BnB Submitted'].includes(notification.title)
  );

  const unreadSystemCount = systemNotifications.filter(
    (notification) => !notification.read
  ).length;

  const unreadActivityCount = activityNotifications.filter(
    (notification) => !notification.read
  ).length;
  const unreadListerChats =
    listerEnquiries.filter((enq) => !enq.readByLister).length +
    notifications.filter(
      (n) =>
        (n.recipientUserId || n.userId) === currentUser?.id &&
        !n.read &&
        (n.type === 'activity' ||
          (n.type === 'review' &&
            ['Property Saved', 'New Property Rating', 'New Property Comment'].includes(n.title)) ||
          (['approval', 'rejection', 'flag'].includes(n.type) ||
            (n.type === 'system' &&
              ['Listing Submitted', 'Listing Resubmitted', 'BnB Submitted'].includes(n.title))))
    ).length;
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // Sync if targetEnquiryId changes externally
  useEffect(() => {
    if (
      targetEnquiryId &&
      seekerEnquiries.some((e) => e.id === targetEnquiryId)
    ) {
      setSelectedEnquiryId(targetEnquiryId);
    }
  }, [targetEnquiryId, seekerEnquiries]);
  const sortedEnquiries = [...seekerEnquiries].sort((a, b) => {



    const aLastTime =
      a.messages?.[a.messages.length - 1]?.createdAt ||
      a.createdAt ||
      a.date;

    const bLastTime =
      b.messages?.[b.messages.length - 1]?.createdAt ||
      b.createdAt ||
      b.date;

    const aTime = Date.parse(aLastTime || '') || 0;
    const bTime = Date.parse(bLastTime || '') || 0;

    return bTime - aTime;
  });
  // Find active enquiry
  const activeEnquiry =
    seekerEnquiries.find((e) => e.id === selectedEnquiryId) || null;

  // Mark as read when active enquiry changes
  useEffect(() => {
    if (activeEnquiry) {
      markEnquiryAsRead(activeEnquiry.id);
    }
  }, [activeEnquiry?.id]);

  // Format messages list
  const conversationMessages = activeEnquiry
    ? (activeEnquiry.messages && activeEnquiry.messages.length > 0)
      ? activeEnquiry.messages
      : [
        {
          id: `init-${activeEnquiry.id}`,
          enquiryId: activeEnquiry.id,
          senderId: activeEnquiry.seekerId,
          senderName: activeEnquiry.seekerName,
          senderRole: 'seeker' as const,
          senderAvatar: activeEnquiry.seekerAvatar,
          message: activeEnquiry.message,
          createdAt: activeEnquiry.date || 'Recently'
        }
      ]
    : [];

  // Scroll to targetMessageId or bottom/latest message of the conversation
  useEffect(() => {
    if (!activeEnquiry || conversationMessages.length === 0) return;

    const timeout = setTimeout(() => {
      if (targetMessageId) {
        const targetElement = document.getElementById(`message-${targetMessageId}`);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          setHighlightedMessageId(targetMessageId);
          const highlightTimer = setTimeout(() => {
            setHighlightedMessageId(null);
            setTargetMessageId(null);
          }, 3000);
          return () => clearTimeout(highlightTimer);
        } else {
          // If specific target element not found in DOM, scroll to latest message
          const lastMsg = conversationMessages[conversationMessages.length - 1];
          if (lastMsg) {
            const lastEl = document.getElementById(`message-${lastMsg.id}`);
            if (lastEl) {
              lastEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      } else {
        // Default / Fallback: Scroll to latest message (never to top)
        const lastMsg = conversationMessages[conversationMessages.length - 1];
        if (lastMsg) {
          const lastEl = document.getElementById(`message-${lastMsg.id}`);
          if (lastEl) {
            lastEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    }, 120);

    return () => clearTimeout(timeout);
  }, [activeEnquiry?.id, targetMessageId, conversationMessages.length]);

  // Related property
  const relatedProperty = activeEnquiry
    ? properties.find((p) => p.id === activeEnquiry.propertyId)
    : null;


  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !activeEnquiry || isSending) return;

    const textToSend = replyText;
    setIsSending(true);
    setReplyText('');

    try {
      await sendEnquiryReply(activeEnquiry.id, textToSend);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Failed to send message:', error);
      setReplyText(textToSend);
      window.alert('Your message could not be sent. Please try again.');
    } finally {
      setIsSending(false);
    }
  };


  const handleQuickReply = (text: string) => {
    if (!activeEnquiry) return;
    sendEnquiryReply(activeEnquiry.id, text);
  };

  const quickReplies = [
    'Thank you! I will come for viewing tomorrow.',
    'Could you please share the caretaker’s phone number?',
    'Is water supply 24/7 or rationed during the week?',
    'What is the deposit requirement for moving in?'
  ];

  return (
    <div
      id="seeker-enquiries-view"
      className={`${activeEnquiry
        ? 'fixed inset-0 z-[10000] overflow-y-auto bg-[#FBF8F3] dark:bg-black md:static md:z-auto md:h-[calc(100dvh-6rem)] md:min-h-0 md:overflow-hidden md:pb-0'
        : 'min-h-[calc(100vh-4rem)] bg-[#FBF8F3] dark:bg-black pb-24'
        } text-neutral-900 dark:text-[#F5F5F5] font-sans transition-colors duration-200`}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${activeEnquiry
          ? 'h-full pt-6 sm:pt-8 flex flex-col gap-4 md:h-full md:flex md:flex-col md:min-h-0 md:space-y-0'
          : 'pt-6 sm:pt-8 space-y-6'
          }`}
      >
        {activeEnquiry && (
          <div className="relative flex items-center gap-3 pb-4 border-b border-neutral-200 dark:border-[#2A2A2A]">
            <button
              type="button"
              onClick={() => {
                setSelectedEnquiryId(null);
                setTargetEnquiryId(null);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] shrink-0"
              aria-label="Back to messages"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {relatedProperty?.lister?.avatar ? (
              <img
                src={relatedProperty.lister.avatar}
                alt={relatedProperty.lister.name}
                className="w-11 h-11 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold shrink-0">
                {relatedProperty?.lister?.name?.charAt(0) || 'L'}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-neutral-950 dark:text-white truncate">
                {relatedProperty?.lister?.name || 'Property Lister'}
              </p>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {activeEnquiry.propertyName}
                {relatedProperty?.type && ` · ${relatedProperty.type}`}
                {relatedProperty?.location?.estate &&
                  ` · ${relatedProperty.location.estate}`}
                {relatedProperty?.location?.subCounty &&
                  `, ${relatedProperty.location.subCounty}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (relatedProperty?.lister?.phone) {
                  window.location.href = `tel:${relatedProperty.lister.phone}`;
                }
              }}
              disabled={!relatedProperty?.lister?.phone}
              className="w-10 h-10 rounded-full bg-[#F5EBDD] dark:bg-[#2A2118] text-[#8A5A2B] dark:text-[#C49A6C] flex items-center justify-center shrink-0 disabled:opacity-40"
              aria-label="Call lister"
            >
              <Phone className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setChatMenuOpen(!chatMenuOpen)}
              aria-label="More chat options"
              aria-expanded={chatMenuOpen}
              className="w-10 h-10 rounded-full bg-[#F5EBDD] dark:bg-[#2A2118] text-[#8A5A2B] dark:text-[#C49A6C] flex items-center justify-center shrink-0"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {chatMenuOpen && (
              <div className="absolute right-4 top-full mt-2 z-50 w-44 rounded-xl border border-[#E2D3C2] dark:border-[#38312A] bg-white dark:bg-[#1A1A1A] shadow-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    if (!relatedProperty?.lister?.id) return;
                    setSelectedListerId(relatedProperty.lister.id);
                    setTargetEnquiryId(activeEnquiry.id);
                    setChatMenuOpen(false);
                    setCurrentView('public-lister-profile');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-800 dark:text-white hover:bg-[#F8F3EB] dark:hover:bg-[#292929]"
                >
                  <User className="w-4 h-4" />
                  View Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setChatMenuOpen(false);
                    setReportModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-[#292929]"
                >
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>
            )}

          </div>
        )}

        {/* Empty State */}


        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans ${activeEnquiry ? 'flex-1 min-h-0 items-stretch md:items-stretch' : 'items-start'
            }`}
        >
          {/* Left Sidebar: Enquiries List */}
          <div
            className={`space-y-3 ${activeEnquiry
              ? 'hidden'
              : 'block lg:col-span-12'
              }`}
          >
            {/* Messages Tabs */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">

                <div>
                  <h1 className="text-2xl font-bold text-neutral-950 dark:text-white">
                    Messages
                  </h1>

                </div>



                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="ml-auto shrink-0 flex items-center rounded-full border border-[#E2D3C2] dark:border-neutral-700 bg-[#F7F3EC] dark:bg-[#181818] p-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${!isDark
                      ? 'bg-white text-neutral-600 shadow-sm'
                      : 'text-neutral-500'
                      }`}
                  >
                    <Sun className="w-4 h-4" />
                  </span>

                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark
                      ? 'bg-[#C49A6C] text-white shadow-sm'
                      : 'text-[#B8792B]'
                      }`}
                  >
                    <Moon className="w-4 h-4" />
                  </span>
                </button>




              </div>

              <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-[#F1EBE3] dark:bg-[#151515] border border-[#E7DDD1] dark:border-[#202020] shadow-[inset_3px_3px_7px_rgba(165,140,115,0.18),inset_-3px_-3px_7px_rgba(255,255,255,0.9)] dark:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.65),inset_-3px_-3px_7px_rgba(255,255,255,0.035)]">
                <button
                  type="button"
                  onClick={() => setMessageTab('inbox')}
                  className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${messageTab === 'inbox'
                    ? 'text-[var(--rentike-bronze)] bg-[#F8F3EB] dark:bg-[#1B1B1B] shadow-[4px_4px_8px_rgba(174,150,125,0.22),-3px_-3px_7px_rgba(255,255,255,0.95)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.65),-3px_-3px_7px_rgba(255,255,255,0.045)]'
                    : 'text-neutral-600 dark:text-neutral-300'
                    }`}
                >
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <span>Inbox</span>

                    {unreadInboxCount > 0 && (
                      <span className="min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {unreadInboxCount}
                      </span>
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMessageTab('activity')}
                  className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${messageTab === 'activity'
                    ? 'text-[var(--rentike-bronze)] bg-[#F8F3EB] dark:bg-[#1B1B1B] shadow-[4px_4px_8px_rgba(174,150,125,0.22),-3px_-3px_7px_rgba(255,255,255,0.95)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.65),-3px_-3px_7px_rgba(255,255,255,0.045)]'
                    : 'text-neutral-600 dark:text-neutral-300'
                    }`}
                >
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <span>Activity</span>

                    {unreadActivityCount > 0 && (
                      <span className="min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {unreadActivityCount}
                      </span>
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMessageTab('system')}
                  className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${messageTab === 'system'
                    ? 'text-[var(--rentike-bronze)] bg-[#F8F3EB] dark:bg-[#181818] shadow-[4px_4px_10px_rgba(0,0,0,0.10)]'
                    : 'text-neutral-600 dark:text-neutral-300'
                    }`}
                >
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <span>System</span>

                    {unreadSystemCount > 0 && (
                      <span className="min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {unreadSystemCount}
                      </span>
                    )}
                  </span>
                </button>
              </div>
            </div>
            {/* Unread messages in Lister inbox */}
            {unreadListerChats > 0 && (
              <button
                type="button"
                onClick={() => {
                  switchUserMode('lister');
                  setMessageTab('inbox');
                  setCurrentView('lister-enquiries');
                }}
                className="w-full flex items-center justify-between gap-3 rounded-2xl border border-[#E2D3C2] dark:border-[#3A3027] bg-[#FBF6EF] dark:bg-[#1E1A16] px-4 py-3 text-left"
              >
                <span className="text-xs text-neutral-700 dark:text-neutral-300">
                  You have <strong>{unreadListerChats}</strong> new{' '}
                  {unreadListerChats === 1 ? 'update' : 'updates'} in Lister view.
                </span>
                <span className="shrink-0 text-xs font-semibold text-[#A77745] dark:text-[#CCA177]">
                  Switch to view →
                </span>
              </button>
            )}
            {messageTab === 'activity' && (
              <div className="divide-y divide-neutral-200/70 dark:divide-[#292929]">

                <div className="flex items-center justify-between px-1 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-[#7D7D7D]">
                    Property Activity
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      activityNotifications
                        .filter((notification) => !notification.read)
                        .forEach((notification) =>
                          markNotificationRead(notification.id)
                        );
                    }}
                    disabled={!activityNotifications.some((notification) => !notification.read)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A77745] dark:text-[#CCA177] hover:underline disabled:opacity-40 disabled:cursor-default disabled:no-underline"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                </div>

                {[...activityNotifications]
                  .sort((a, b) => {
                    const aTime = new Date(a.createdAt || a.time).getTime();
                    const bTime = new Date(b.createdAt || b.time).getTime();
                    return bTime - aTime;
                  })
                  .map((notification) => {
                    const relatedReview = reviews.find(
                      (review) => review.id === notification.targetReviewId
                    );

                    const listerAvatar = relatedReview?.reply?.listerAvatar;

                    return (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => {
                          markNotificationRead(notification.id);

                          if (
                            notification.targetPropertyId &&
                            notification.targetReviewId
                          ) {
                            setSelectedPropertyId(notification.targetPropertyId);
                            setTargetReviewId(notification.targetReviewId);
                            setCurrentView('property-detail');
                          }
                        }}
                        className={`w-full flex items-start gap-3 py-4 text-left transition-colors ${!notification.read
                          ? 'bg-[#FBF6EF] dark:bg-[#15120F]'
                          : 'bg-transparent'
                          }`}
                      >
                        <div className="relative shrink-0">
                          {listerAvatar ? (
                            <img
                              src={listerAvatar}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#F5EBDD] dark:bg-[#221E1A] flex items-center justify-center text-[#8A5A2B] font-bold">
                              {relatedReview?.reply?.listerName?.charAt(0) || 'L'}
                            </div>
                          )}

                          {!notification.read && (
                            <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-[#8A5A2B] border-2 border-[#F8F3EB] dark:border-black" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">

                            <div className="flex min-w-0 items-start gap-2">
                              <p
                                className={`min-w-0 text-sm leading-snug ${!notification.read
                                  ? 'font-semibold text-neutral-950 dark:text-white'
                                  : 'font-normal text-neutral-500 dark:text-neutral-400'
                                  }`}
                              >
                                {notification.message}
                              </p>

                              {!notification.read && (
                                <span
                                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#C49A6C]"
                                  aria-label="Unread activity"
                                />
                              )}
                            </div>


                            <span className="text-[10px] text-neutral-400 whitespace-nowrap pt-0.5">
                              {formatRelativeTime(
                                notification.createdAt || notification.time
                              )}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#8A5A2B] dark:text-[#C49A6C] mt-1.5">
                            View comment
                          </p>
                        </div>

                        <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0 mt-3" />
                      </button>
                    );
                  })}

                {activityNotifications.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      No activity yet
                    </p>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Replies to your property comments will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}

            {messageTab === 'system' && (
              <div className="divide-y divide-neutral-200/70 dark:divide-[#292929]">

                <div className="flex items-center justify-between px-1 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-[#7D7D7D]">
                    System Updates
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      systemNotifications
                        .filter((notification) => !notification.read)
                        .forEach((notification) =>
                          markNotificationRead(notification.id)
                        );
                    }}
                    disabled={!systemNotifications.some((notification) => !notification.read)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A77745] dark:text-[#CCA177] hover:underline disabled:opacity-40 disabled:cursor-default disabled:no-underline"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                </div>

                {[...systemNotifications]
                  .sort((a, b) => {
                    const aTime = new Date(a.createdAt || a.time).getTime();
                    const bTime = new Date(b.createdAt || b.time).getTime();
                    return bTime - aTime;
                  })
                  .map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => markNotificationRead(notification.id)}
                      className={`w-full px-2 py-4 text-left transition-colors ${!notification.read
                        ? 'bg-[#FBF6EF] dark:bg-[#15120F]'
                        : 'bg-transparent'
                        }`}
                    >
                      <div className="flex items-start gap-3">

                        <div
                          className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.title?.trim().toLowerCase() === 'phone number updated'
                            ? 'bg-[#E5F2EF] dark:bg-[#173A36]'
                            : 'bg-[#F5EBDD] dark:bg-[#221E1A]'
                            }`}
                        >

                          {notification.type === 'announcement' ? (
                            <Megaphone className="h-5 w-5 text-[#A77745] dark:text-[#CCA177]" />
                          ) : notification.title?.trim().toLowerCase() === 'phone number updated' ? (
                            <Phone className="h-5 w-5 text-[#438D80]" />
                          ) : notification.title?.trim().toLowerCase() === 'contact email updated' ? (
                            <MailCheck className="h-5 w-5 text-[#B8792B]" />
                          ) : notification.title?.trim().toLowerCase() === 'password changed' ? (
                            <Lock className="h-5 w-5 text-[#B8792B]" />
                          ) : (
                            <span className="text-lg">🏠</span>
                          )}

                          {!notification.read && (
                            <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-red-600 border-2 border-[#F8F3EB] dark:border-black" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm ${!notification.read
                                ? 'font-bold text-neutral-950 dark:text-white'
                                : 'font-semibold text-neutral-700 dark:text-neutral-300'
                                }`}
                            >
                              {notification.title}
                            </p>

                            <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                              {formatRelativeTime(
                                notification.createdAt || notification.time
                              )}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                            {(notification.title === 'Phone Number Updated' ||
                              notification.title === 'Password Changed') &&
                              notification.message.includes('Rentike support') ? (
                              <>
                                {notification.message.split('Rentike support')[0]}
                                <span
                                  className="cursor-pointer font-semibold text-[#B8792B] underline underline-offset-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = 'mailto:support@rentike.co.ke';
                                  }}
                                >
                                  Rentike support
                                </span>
                                {notification.message.split('Rentike support')[1]}
                              </>
                            ) : (
                              notification.message
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}

                {systemNotifications.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      No system notifications
                    </p>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Rentike updates and important notices will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}
            <div
              className={`${messageTab === 'inbox' ? 'flex' : 'hidden'
                } items-center justify-between px-1`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-[#7D7D7D]">
                All Conversations ({seekerEnquiries.length})
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-[#8A8A8A] font-medium">Click to open thread</span>
            </div>

            <div
              className={`${messageTab === 'inbox' ? 'block' : 'hidden'
                } space-y-2.5 max-h-[calc(100vh-14rem)] overflow-y-auto no-scrollbar pr-0.5`}
            >
              {seekerEnquiries.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-14 px-6">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-[#181818] flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
                  </div>

                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                    No enquiries sent yet
                  </h3>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 max-w-[260px] leading-relaxed">
                    When you find a home you like, contact the lister and your conversations will appear here.
                  </p>

                  <button
                    type="button"
                    onClick={() => setCurrentView('tenant-home')}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold flex items-center gap-2"
                  >
                    <Building className="w-4 h-4" />
                    Discover Vacant Homes
                  </button>
                </div>
              )}

              {messageTab === 'inbox' && seekerEnquiries.length > 0 && (
                <div className="flex items-center justify-between px-1 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-[#7D7D7D]">
                    Your Conversations
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      seekerEnquiries
                        .filter((enq) => !enq.readBySeeker)
                        .forEach((enq) => markEnquiryAsRead(enq.id));
                    }}
                    disabled={!seekerEnquiries.some((enq) => !enq.readBySeeker)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A77745] dark:text-[#CCA177] hover:underline disabled:opacity-40 disabled:cursor-default disabled:no-underline"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                </div>
              )}

              {seekerEnquiries.length > 0 && sortedEnquiries.map((enq) => {
                const prop = properties.find((p) => p.id === enq.propertyId);

                const lastMsg =
                  enq.messages && enq.messages.length > 0
                    ? enq.messages[enq.messages.length - 1]
                    : null;

                const listerMessage = [...(enq.messages || [])]
                  .reverse()
                  .find((msg) => msg.senderRole === 'lister');

                const listerName =
                  prop?.lister?.name ||
                  listerMessage?.senderName ||
                  'Property Lister';

                const listerAvatar =
                  prop?.lister?.avatar ||
                  listerMessage?.senderAvatar;

                const lastMessageTime =
                  lastMsg?.createdAt ||
                  enq.createdAt ||
                  enq.date;

                const isUnread = !enq.readBySeeker;

                return (
                  <button
                    key={enq.id}
                    id={`enquiry-card-${enq.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedEnquiryId(enq.id);
                      setTargetEnquiryId(null);
                    }}

                    className={`w-full flex items-center gap-3 px-2 py-4 text-left border-b border-neutral-200/70 dark:border-[#292929] transition-colors ${isUnread
                      ? 'bg-[#F8F1E8] dark:bg-[#252019] hover:bg-[#F3E8D9] dark:hover:bg-[#30271E]'
                      : 'bg-transparent hover:bg-[#F8F5EF] dark:hover:bg-[#181818]'
                      }`}

                  >
                    {/* Lister Avatar */}
                    <div className="relative shrink-0">
                      {listerAvatar ? (
                        <img
                          src={listerAvatar}
                          alt={listerName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#F5EBDD] dark:bg-[#24201B] text-[#8A5A2B] dark:text-[#C49A6C] flex items-center justify-center font-bold">
                          {listerName.charAt(0)}
                        </div>
                      )}



                    </div>


                    {/* Conversation Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">

                        <div className="flex min-w-0 items-center gap-2">
                          <p className={`truncate text-sm ${isUnread
                            ? 'font-bold text-neutral-950 dark:text-white'
                            : 'font-medium text-neutral-600 dark:text-neutral-400'
                            }`}>
                            {listerName}
                          </p>

                          {isUnread && (
                            <span
                              className="h-2 w-2 shrink-0 rounded-full bg-[#C49A6C]"
                              aria-label="Unread enquiry"
                            />
                          )}
                        </div>


                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 shrink-0">
                          {formatRelativeTime(lastMessageTime)}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        {enq.propertyName}
                        {prop?.type && ` · ${prop.type}`}
                      </p>

                      <p
                        className={`text-xs truncate mt-1 ${!enq.readBySeeker
                          ? 'font-semibold text-neutral-900 dark:text-white'
                          : 'text-neutral-500 dark:text-neutral-400'
                          }`}
                      >
                        {lastMsg ? (
                          <>
                            {(lastMsg.senderId
                              ? lastMsg.senderId === currentUser?.id
                              : lastMsg.senderRole === 'seeker') ? 'You: ' : ''}
                            {lastMsg.message}
                          </>
                        ) : (
                          enq.message
                        )}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Main Column: Active Thread & Quick Reply */}
          {activeEnquiry && (
            <div className="lg:col-span-12 flex flex-1 min-h-0 flex-col gap-4 md:flex md:flex-col md:space-y-0 md:gap-4">

              {/* Compact Property Reference Card */}
              <div className="bg-white dark:bg-[#111111] rounded-2xl border border-neutral-200 dark:border-[#292929] p-3">
                <div className="flex items-center gap-3">

                  {relatedProperty?.images?.[0] && (
                    <img
                      src={relatedProperty.images[0]}
                      alt={activeEnquiry.propertyName}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold text-neutral-950 dark:text-white truncate">
                      {activeEnquiry.propertyName}
                    </h2>

                    {relatedProperty && (
                      <p className="text-sm font-semibold text-[#9A6A35] dark:text-[#C49A6C] mt-0.5">
                        {relatedProperty.type === 'BnB' && relatedProperty.bnb
                          ? `KSh ${relatedProperty.bnb.pricePerNight.toLocaleString()} / night`
                          : `KSh ${relatedProperty.monthlyRent.toLocaleString()} / month`}
                      </p>
                    )}

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                      {relatedProperty?.type}
                      {relatedProperty?.location?.estate &&
                        ` · ${relatedProperty.location.estate}`}
                      {relatedProperty?.location?.subCounty &&
                        `, ${relatedProperty.location.subCounty}`}
                    </p>
                  </div>

                  <div className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#F5EBDD] dark:bg-[#2A2118] px-2.5 py-2 text-[10px] font-semibold text-[#8A5A2B] dark:text-[#C49A6C]">
                    <span>🔒</span>
                    <span>Private enquiry</span>
                  </div>

                </div>

                <div className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-[#FBF6EF] dark:bg-[#201A14] px-3 py-2 text-center text-[11px] text-[#8A5A2B] dark:text-[#C49A6C]">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  <span>Stay safe: Confirm the property exists before paying.</span>
                </div>

              </div>

              {/* Conversation Stream Container */}
              <div className="bg-transparent dark:bg-[#111111] flex flex-1 min-h-0 flex-col overflow-hidden md:flex md:flex-col md:flex-1">
                {/* Messages Feed */}
                <div className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto bg-neutral-50/50 dark:bg-[#0D0D0D]">
                  {conversationMessages.map((msg, index) => {
                    const isSeeker = msg.senderId
                      ? msg.senderId === currentUser?.id
                      : msg.senderRole === 'seeker';
                    const isHighlighted = highlightedMessageId === msg.id;
                    return (
                      <div
                        key={`${msg.id || 'message'}-${index}`}
                        id={`message-${msg.id || 'message'}-${index}`}
                        className={`flex gap-3 items-end ${isSeeker ? 'justify-end' : 'justify-start'} transition-all duration-300 ${isHighlighted ? 'scale-[1.01]' : ''
                          }`}
                      >
                        {/* Lister Avatar (Left) */}
                        {!isSeeker && (
                          <img
                            src={
                              msg.senderAvatar ||
                              relatedProperty?.lister?.avatar ||
                              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
                            }
                            alt={msg.senderName}
                            className="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-[#303030] shrink-0 mb-1"
                          />
                        )}

                        {/* Message Bubble */}
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-2xs space-y-1.5 transition-all duration-300 ${isSeeker
                            ? 'bg-[#F3E8DC] dark:bg-[#F5F5F5] text-neutral-900 dark:text-[#111111] rounded-br-md border border-[#EADCCB] dark:border-transparent'
                            : 'bg-white dark:bg-[#181818] text-neutral-900 dark:text-[#F5F5F5] border border-neutral-200 dark:border-[#303030] rounded-bl-xs'
                            } ${isHighlighted
                              ? isSeeker
                                ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-white dark:ring-offset-black shadow-md'
                                : 'ring-2 ring-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 ring-offset-2 ring-offset-white dark:ring-offset-black shadow-md'
                              : ''
                            }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px]">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-bold ${isSeeker
                                  ? 'text-neutral-600 dark:text-neutral-600'
                                  : 'text-neutral-900 dark:text-[#F5F5F5]'
                                  }`}
                              >
                                {isSeeker ? 'You' : msg.senderName}
                              </span>
                              {isHighlighted && !isSeeker && (
                                <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px] tracking-wide uppercase animate-pulse">
                                  New Reply
                                </span>
                              )}
                            </div>
                            <span
                              className={`${isSeeker
                                ? 'text-neutral-400 dark:text-neutral-500'
                                : 'text-neutral-400 dark:text-[#7D7D7D]'
                                }`}
                            >
                              {formatRelativeTime(msg.createdAt)}
                            </span>
                          </div>

                          <p
                            className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${isSeeker
                              ? 'text-neutral-900 dark:text-neutral-900 font-sans'
                              : 'text-neutral-800 dark:text-[#E0E0E0] font-sans'
                              }`}
                          >
                            {msg.message}
                          </p>
                        </div>

                        {/* Seeker Avatar (Right) */}
                        {isSeeker && (
                          <>
                            {msg.senderAvatar || currentUser?.avatar ? (
                              <img
                                src={msg.senderAvatar || currentUser?.avatar}
                                alt={msg.senderName || 'Seeker'}
                                className="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-[#383838] shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold shrink-0">
                                {msg.senderName?.charAt(0) || 'S'}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>


                {/* Interactive Reply Input Form */}
                <form
                  onSubmit={handleSendReply}
                  className="p-3 bg-white dark:bg-[#111111] border-t border-neutral-200 dark:border-[#292929] shrink-0"
                >
                  <div className="flex items-end gap-2 lg:max-w-[750px] lg:mx-auto lg:w-full">
                    <textarea
                      rows={1}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply(e);
                        }
                      }}
                      placeholder="Type a message..."

                      className="flex-1 min-h-[44px] max-h-[110px] resize-none rounded-2xl border border-[#D9C5AE] bg-[#F3E8DB] px-4 py-3 text-sm font-medium text-[#242424] outline-none placeholder:text-[#806B58] focus:border-[#B88653] dark:border-[#5A4635] dark:bg-[#29231E] dark:text-[#F5F5F5] dark:placeholder:text-[#B8A596]"

                    />

                    <button
                      type="submit"
                      disabled={!replyText.trim() || isSending}

                      className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-[#C49A6C] text-[#1F1F1F] shadow-sm transition-colors hover:bg-[#B88955] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-[#C49A6C] dark:text-[#151515]"

                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

      </div>

      {reportModalOpen && activeEnquiry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            className="w-full max-w-md rounded-2xl border border-[#D8C5AF] bg-[#F8F5EF] p-6 shadow-2xl dark:border-[#38312A] dark:bg-[#1A1A1A]"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="report-title"
                className="flex items-center gap-2 text-lg font-bold"
              >
                <Flag className="h-5 w-5 text-[#C49A6C]" />
                Report Conversation
              </h2>

              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                aria-label="Close report form"
                className="text-xl text-neutral-500"
              >
                ×
              </button>
            </div>
            {!reportSubmitted ? (
              <>
                <p className="mb-5 text-sm text-neutral-500">

                  Tell us what's wrong with this conversation.

                </p>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!reportReason) return;

                    try {
                      await submitConversationReport({
                        enquiryId: activeEnquiry.id,
                        reason: reportReason,
                        details: reportDetails.trim() || undefined,
                      });


                      setReportSubmitted(true);
                      setReportReason('');
                      setReportDetails('');

                    } catch (error) {
                      window.alert(
                        error instanceof Error
                          ? error.message
                          : 'Unable to submit report.'
                      );
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Reason for reporting *
                    </label>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setReasonMenuOpen(!reasonMenuOpen)}
                        aria-expanded={reasonMenuOpen}
                        className="flex w-full items-center justify-between rounded-xl border border-[#D8C5AF] bg-white px-4 py-3 text-left text-sm text-[#242424] dark:border-[#38312A] dark:bg-[#252525] dark:text-white"
                      >
                        <span>{reportReason || "Select a reason"}</span>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 text-[#C49A6C] transition-transform ${reasonMenuOpen ? "-rotate-90" : "rotate-90"
                            }`}
                        />
                      </button>

                      {reasonMenuOpen && (
                        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-56 overflow-y-auto rounded-xl border border-[#E2D3C2] bg-white shadow-xl dark:border-[#38312A] dark:bg-[#252525]">
                          {reportReasons.map((reason) => (
                            <button
                              key={reason}
                              type="button"
                              onClick={() => {
                                setReportReason(reason);
                                setReasonMenuOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-[#F8F3EB] dark:hover:bg-[#38312A] ${reportReason === reason
                                ? "bg-[#F8F3EB] font-semibold text-[#8A5A2B] dark:bg-[#38312A] dark:text-[#C49A6C]"
                                : "text-[#242424] dark:text-white"
                                }`}
                            >
                              {reason}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Additional details (optional)
                    </label>
                    <textarea
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder="Explain what happened..."
                      className="w-full resize-none rounded-xl border border-[#D8C5AF] bg-transparent p-3 text-sm dark:border-[#38312A]"
                    />
                    <p className="text-right text-xs text-neutral-500">
                      {reportDetails.length}/500
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setReportModalOpen(false)}
                      className="rounded-xl border border-[#D8C5AF] px-5 py-2.5 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!reportReason}
                      className="rounded-xl bg-[#C49A6C] px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>

              </>
            ) : (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <CheckCircle2 className="h-14 w-14 text-green-600" />

                <h3 className="text-xl font-bold">
                  Report Submitted
                </h3>

                <p className="text-sm text-neutral-500">
                  Your report has been submitted successfully.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setReportModalOpen(false);
                    setReportSubmitted(false);
                  }}
                  className="mt-3 w-full rounded-xl bg-[#C49A6C] px-5 py-3 font-semibold text-black"
                >
                  OK
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div >
  );
};
