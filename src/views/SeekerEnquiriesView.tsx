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
  ChevronRight,
  User,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ListerEnquiry } from '../types';

export const SeekerEnquiriesView: React.FC = () => {
  const {
    seekerEnquiries = [],
    setCurrentView,
    setSelectedPropertyId,
    properties = [],
    sendEnquiryReply,
    markEnquiryAsRead,
    targetEnquiryId,
    setTargetEnquiryId,
    targetMessageId,
    setTargetMessageId
  } = useApp();

  // Selected enquiry id
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(() => {
    if (targetEnquiryId && seekerEnquiries.some((e) => e.id === targetEnquiryId)) {
      return targetEnquiryId;
    }
    return seekerEnquiries[0]?.id || null;
  });

  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [highlightActive, setHighlightActive] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // Sync if targetEnquiryId changes externally
  useEffect(() => {
    if (targetEnquiryId && seekerEnquiries.some((e) => e.id === targetEnquiryId)) {
      setSelectedEnquiryId(targetEnquiryId);
      setHighlightActive(true);
      const timer = setTimeout(() => setHighlightActive(false), 2500);
      return () => clearTimeout(timer);
    } else if (!selectedEnquiryId && seekerEnquiries.length > 0) {
      setSelectedEnquiryId(seekerEnquiries[0].id);
    }
  }, [targetEnquiryId, seekerEnquiries]);

  // Find active enquiry
  const activeEnquiry = seekerEnquiries.find((e) => e.id === selectedEnquiryId) || seekerEnquiries[0] || null;

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
    'Thank you! I will come for viewing tomorrow.',
    'Could you please share the caretaker’s phone number?',
    'Is water supply 24/7 or rationed during the week?',
    'What is the deposit requirement for moving in?'
  ];

  return (
    <div id="seeker-enquiries-view" className="min-h-[calc(100vh-4rem)] bg-white dark:bg-black pb-24 text-neutral-900 dark:text-[#F5F5F5] font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#262626]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="back-to-homes-btn"
              onClick={() => setCurrentView('tenant-home')}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-[#303030] hover:border-black dark:hover:border-white text-neutral-600 dark:text-[#F5F5F5] hover:text-black bg-white dark:bg-[#111111] transition-colors cursor-pointer shadow-2xs"
              title="Back to Discover Homes"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight">
                  My Enquiries & Messages
                </h1>
                <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-wider bg-black dark:bg-[#F5F5F5] text-white dark:text-[#111111] px-2.5 py-0.5 rounded-full">
                  Private
                </span>
              </div>
              <p className="text-xs sm:text-sm font-sans text-neutral-500 dark:text-[#A3A3A3] mt-0.5">
                Direct conversations with property owners and managers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentView('tenant-home')}
              className="px-4 py-2 bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#303030] hover:border-black dark:hover:border-white text-neutral-800 dark:text-[#F5F5F5] text-xs font-sans font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Building className="w-3.5 h-3.5" />
              <span>Explore More Rentals</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {seekerEnquiries.length === 0 ? (
          <div className="bg-white dark:bg-[#111111] rounded-3xl p-12 text-center border border-neutral-200 dark:border-[#292929] max-w-xl mx-auto space-y-5 shadow-xs my-8 font-sans">
            <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-[#181818] border border-neutral-200 dark:border-[#303030] flex items-center justify-center mx-auto text-neutral-700 dark:text-[#F5F5F5]">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-editorial font-semibold text-neutral-900 dark:text-[#F5F5F5]">No enquiries sent yet</h3>
              <p className="text-xs sm:text-sm font-sans text-neutral-500 dark:text-[#A3A3A3] leading-relaxed">
                When you find a house you like, click <strong className="text-neutral-900 dark:text-white">"Contact Lister"</strong> on its detail page to ask questions or arrange a physical viewing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView('tenant-home')}
              className="px-6 py-3 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black font-sans font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <Building className="w-4 h-4" />
              <span>Discover Vacant Homes</span>
            </button>
          </div>
        ) : (
          /* Master-Detail Enquiries Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
            {/* Left Sidebar: Enquiries List */}
            <div className={`lg:col-span-4 space-y-3 ${activeEnquiry ? 'hidden lg:block' : 'block'}`}>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-[#7D7D7D]">
                  All Conversations ({seekerEnquiries.length})
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-[#8A8A8A] font-medium">Click to open thread</span>
              </div>

              <div className="space-y-2.5 max-h-[calc(100vh-14rem)] overflow-y-auto no-scrollbar pr-0.5">
                {seekerEnquiries.map((enq) => {
                  const isSelected = enq.id === activeEnquiry?.id;
                  const prop = properties.find((p) => p.id === enq.propertyId);
                  const lastMsg = (enq.messages && enq.messages.length > 0)
                    ? enq.messages[enq.messages.length - 1]
                    : null;
                  const hasReplied = enq.status === 'Replied' || (enq.messages && enq.messages.some((m) => m.senderRole === 'lister'));

                  return (
                    <div
                      key={enq.id}
                      id={`enquiry-card-${enq.id}`}
                      onClick={() => {
                        setSelectedEnquiryId(enq.id);
                        setTargetEnquiryId(null);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                        isSelected
                          ? 'bg-white dark:bg-[#151515] border-black dark:border-white ring-2 ring-black/10 dark:ring-white/10 shadow-md'
                          : 'bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#292929] hover:border-neutral-400 dark:hover:border-[#444444] hover:shadow-xs'
                      } ${targetEnquiryId === enq.id ? 'ring-2 ring-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          {prop?.images?.[0] ? (
                            <img
                              src={prop.images[0]}
                              alt={enq.propertyName}
                              className="w-10 h-10 rounded-xl object-cover border border-neutral-200 dark:border-[#303030] shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-[#181818] border border-neutral-200 dark:border-[#303030] flex items-center justify-center shrink-0">
                              <Building className="w-5 h-5 text-neutral-500 dark:text-[#A3A3A3]" />
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-[#F5F5F5] truncate">
                              {enq.propertyName}
                            </h4>
                            <p className="text-[11px] text-neutral-500 dark:text-[#8A8A8A] truncate">
                              {prop?.location?.estate || prop?.location?.subCounty || 'Kenya'}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] text-neutral-400 dark:text-[#7D7D7D] shrink-0 font-medium">
                          {enq.date || 'Recently'}
                        </span>
                      </div>

                      {/* Last Message Snippet */}
                      <p className="text-xs text-neutral-600 dark:text-[#A3A3A3] line-clamp-2 leading-relaxed bg-neutral-50 dark:bg-[#181818] p-2 rounded-xl border border-neutral-100 dark:border-[#262626]">
                        {lastMsg ? (
                          <>
                            <strong className="text-neutral-900 dark:text-[#F5F5F5]">
                              {lastMsg.senderRole === 'lister' ? (prop?.lister?.name || 'Lister') : 'You'}:
                            </strong>{' '}
                            {lastMsg.message}
                          </>
                        ) : (
                          enq.message
                        )}
                      </p>

                      <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-neutral-100 dark:border-[#262626] text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {hasReplied ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/60">
                              <CheckCircle2 className="w-3 h-3" /> Lister Replied
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-neutral-700 dark:text-[#A3A3A3] font-semibold bg-neutral-100 dark:bg-[#181818] px-2 py-0.5 rounded-md border border-neutral-200 dark:border-[#292929]">
                              <Clock className="w-3 h-3" /> Awaiting Reply
                            </span>
                          )}
                        </div>

                        <span className="font-bold text-neutral-900 dark:text-[#F5F5F5]">
                          {prop ? `KSh ${prop.monthlyRent.toLocaleString()}` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Main Column: Active Thread & Quick Reply */}
            {activeEnquiry && (
              <div
                className={`lg:col-span-8 space-y-4 ${
                  highlightActive ? 'animate-pulse ring-2 ring-black dark:ring-white rounded-3xl' : ''
                }`}
              >
                {/* Mobile Back Button */}
                <div className="lg:hidden">
                  <button
                    type="button"
                    onClick={() => setSelectedEnquiryId(null)}
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#303030] rounded-xl text-xs font-bold text-neutral-700 dark:text-[#D5D5D5] shadow-2xs cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to all enquiries</span>
                  </button>
                </div>

                {/* Property & Lister Header Card */}
                <div className="bg-white dark:bg-[#111111] rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-[#292929] shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-[#262626]">
                    <div className="flex items-center gap-3.5">
                      {relatedProperty?.images?.[0] && (
                        <img
                          src={relatedProperty.images[0]}
                          alt={activeEnquiry.propertyName}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-neutral-200 dark:border-[#303030] shadow-xs shrink-0"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-[#F5F5F5] leading-tight">
                            {activeEnquiry.propertyName}
                          </h2>
                          {relatedProperty && (
                            <span className="text-[10px] font-bold bg-neutral-100 dark:bg-[#1E1E1E] text-neutral-800 dark:text-[#E0E0E0] px-2 py-0.5 rounded-md">
                              {relatedProperty.type}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-neutral-500 dark:text-[#A3A3A3] mt-0.5">
                          {relatedProperty
                            ? `${relatedProperty.location.estate}, ${relatedProperty.location.subCounty}, ${relatedProperty.location.county}`
                            : 'Kenya'}
                        </p>

                        {relatedProperty && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-extrabold text-neutral-950 dark:text-[#F5F5F5]">
                              KSh {relatedProperty.monthlyRent.toLocaleString()} / mo
                            </span>
                            <span className="text-neutral-300 dark:text-[#555555]">•</span>
                            <span className="text-[11px] text-neutral-600 dark:text-[#8A8A8A]">
                              {relatedProperty.vacancies} vacancies
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {relatedProperty && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPropertyId(relatedProperty.id);
                          setCurrentView('property-detail');
                        }}
                        className="px-4 py-2.5 bg-neutral-100 dark:bg-[#181818] hover:bg-neutral-200 dark:hover:bg-[#222222] text-neutral-900 dark:text-[#F5F5F5] border border-transparent dark:border-[#303030] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Listing</span>
                      </button>
                    )}
                  </div>

                  {/* Lister Contact Info & Direct Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-50 dark:bg-[#151515] p-3.5 rounded-2xl border border-neutral-200/80 dark:border-[#292929]">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          relatedProperty?.lister?.avatar ||
                          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={relatedProperty?.lister?.name || 'Property Lister'}
                        className="w-10 h-10 rounded-full object-cover border border-white dark:border-[#333333] shadow-2xs"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-[#F5F5F5]">
                            {relatedProperty?.lister?.name || 'Property Lister'}
                          </span>
                          <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white" />
                        </div>
                        <span className="text-[11px] text-neutral-500 dark:text-[#A3A3A3] block">
                          {relatedProperty?.lister?.type || 'Landlord / Property Owner'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {relatedProperty?.lister?.phone && (
                        <a
                          href={`tel:${relatedProperty.lister.phone}`}
                          className="px-3.5 py-2 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Lister</span>
                        </a>
                      )}
                      {relatedProperty?.lister?.email && (
                        <a
                          href={`mailto:${relatedProperty.lister.email}`}
                          className="px-3 py-2 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#303030] hover:border-black dark:hover:border-white text-neutral-700 dark:text-[#F5F5F5] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Email</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Privacy Notice Banner */}
                  <div className="bg-neutral-100/80 dark:bg-[#181818] px-3.5 py-2.5 rounded-xl border border-neutral-200/60 dark:border-[#292929] flex items-center gap-2 text-[11px] text-neutral-600 dark:text-[#A3A3A3]">
                    <Info className="w-4 h-4 text-neutral-800 dark:text-[#F5F5F5] shrink-0" />
                    <span>
                      <strong className="text-neutral-900 dark:text-[#F5F5F5]">Private Thread:</strong> Messages here are strictly private between you and the lister. They are never published in public reviews or property comments.
                    </span>
                  </div>
                </div>

                {/* Conversation Stream Container */}
                <div className="bg-white dark:bg-[#111111] rounded-3xl border border-neutral-200 dark:border-[#292929] shadow-xs overflow-hidden flex flex-col">
                  {/* Messages Feed */}
                  <div className="p-4 sm:p-6 space-y-4 max-h-[460px] overflow-y-auto bg-neutral-50/50 dark:bg-[#0D0D0D]">
                    {conversationMessages.map((msg, index) => {
                      const isSeeker = msg.senderRole === 'seeker';
                      const isHighlighted = highlightedMessageId === msg.id;
                      return (
                        <div
                          key={msg.id || index}
                          id={`message-${msg.id}`}
                          className={`flex gap-3 items-end ${isSeeker ? 'justify-end' : 'justify-start'} transition-all duration-300 ${
                            isHighlighted ? 'scale-[1.01]' : ''
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
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-2xs space-y-1.5 transition-all duration-300 ${
                              isSeeker
                                ? 'bg-black dark:bg-[#F5F5F5] text-white dark:text-[#111111] rounded-br-xs'
                                : 'bg-white dark:bg-[#181818] text-neutral-900 dark:text-[#F5F5F5] border border-neutral-200 dark:border-[#303030] rounded-bl-xs'
                            } ${
                              isHighlighted
                                ? isSeeker
                                  ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-white dark:ring-offset-black shadow-md'
                                  : 'ring-2 ring-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 ring-offset-2 ring-offset-white dark:ring-offset-black shadow-md'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 text-[10px]">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`font-bold ${
                                    isSeeker
                                      ? 'text-neutral-300 dark:text-neutral-700'
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
                                className={`${
                                  isSeeker
                                    ? 'text-neutral-400 dark:text-neutral-500'
                                    : 'text-neutral-400 dark:text-[#7D7D7D]'
                                }`}
                              >
                                {msg.createdAt || 'Just now'}
                              </span>
                            </div>

                            <p
                              className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                                isSeeker
                                  ? 'text-neutral-100 dark:text-neutral-900 font-sans'
                                  : 'text-neutral-800 dark:text-[#E0E0E0] font-sans'
                              }`}
                            >
                              {msg.message}
                            </p>
                          </div>

                          {/* Seeker Avatar (Right) */}
                          {isSeeker && (
                            <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs shrink-0 mb-1 border border-neutral-700 dark:border-neutral-300">
                              {msg.senderName?.charAt(0) || 'K'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Suggested Replies */}
                  <div className="px-4 py-2.5 bg-neutral-100/70 dark:bg-[#151515] border-t border-neutral-200 dark:border-[#262626] flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <span className="text-[11px] font-bold text-neutral-500 dark:text-[#A3A3A3] shrink-0 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-neutral-700 dark:text-[#F5F5F5]" />
                      Quick:
                    </span>
                    {quickReplies.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickReply(q)}
                        className="px-3 py-1 bg-white dark:bg-[#1E1E1E] hover:bg-neutral-50 dark:hover:bg-[#262626] text-neutral-700 dark:text-[#E0E0E0] hover:text-black dark:hover:text-white border border-neutral-200 dark:border-[#303030] rounded-full text-xs whitespace-nowrap transition-colors shrink-0 cursor-pointer shadow-2xs"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Interactive Reply Input Form */}
                  <form onSubmit={handleSendReply} className="p-4 bg-white dark:bg-[#111111] border-t border-neutral-200 dark:border-[#262626] space-y-3">
                    <div className="relative">
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply();
                          }
                        }}
                        placeholder={`Write a private reply to ${
                          relatedProperty?.lister?.name || 'the lister'
                        }... (Press Enter to send)`}
                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151515] border border-neutral-200 dark:border-[#303030] rounded-2xl text-xs sm:text-sm text-neutral-900 dark:text-[#F5F5F5] placeholder:text-neutral-400 dark:placeholder:text-[#777777] focus:bg-white dark:focus:bg-[#181818] focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none transition-all resize-none font-sans"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] text-neutral-400 dark:text-[#7D7D7D] font-medium hidden sm:inline font-sans">
                        Direct encrypted chat channel
                      </span>

                      <button
                        type="submit"
                        disabled={!replyText.trim() || isSending}
                        className="px-5 py-2.5 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-40 text-white dark:text-black font-bold font-sans rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 ml-auto cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Reply</span>
                      </button>
                    </div>
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
