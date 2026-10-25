import { formatRelativeTime } from '../utils/formatTime';
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Send,
  Building,
  ShieldCheck,
  ExternalLink,
  Search,
  User,
  Sparkles,
  Info,
  AlertCircle,
  Sun,
  Moon,
  Heart,
  Star,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ListerEnquiry } from '../types';

export const ListerEnquiriesView: React.FC = () => {
  const {
    listerEnquiries = [],
    setCurrentView,
    setSelectedPropertyId,
    properties = [],
    users,
    reviews = [],
    sendEnquiryReply,
    markEnquiryAsRead,
    targetEnquiryId,
    setTargetEnquiryId,
    targetMessageId,
    setTargetMessageId,
    messageTab,
    setMessageTab,
    notifications,
    markNotificationRead,
    currentUser,
    resolvedTheme,
    toggleTheme
  } = useApp();
  const isDark = resolvedTheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');

  const systemNotifications = notifications

    .filter(
      (notification) =>
        (notification.recipientUserId || notification.userId) === currentUser?.id &&
        ['system', 'approval', 'rejection', 'flag'].includes(notification.type)
    )

    .sort((a, b) => {
      const aTime = new Date(a.createdAt || a.time).getTime();
      const bTime = new Date(b.createdAt || b.time).getTime();
      return bTime - aTime;
    });

  const activityNotifications = notifications
    .filter((notification) =>
      (notification.recipientUserId || notification.userId) === currentUser?.id
    )

    .filter((notification) =>
      notification.type === 'activity' ||
      (notification.type === 'review' &&
        ['Property Saved', 'New Property Rating', 'New Property Comment'].includes(notification.title))
    )

    .sort((a, b) => {
      const aTime = new Date(a.createdAt || a.time).getTime();
      const bTime = new Date(b.createdAt || b.time).getTime();
      return bTime - aTime;
    });

  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(() => {
    if (targetEnquiryId && listerEnquiries.some((e) => e.id === targetEnquiryId)) {
      return targetEnquiryId;
    }
    return null;
  });

  useEffect(() => {
    const isChatOpen =
      selectedEnquiryId !== null && messageTab === 'inbox';

    document.body.classList.toggle('rentike-lister-chat-open', isChatOpen);

    return () => {
      document.body.classList.remove('rentike-lister-chat-open');
    };
  }, [selectedEnquiryId, messageTab]);

  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [highlightActive, setHighlightActive] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);


  // Sync if targetEnquiryId changes
  useEffect(() => {
    if (targetEnquiryId && listerEnquiries.some((e) => e.id === targetEnquiryId)) {
      setSelectedEnquiryId(targetEnquiryId);
      setHighlightActive(true);

      const timer = setTimeout(() => setHighlightActive(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [targetEnquiryId, listerEnquiries]);


  // Filtered list
  const filteredEnquiries = listerEnquiries.filter((enq) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      enq.seekerName.toLowerCase().includes(q) ||
      enq.propertyName.toLowerCase().includes(q) ||
      enq.message.toLowerCase().includes(q)
    );
  });
  const sortedEnquiries = [...filteredEnquiries].sort((a, b) => {
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

  const activeEnquiry =
    listerEnquiries.find((e) => e.id === selectedEnquiryId) || null;


  // Mark as read when active enquiry changes
  useEffect(() => {
    if (activeEnquiry) {
      markEnquiryAsRead(activeEnquiry.id);
    }
  }, [activeEnquiry?.id]);

  // Related property
  const relatedProperty = activeEnquiry
    ? properties.find((p) => p.id === activeEnquiry.propertyId)
    : null;

  // Format messages
  const conversationMessages = activeEnquiry
    ? activeEnquiry.messages && activeEnquiry.messages.length > 0
      ? activeEnquiry.messages
      : [
        {
          id: `init-${activeEnquiry.id}`,
          enquiryId: activeEnquiry.id,
          senderId: activeEnquiry.seekerId || 'demo-seeker-001',
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

  const handleSendReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !activeEnquiry || isSending) return;

    setIsSending(true);
    sendEnquiryReply(activeEnquiry.id, replyText);
    setReplyText('');
    setTimeout(() => {
      setIsSending(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleQuickReply = (text: string) => {
    if (!activeEnquiry) return;
    sendEnquiryReply(activeEnquiry.id, text);
  };

  const quickReplies = [
    'Hello! Yes, the units are vacant and ready for viewing tomorrow at 2 PM.',
    'You can reach our on-site caretaker Daniel at +254 712 345 678 for gate access.',
    'The deposit is 1 month rent and rent includes water & 24/7 security.',
    'Please feel free to call me directly to confirm your arrival time.'
  ];

  return (

    <div
      id="lister-enquiries-view"
      className={`${activeEnquiry && messageTab === 'inbox'
        ? 'fixed inset-0 z-[10000] overflow-y-auto bg-[#F8F5EF] dark:bg-[#151515] md:static md:z-auto md:min-h-[calc(100vh-4rem)] md:overflow-visible md:pb-24'
        : 'min-h-[calc(100vh-4rem)] bg-[#F8F5EF] dark:bg-[#151515] pb-24'
        } text-neutral-900 dark:text-[#F5F5F5] font-sans transition-colors duration-200`}
    >



      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${activeEnquiry && messageTab === 'inbox'
          ? 'h-full pt-3 flex flex-col gap-0 md:h-auto md:block md:pt-8 md:space-y-6'
          : 'pt-6 sm:pt-8 space-y-6'
          }`}
      >


        {/* Header Bar */}

        <div className={`${activeEnquiry && messageTab === 'inbox' ? 'hidden' : 'flex'} flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#262626]`}>

          <div className="flex items-center gap-3">



            <div className="flex w-full items-center justify-between gap-3">
              <h1 className="text-2xl font-bold text-neutral-950 dark:text-white">
                Messages
              </h1>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="ml-auto shrink-0 flex lg:hidden items-center rounded-full p-1 border border-[#E2D3C2] dark:border-neutral-700 bg-[#F7F3EC] dark:bg-[#181818] shadow-[4px_4px_10px_rgba(0,0,0,0.12),-3px_-3px_9px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.6)] transition-colors"
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${!isDark ? 'bg-white text-neutral-600 shadow-sm' : 'text-neutral-500'}`}>
                  <Sun className="w-4 h-4" />
                </span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-[#292929] text-[#C49A6C] shadow-sm' : 'text-[#946B46]'}`}>
                  <Moon className="w-4 h-4" />
                </span>
              </button>
            </div>


          </div>


        </div>






        <div className={`${activeEnquiry && messageTab === 'inbox' ? 'hidden' : 'grid'} grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-[#F1EBE3] dark:bg-[#151515] border border-[#E2D3C2] dark:border-[#303030]`}>


          {(['inbox', 'activity', 'system'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMessageTab(tab)}
              className={`py-2.5 rounded-xl text-xs font-semibold transition-all ${messageTab === tab
                ? 'text-[var(--rentike-bronze)] bg-[#F8F3EB] dark:bg-[#1B1B1B] shadow-[4px_4px_8px_rgba(174,150,125,0.22),-3px_-3px_7px_rgba(255,255,255,0.95)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.65),-3px_-3px_7px_rgba(255,255,255,0.045)]'
                : 'text-neutral-600 dark:text-neutral-300'
                }`}
            >

              <span className="inline-flex items-center justify-center gap-1.5">
                {tab === 'inbox' ? 'Enquiries' : tab === 'activity' ? 'Activity' : 'System'}

                {tab === 'inbox' &&
                  listerEnquiries.filter((enq) => !enq.readByLister).length > 0 && (
                    <span className="min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold inline-flex items-center justify-center">
                      {listerEnquiries.filter((enq) => !enq.readByLister).length}
                    </span>
                  )}

                {tab === 'activity' &&
                  activityNotifications.filter((notification) => !notification.read).length > 0 && (
                    <span className="min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                      {activityNotifications.filter((notification) => !notification.read).length}
                    </span>
                  )}

                {tab === 'system' &&
                  systemNotifications.filter((notification) => !notification.read).length > 0 && (
                    <span className="min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold inline-flex items-center justify-center">
                      {systemNotifications.filter((notification) => !notification.read).length}
                    </span>
                  )}
              </span>

            </button>
          ))}
        </div>

        {/* Activity Notifications */}
        {messageTab === 'activity' && (
          <div className="divide-y divide-[#E7DED2] dark:divide-[#292929]">

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

            {activityNotifications.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <Heart className="mx-auto mb-3 h-7 w-7 text-[#C49A6C]" />
                <p className="text-sm font-semibold text-[#242424] dark:text-[#F5F5F5]">
                  No property activity yet
                </p>
                <p className="mt-1 text-xs text-[#806B58] dark:text-[#B8A596]">
                  Property saves and comments will appear here.
                </p>
              </div>
            ) : (
              activityNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    markNotificationRead(notification.id);
                    if (notification.targetPropertyId) {
                      setSelectedPropertyId(notification.targetPropertyId);
                      setCurrentView('property-detail');
                    }
                  }}

                  className={`flex w-full items-start gap-3 px-4 py-4 text-left transition-colors ${!notification.read
                    ? 'bg-[#F8F1E8] dark:bg-[#252019] hover:bg-[#F3E8D9] dark:hover:bg-[#30271E]'
                    : 'bg-transparent hover:bg-[#F8F5EF] dark:hover:bg-[#181818]'
                    }`}

                >

                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                    {(() => {

                      const actor = users.find(
                        (user) => user.id === notification.actorUserId
                      );

                      const actorEnquiry = listerEnquiries.find(
                        (enq) => enq.seekerId === notification.actorUserId
                      );

                      const actorReview = reviews.find(
                        (review) =>
                          (notification.targetReviewId &&
                            review.id === notification.targetReviewId) ||
                          (notification.actorUserId &&
                            review.authorId === notification.actorUserId &&
                            review.propertyId === notification.targetPropertyId)
                      );

                      const actorAvatar =
                        actorReview?.authorAvatar ||
                        actor?.avatar ||
                        actorEnquiry?.seekerAvatar;

                      const actorName =
                        actorReview?.authorName ||
                        actor?.name ||
                        actorEnquiry?.seekerName;



                      return actorAvatar ? (
                        <img
                          src={actorAvatar}
                          alt={actorName || 'User'}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEE4D7] dark:bg-[#24201B]">
                          {actorName?.charAt(0).toUpperCase() || '?'}
                        </span>
                      );

                    })()}

                    <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white dark:border-[#151515] dark:bg-[#151515]">

                      {notification.title === 'New Property Rating' ? (
                        <Star className="h-3 w-3 fill-[#FACC15] text-[#FACC15]" />
                      ) : notification.title === 'New Property Comment' ? (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#C49A6C]">
                          <MessageCircle className="h-2.5 w-2.5 fill-white text-white" />
                        </span>
                      ) : (
                        <Heart className="h-3 w-3 fill-[#DC2626] text-[#DC2626]" />
                      )}

                    </span>
                  </span>


                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">

                      <span className="flex min-w-0 items-start gap-2">
                        <span className={`min-w-0 text-sm ${notification.read
                          ? 'font-normal text-[#806B58] dark:text-[#B8A596]'
                          : 'font-semibold text-[#242424] dark:text-[#F5F5F5]'
                          }`}>
                          {notification.message}
                        </span>

                        {!notification.read && (
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#C49A6C]"
                            aria-label="Unread activity"
                          />
                        )}
                      </span>

                      <span className="shrink-0 text-[10px] text-[#806B58] dark:text-[#B8A596]">
                        {formatRelativeTime(notification.createdAt || notification.time)}
                      </span>
                    </span>



                    {notification.targetPropertyId && (
                      <span className="mt-2 inline-block text-xs font-semibold text-[#A77745] dark:text-[#C49A6C]">
                        View Property →
                      </span>
                    )}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {/* System Notifications */}
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


            {systemNotifications.map((notification) => {
              const title = notification.title.toLowerCase();

              const isApproved = title.includes('approv');
              const isRejected = title.includes('reject');
              const isFlagged =
                title.includes('flag') || notification.type === 'flag';
              const isWelcome = title.includes('welcome');
              const isSecurity =
                title.includes('password') ||
                title.includes('email changed') ||
                title.includes('phone changed');
              const isPayment =
                title.includes('payment') ||
                title.includes('subscription');

              const canManageListing =
                !!notification.targetPropertyId &&
                (isApproved || isRejected || isFlagged);

              const iconStyles = isApproved
                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                : isRejected
                  ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                  : isFlagged
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                    : isSecurity
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                      : isPayment
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                        : 'bg-[#F2E7D8] text-[#A77745] dark:bg-[#30251D] dark:text-[#CCA177]';

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    markNotificationRead(notification.id);

                    if (canManageListing) {
                      setCurrentView('my-listings');
                    }
                  }}
                  className={`w-full text-left px-3 py-4 transition-colors hover:bg-[#F3ECE2] dark:hover:bg-[#211D19] ${!notification.read
                    ? 'bg-[#F8F1E8] dark:bg-[#252019]'
                    : 'bg-transparent'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyles}`}
                    >
                      {isApproved ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : isRejected ? (
                        <AlertCircle className="h-5 w-5" />
                      ) : isFlagged ? (
                        <AlertCircle className="h-5 w-5" />
                      ) : isSecurity ? (
                        <ShieldCheck className="h-5 w-5" />
                      ) : isWelcome ? (
                        <Sparkles className="h-5 w-5" />
                      ) : isPayment ? (
                        <Info className="h-5 w-5" />
                      ) : (
                        <Info className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm text-neutral-900 dark:text-[#F5F5F5] ${!notification.read
                            ? 'font-bold'
                            : 'font-medium'
                            }`}
                        >
                          {notification.title}
                        </p>

                        <div className="flex shrink-0 items-center gap-2">
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-[#B98A5A]" />
                          )}

                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                            {formatRelativeTime(notification.createdAt || notification.time)}
                          </span>
                        </div>
                      </div>

                      <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {notification.message}
                      </p>

                      {canManageListing && (
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#A77745] dark:text-[#CCA177]">
                          Manage Listing
                          <span aria-hidden="true">→</span>
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {systemNotifications.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  No system notifications
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Listing approvals, subscription updates and important Rentike notices will appear here.
                </p>
              </div>
            )}
          </div>
        )}


        {listerEnquiries.length === 0 ? (
          <div className="bg-transparent dark:bg-transparent rounded-none p-12 text-center border border-neutral-200 dark:border-[#2A2A2A] max-w-xl mx-auto space-y-5 shadow-xs my-8 font-sans">
            <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-[#181818] border border-neutral-200 dark:border-[#303030] flex items-center justify-center mx-auto text-neutral-700 dark:text-[#F5F5F5]">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-editorial font-semibold text-neutral-900 dark:text-[#F5F5F5]">No tenant enquiries yet</h3>
              <p className="text-xs sm:text-sm font-sans text-neutral-500 dark:text-[#A3A3A3] leading-relaxed">
                When seekers view your properties and click "Contact Lister", their private messages and contact numbers will appear here for you to reply.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView('my-listings')}
              className="px-6 py-3 bg-black dark:bg-[#F5F5F5] hover:bg-neutral-800 dark:hover:bg-white text-white dark:text-[#111111] font-bold font-sans rounded-xl text-xs sm:text-sm transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <Building className="w-4 h-4" />
              <span>View My Listed Properties</span>
            </button>
          </div>
        ) : (
          /* Master-Detail Enquiries Layout */
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans ${messageTab === 'inbox' ? (activeEnquiry ? 'flex-1 min-h-0 items-stretch lg:h-[calc(100dvh-120px)]' : 'items-start') : 'hidden'}`}>
            {/* Left Sidebar: Leads List */}
            <div className={`space-y-3 ${activeEnquiry ? 'hidden' : 'col-span-1 lg:col-span-12 block'}`}>
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400 dark:text-[#7D7D7D]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search seeker or property..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#303030] rounded-xl text-xs text-neutral-900 dark:text-[#F5F5F5] placeholder:text-neutral-400 dark:placeholder:text-[#7D7D7D] focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-between px-1 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-[#7D7D7D]">
                  Received Leads ({filteredEnquiries.length})
                </span>

                <button
                  type="button"
                  onClick={() => {
                    listerEnquiries
                      .filter((enq) => !enq.readByLister)
                      .forEach((enq) => markEnquiryAsRead(enq.id));
                  }}
                  disabled={!listerEnquiries.some((enq) => !enq.readByLister)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A77745] dark:text-[#CCA177] hover:underline disabled:opacity-40 disabled:cursor-default disabled:no-underline"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark all read
                </button>

              </div>

              <div className="space-y-2.5 max-h-[calc(100vh-16rem)] overflow-y-auto no-scrollbar pr-0.5">
                {sortedEnquiries.map((enq) => {
                  const isSelected = enq.id === activeEnquiry?.id;


                  const isUnread = !enq.readByLister;

                  const prop = properties.find((p) => p.id === enq.propertyId);
                  const lastMsg =
                    enq.messages && enq.messages.length > 0
                      ? enq.messages[enq.messages.length - 1]
                      : null;
                  const isReplied = enq.status === 'Replied' || (enq.messages && enq.messages.some((m) => m.senderRole === 'lister'));

                  return (

                    <div
                      key={enq.id}
                      id={`lister-enquiry-card-${enq.id}`}
                      onClick={() => {
                        setSelectedEnquiryId(enq.id);
                        setTargetEnquiryId(null);
                      }}

                      className={`flex items-center gap-3 px-2 py-4 border-b border-neutral-200/70 dark:border-[#292929] cursor-pointer transition-colors ${isSelected
                        ? 'bg-[#F5EFE7] dark:bg-[#1B1B1B]'
                        : isUnread
                          ? 'bg-[#F8F1E8] dark:bg-[#252019]'
                          : 'hover:bg-[#F8F5EF] dark:hover:bg-[#181818]'
                        }`}

                    >

                      {enq.seekerAvatar ? (
                        <img
                          src={enq.seekerAvatar}
                          alt={enq.seekerName}
                          className="w-11 h-11 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-11 h-11 shrink-0 rounded-full bg-[#EEE4D7] dark:bg-[#24201B] flex items-center justify-center text-sm font-semibold text-[#8B6B43] dark:text-[#C49A6C]">
                          {enq.seekerName.charAt(0)}
                        </div>
                      )}


                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">

                          <div className="flex min-w-0 items-center gap-2">
                            <h4 className={`truncate text-sm ${isUnread
                              ? 'font-bold text-neutral-950 dark:text-white'
                              : 'font-medium text-neutral-600 dark:text-neutral-400'
                              }`}>
                              {enq.seekerName}
                            </h4>

                            {isUnread && (
                              <span
                                className="h-2 w-2 shrink-0 rounded-full bg-[#C49A6C]"
                                aria-label="Unread enquiry"
                              />
                            )}
                          </div>


                          <span className="shrink-0 text-[10px] text-neutral-400">
                            {formatRelativeTime(lastMsg?.createdAt || enq.date)}
                          </span>
                        </div>

                        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                          {enq.propertyName}
                        </p>

                        <p className="mt-1 truncate text-xs text-neutral-600 dark:text-neutral-300">
                          {lastMsg
                            ? `${lastMsg.senderRole === 'lister' ? 'You: ' : ''}${lastMsg.message}`
                            : enq.message}
                        </p>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


            {/* Right Main Column: Active Lead Thread */}
            {activeEnquiry && (

              <div
                className={`col-span-1 lg:col-span-12 flex flex-1 min-h-0 flex-col gap-3 lg:h-full ${highlightActive
                  ? 'animate-pulse ring-2 ring-black dark:ring-white rounded-3xl'
                  : ''
                  }`}

              >


                {/* Seeker Info & Property Context Card */}

                <div className="bg-transparent dark:bg-transparent rounded-none p-0 border-0 shadow-none space-y-3">


                  {/* Compact Seeker Chat Header */}
                  <div className="flex items-center justify-between gap-3 border-b border-neutral-200 dark:border-[#303030] pb-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedEnquiryId(null)}
                        aria-label="Back to enquiries"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-[#292929]"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      {activeEnquiry.seekerAvatar ? (
                        <img
                          src={activeEnquiry.seekerAvatar}
                          alt={activeEnquiry.seekerName}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEE4D7] text-sm font-semibold text-[#8B6B43] dark:bg-[#24201B] dark:text-[#C49A6C]">
                          {activeEnquiry.seekerName.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-neutral-950 dark:text-white">
                          {activeEnquiry.seekerName}
                        </h2>
                        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                          {activeEnquiry.propertyName}
                        </p>
                      </div>
                    </div>

                    <a
                      href={`tel:${activeEnquiry.seekerPhone}`}
                      aria-label={`Call ${activeEnquiry.seekerName}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3E8DB] text-[#946B46] dark:bg-[#24201B] dark:text-[#C49A6C]"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  </div>


                  {/* Property Reference Bar */}
                  {relatedProperty && (

                    <div className="flex w-full min-w-0 items-center justify-between gap-3 rounded-2xl border border-[#E7DED2] bg-white px-3 py-3 shadow-sm transition-colors dark:border-[#33302C] dark:bg-[#1B1B1B] sm:px-4">

                      <div className="flex items-center gap-3 overflow-hidden">
                        {relatedProperty.images?.[0] && (
                          <img
                            src={relatedProperty.images[0]}
                            alt={relatedProperty.name}
                            className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl object-cover border border-[#E7DED2] dark:border-[#33302C]"
                          />
                        )}
                        <div className="overflow-hidden">
                          <span className="text-xs font-bold text-neutral-950 dark:text-[#F5F5F5] block truncate">
                            {relatedProperty.name}
                          </span>
                          <span className="text-[11px] text-neutral-500 dark:text-[#A3A3A3] block truncate">
                            {relatedProperty.type} • KSh {relatedProperty.monthlyRent.toLocaleString()} / mo • {relatedProperty.vacancies} vacancies
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPropertyId(relatedProperty.id);
                          setCurrentView('property-detail');
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#303030] hover:border-black dark:hover:border-white text-neutral-900 dark:text-[#F5F5F5] text-xs font-bold rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </div>
                  )}


                </div>

                {/* Conversation Stream Container */}

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-0 bg-transparent shadow-none">


                  <div className="flex-1 min-h-0 overflow-y-auto space-y-3 px-3 py-4 sm:px-5 sm:py-5 bg-[#FAF9F6] dark:bg-[#151515]">

                    {conversationMessages.map((msg, index) => {
                      const isLister = msg.senderRole === 'lister';
                      const isHighlighted = highlightedMessageId === msg.id;
                      return (
                        <div
                          key={msg.id || index}
                          id={`message-${msg.id}`}
                          className={`flex gap-3 items-end ${isLister ? 'justify-end' : 'justify-start'} transition-all duration-300 ${isHighlighted ? 'scale-[1.01]' : ''
                            }`}
                        >

                          {!isLister && (
                            activeEnquiry.seekerAvatar ? (
                              <img
                                src={activeEnquiry.seekerAvatar}
                                alt={activeEnquiry.seekerName}
                                className="h-8 w-8 shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEE4D7] text-xs font-semibold text-[#8B6B43] dark:bg-[#24201B] dark:text-[#C49A6C]">
                                {msg.senderName?.charAt(0) || 'F'}
                              </div>
                            )
                          )}


                          {/* Message Bubble */}
                          <div

                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-3 space-y-1.5 border transition-all ${isLister

                              ? 'bg-[#F3E8DB] dark:bg-[#33281F] text-[#242424] dark:text-[#F5F5F5] border-transparent rounded-br-sm'
                              : 'bg-white dark:bg-[#202020] text-[#242424] dark:text-[#F5F5F5] border-[#ECE8E2] dark:border-[#333333] rounded-bl-sm'

                              } ${isHighlighted
                                ? 'ring-2 ring-emerald-400'
                                : ''
                              }`}

                          >
                            <div className="flex items-center justify-between gap-3 pt-2 md:pt-0 text-[10px]">
                              <div className="flex items-center gap-1.5">

                                <span className="font-semibold text-[#242424] dark:text-[#F5F5F5]">
                                  {isLister ? 'You' : msg.senderName}
                                </span>

                                {isHighlighted && !isLister && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px] tracking-wide uppercase animate-pulse">
                                    New Message
                                  </span>
                                )}
                              </div>
                              <span
                                className={`${isLister ? 'text-neutral-400 dark:text-neutral-600' : 'text-neutral-400 dark:text-[#7D7D7D]'
                                  }`}
                              >
                                {formatRelativeTime(msg.createdAt)}
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words text-[#242424] dark:text-[#F5F5F5]">
                              {msg.message}
                            </p>
                          </div>

                          {/* Lister Avatar (Right) */}
                          {isLister && (
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
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>


                  {/* Interactive Reply Input Form */}

                  <form
                    onSubmit={handleSendReply}
                    className="flex shrink-0 items-center gap-2 lg:max-w-[750px] lg:mx-auto lg:w-full border-t border-[#E7DED2] bg-white px-3 py-2 dark:border-[#303030] dark:bg-[#151515]"
                  >
                    <textarea
                      rows={1}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (replyText.trim() && !isSending) {
                            handleSendReply();
                          }
                        }
                      }}
                      placeholder="Type a message..."
                      aria-label="Type a message"

                      className="min-h-[44px] max-h-28 min-w-0 flex-1 resize-none rounded-2xl border border-[#D9C5AE] bg-[#F3E8DB] px-4 py-3 text-sm font-medium text-[#242424] outline-none placeholder:text-[#806B58] focus:border-[#B88653] dark:border-[#5A4635] dark:bg-[#29231E] dark:text-[#F5F5F5] dark:placeholder:text-[#B8A596]"

                    />

                    <button
                      type="submit"
                      disabled={!replyText.trim() || isSending}
                      aria-label="Send message"

                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#C49A6C] text-[#1F1F1F] shadow-sm transition-colors hover:bg-[#B88955] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-[#C49A6C] dark:text-[#151515]"

                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>

                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
