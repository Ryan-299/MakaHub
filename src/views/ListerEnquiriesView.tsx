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
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ListerEnquiry } from '../types';

export const ListerEnquiriesView: React.FC = () => {
  const {
    listerEnquiries = [],
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string | null>(() => {
    if (targetEnquiryId && listerEnquiries.some((e) => e.id === targetEnquiryId)) {
      return targetEnquiryId;
    }
    return listerEnquiries[0]?.id || null;
  });

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
    } else if (!selectedEnquiryId && listerEnquiries.length > 0) {
      setSelectedEnquiryId(listerEnquiries[0].id);
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

  // Find active enquiry
  const activeEnquiry =
    filteredEnquiries.find((e) => e.id === selectedEnquiryId) ||
    listerEnquiries.find((e) => e.id === selectedEnquiryId) ||
    filteredEnquiries[0] ||
    null;

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
    <div id="lister-enquiries-view" className="min-h-[calc(100vh-4rem)] bg-white dark:bg-black pb-24 text-neutral-900 dark:text-[#F5F5F5] font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#262626]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="back-to-dashboard-btn"
              onClick={() => setCurrentView('lister-dashboard')}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-[#303030] hover:border-black dark:hover:border-white text-neutral-600 dark:text-[#F5F5F5] hover:text-black bg-white dark:bg-[#111111] transition-colors cursor-pointer shadow-2xs"
              title="Back to Lister Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight">
                  Seeker Enquiries & Leads
                </h1>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black px-2.5 py-0.5 rounded-full font-sans">
                  Lister Inbox
                </span>
              </div>
              <p className="text-xs sm:text-sm font-sans text-neutral-500 dark:text-[#A3A3A3] mt-0.5">
                {listerEnquiries.length} prospective tenants reached out regarding your listings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentView('my-listings')}
              className="px-4 py-2 bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#303030] hover:border-black dark:hover:border-white text-neutral-800 dark:text-[#F5F5F5] text-xs font-bold font-sans rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Building className="w-3.5 h-3.5" />
              <span>Manage Listings</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {listerEnquiries.length === 0 ? (
          <div className="bg-white dark:bg-[#111111] rounded-3xl p-12 text-center border border-neutral-200 dark:border-[#2A2A2A] max-w-xl mx-auto space-y-5 shadow-xs my-8 font-sans">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
            {/* Left Sidebar: Leads List */}
            <div className={`lg:col-span-4 space-y-3 ${activeEnquiry ? 'hidden lg:block' : 'block'}`}>
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
                <span className="text-[11px] text-neutral-500 dark:text-[#A3A3A3] font-medium">Click to chat</span>
              </div>

              <div className="space-y-2.5 max-h-[calc(100vh-16rem)] overflow-y-auto no-scrollbar pr-0.5">
                {filteredEnquiries.map((enq) => {
                  const isSelected = enq.id === activeEnquiry?.id;
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
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                        isSelected
                          ? 'bg-white dark:bg-[#151515] border-black dark:border-white ring-2 ring-black/10 dark:ring-white/10 shadow-md'
                          : 'bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#2A2A2A] hover:border-neutral-400 dark:hover:border-[#444444] hover:shadow-xs'
                      } ${targetEnquiryId === enq.id ? 'ring-2 ring-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm shrink-0">
                            {enq.seekerName.charAt(0)}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-[#F5F5F5] truncate">
                              {enq.seekerName}
                            </h4>
                            <p className="text-[11px] text-neutral-500 dark:text-[#A3A3A3] truncate">
                              For: <strong className="text-neutral-800 dark:text-[#E0E0E0]">{enq.propertyName}</strong>
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] text-neutral-400 dark:text-[#7D7D7D] shrink-0">
                          {enq.date || 'Recently'}
                        </span>
                      </div>

                      {/* Last Message Snippet */}
                      <p className="text-xs text-neutral-600 dark:text-[#A3A3A3] line-clamp-2 leading-relaxed bg-neutral-50 dark:bg-[#181818] p-2 rounded-xl border border-neutral-100 dark:border-[#262626]">
                        {lastMsg ? (
                          <>
                            <strong className="text-neutral-900 dark:text-[#F5F5F5]">
                              {lastMsg.senderRole === 'lister' ? 'You' : enq.seekerName}:
                            </strong>{' '}
                            {lastMsg.message}
                          </>
                        ) : (
                          enq.message
                        )}
                      </p>

                      <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-neutral-100 dark:border-[#262626] text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {isReplied ? (
                            <span className="inline-flex items-center gap-1 text-neutral-700 dark:text-[#A3A3A3] font-bold bg-neutral-100 dark:bg-[#181818] px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Replied
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-black dark:text-white font-bold bg-neutral-100 dark:bg-[#181818] px-2 py-0.5 rounded-md border border-black/20 dark:border-white/20">
                              <Clock className="w-3 h-3" /> Needs Reply
                            </span>
                          )}
                        </div>

                        <span className="text-neutral-500 dark:text-[#7D7D7D] font-mono text-[11px]">
                          {enq.seekerPhone}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Main Column: Active Lead Thread */}
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
                    className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#303030] rounded-xl text-xs font-bold text-neutral-700 dark:text-[#F5F5F5] shadow-2xs cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to all leads</span>
                  </button>
                </div>

                {/* Seeker Info & Property Context Card */}
                <div className="bg-white dark:bg-[#111111] rounded-3xl p-5 sm:p-6 border border-neutral-200 dark:border-[#2A2A2A] shadow-xs space-y-4">
                  {/* Seeker Profile & Quick Call/SMS */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-[#262626]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-13 h-13 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
                        {activeEnquiry.seekerName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-[#F5F5F5] leading-tight">
                            {activeEnquiry.seekerName}
                          </h2>
                          <span className="text-[10px] font-bold bg-neutral-100 dark:bg-[#181818] text-neutral-800 dark:text-[#CCCCCC] px-2 py-0.5 rounded-md">
                            Prospective Tenant
                          </span>
                        </div>

                        <p className="text-xs text-neutral-500 dark:text-[#A3A3A3] mt-0.5">
                          Enquired on {activeEnquiry.date || 'Recently'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${activeEnquiry.seekerPhone}`}
                        className="px-4 py-2.5 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call {activeEnquiry.seekerPhone}</span>
                      </a>
                      {activeEnquiry.seekerEmail && (
                        <a
                          href={`mailto:${activeEnquiry.seekerEmail}`}
                          className="px-3.5 py-2.5 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#303030] hover:border-black dark:hover:border-white text-neutral-700 dark:text-[#F5F5F5] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Email</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Property Reference Bar */}
                  {relatedProperty && (
                    <div className="flex items-center justify-between gap-3 bg-neutral-50 dark:bg-[#181818] p-3.5 rounded-2xl border border-neutral-200/80 dark:border-[#262626]">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {relatedProperty.images?.[0] && (
                          <img
                            src={relatedProperty.images[0]}
                            alt={relatedProperty.name}
                            className="w-11 h-11 rounded-xl object-cover border border-neutral-200 dark:border-[#303030] shrink-0"
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

                  {/* Privacy Notice Banner */}
                  <div className="bg-neutral-100/80 dark:bg-[#181818] px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-[11px] text-neutral-600 dark:text-[#A3A3A3]">
                    <Info className="w-4 h-4 text-neutral-800 dark:text-[#F5F5F5] shrink-0" />
                    <span>
                      <strong>Private Lead:</strong> This inquiry conversation is completely private between you and {activeEnquiry.seekerName}. It will never appear on public reviews or listing pages.
                    </span>
                  </div>
                </div>

                {/* Conversation Stream Container */}
                <div className="bg-white dark:bg-[#111111] rounded-3xl border border-neutral-200 dark:border-[#2A2A2A] shadow-xs overflow-hidden flex flex-col">
                  {/* Messages Feed */}
                  <div className="p-4 sm:p-6 space-y-4 max-h-[460px] overflow-y-auto bg-neutral-50/50 dark:bg-[#0D0D0D]">
                    {conversationMessages.map((msg, index) => {
                      const isLister = msg.senderRole === 'lister';
                      const isHighlighted = highlightedMessageId === msg.id;
                      return (
                        <div
                          key={msg.id || index}
                          id={`message-${msg.id}`}
                          className={`flex gap-3 items-end ${isLister ? 'justify-end' : 'justify-start'} transition-all duration-300 ${
                            isHighlighted ? 'scale-[1.01]' : ''
                          }`}
                        >
                          {/* Seeker Avatar (Left) */}
                          {!isLister && (
                            <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs shrink-0 mb-1 border border-neutral-700 dark:border-neutral-300">
                              {msg.senderName?.charAt(0) || 'K'}
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-2xs space-y-1.5 transition-all duration-300 ${
                              isLister
                                ? 'bg-black dark:bg-[#F5F5F5] text-white dark:text-[#111111] rounded-br-xs'
                                : 'bg-white dark:bg-[#181818] text-neutral-900 dark:text-[#F5F5F5] border border-neutral-200 dark:border-[#303030] rounded-bl-xs'
                            } ${
                              isHighlighted
                                ? isLister
                                  ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-white dark:ring-offset-black shadow-md'
                                  : 'ring-2 ring-emerald-600 dark:ring-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 ring-offset-2 ring-offset-white dark:ring-offset-black shadow-md'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 text-[10px]">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`font-bold ${
                                    isLister ? 'text-neutral-300 dark:text-neutral-700' : 'text-neutral-900 dark:text-[#F5F5F5]'
                                  }`}
                                >
                                  {isLister ? 'You (Lister)' : msg.senderName}
                                </span>
                                {isHighlighted && !isLister && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px] tracking-wide uppercase animate-pulse">
                                    New Message
                                  </span>
                                )}
                              </div>
                              <span
                                className={`${
                                  isLister ? 'text-neutral-400 dark:text-neutral-600' : 'text-neutral-400 dark:text-[#7D7D7D]'
                                }`}
                              >
                                {msg.createdAt || 'Just now'}
                              </span>
                            </div>

                            <p
                              className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                                isLister ? 'text-neutral-100 dark:text-neutral-900' : 'text-neutral-800 dark:text-[#D5D5D5]'
                              }`}
                            >
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

                  {/* Quick Suggested Replies */}
                  <div className="px-4 py-2.5 bg-neutral-100/70 dark:bg-[#151515] border-t border-neutral-200 dark:border-[#262626] flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <span className="text-[11px] font-bold text-neutral-500 dark:text-[#7D7D7D] shrink-0 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-neutral-700 dark:text-[#F5F5F5]" />
                      Quick:
                    </span>
                    {quickReplies.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickReply(q)}
                        className="px-3 py-1 bg-white dark:bg-[#181818] hover:bg-neutral-50 dark:hover:bg-[#222222] text-neutral-700 dark:text-[#D5D5D5] hover:text-black dark:hover:text-white border border-neutral-200 dark:border-[#303030] rounded-full text-xs whitespace-nowrap transition-colors shrink-0 cursor-pointer shadow-2xs"
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
                        placeholder={`Write a private reply to ${activeEnquiry.seekerName}... (Press Enter to send)`}
                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#303030] rounded-2xl text-xs sm:text-sm text-neutral-900 dark:text-[#F5F5F5] placeholder:text-neutral-400 dark:placeholder:text-[#7D7D7D] focus:bg-white dark:focus:bg-[#151515] focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] text-neutral-400 dark:text-[#7D7D7D] font-medium hidden sm:inline">
                        Instant notification delivered to {activeEnquiry.seekerName}
                      </span>

                      <button
                        type="submit"
                        disabled={!replyText.trim() || isSending}
                        className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-40 font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 ml-auto cursor-pointer"
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
