"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import {
  Send,
  MessageSquare,
  Loader2,
  ArrowLeft,
  Search,
  CheckCheck,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface Contact {
  user_id: string;
  last_message: string;
  last_message_time: string;
  unread: boolean;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

export default function MessagesPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [activeContactId, setActiveContactId] = useState<string | null>(
    searchParams.get("contact"),
  );
  const [showContacts, setShowContacts] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch inbox — polls every 5 seconds
  const { data: inbox, isLoading: loadingInbox } = useQuery({
    queryKey: ["inbox"],
    queryFn: async () => {
      const response = await api.get("/messages/inbox");
      return response.data as Message[];
    },
    refetchInterval: 5000,
  });

  // Derive unique contacts from inbox messages
  const contacts = inbox
    ? Array.from(
        inbox
          .reduce((map, msg) => {
            const otherId =
              msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
            if (!map.has(otherId)) {
              map.set(otherId, {
                user_id: otherId,
                last_message: msg.content,
                last_message_time: msg.created_at,
                unread: !msg.read && msg.receiver_id === user?.id,
              });
            }
            return map;
          }, new Map<string, Contact>())
          .values(),
      )
    : [];

  // Filter contacts by search
  const filteredContacts = contacts.filter((c) =>
    c.user_id.toLowerCase().includes(search.toLowerCase()),
  );

  // Fetch active conversation — polls every 3 seconds
  const { data: conversation, isLoading: loadingConversation } = useQuery({
    queryKey: ["conversation", activeContactId],
    queryFn: async () => {
      const response = await api.get(
        `/messages/conversation/${activeContactId}`,
      );
      return response.data as Message[];
    },
    enabled: !!activeContactId,
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (activeContactId) {
      setShowContacts(false);
    } else {
      setShowContacts(true);
    }
  }, [activeContactId]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // Send message mutation
  const { mutate: sendMessage, isPending: sending } = useMutation({
    mutationFn: () =>
      api.post("/messages/", {
        receiver_id: activeContactId,
        content: messageText.trim(),
      }),
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({
        queryKey: ["conversation", activeContactId],
      });
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });

  const handleSend = () => {
    if (!messageText.trim() || !activeContactId) return;
    sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
        {/* Header */}
        <div className="space-y-3 mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[11px] font-bold uppercase tracking-widest shadow-sm">
            <MessageSquare className="w-3.5 h-3.5" />
            Inbox
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
            Messages
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium">
            Manage your conversations with buyers and sellers.
          </p>
        </div>

        {/* Chat Layout Container */}
        <div
          className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-100"
          style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}
        >
          <div className="flex h-full">
            {/* Left Panel — Contacts */}
            <div
              className={`w-full lg:w-[340px] border-r border-gray-100/80 bg-white/50 flex flex-col ${
                showContacts ? "flex" : "hidden lg:flex"
              }`}
            >
              {/* Search */}
              <div className="p-4 sm:p-5 border-b border-gray-100/80">
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2D6A4F] transition-colors" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-10 pr-4 py-2.5 sm:py-2.5 bg-gray-50/50 hover:bg-gray-50 rounded-xl text-sm font-medium text-gray-700 placeholder:text-gray-400 border border-gray-200/80 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]/30 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Contact List */}
              <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-2 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                {loadingInbox ? (
                  <div className="space-y-2 p-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-14 sm:h-16 bg-gray-100/50 animate-pulse rounded-2xl"
                      />
                    ))}
                  </div>
                ) : filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => {
                    const isActive = activeContactId === contact.user_id;
                    return (
                      <button
                        key={contact.user_id}
                        onClick={() => {
                          setActiveContactId(contact.user_id);
                          setShowContacts(false);
                        }}
                        className={`w-full flex items-center gap-3 sm:gap-3.5 px-3 py-3 rounded-2xl transition-all text-left group ${
                          isActive
                            ? "bg-[#2D6A4F] shadow-md shadow-[#2D6A4F]/20"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-sm shadow-sm transition-colors ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-gradient-to-br from-[#2D6A4F]/10 to-[#2D6A4F]/5 text-[#2D6A4F]"
                          }`}
                        >
                          {contact.user_id.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p
                              className={`text-sm font-bold truncate ${
                                isActive ? "text-white" : "text-gray-900"
                              }`}
                            >
                              User {contact.user_id.slice(-5).toUpperCase()}
                            </p>
                            <span
                              className={`text-[11px] font-medium shrink-0 ml-2 ${
                                isActive ? "text-white/80" : "text-gray-400"
                              }`}
                            >
                              {formatTime(contact.last_message_time)}
                            </span>
                          </div>
                          <p
                            className={`text-xs sm:text-[13px] truncate font-medium ${
                              isActive
                                ? "text-white/90"
                                : contact.unread
                                  ? "text-gray-900 font-semibold"
                                  : "text-gray-500"
                            }`}
                          >
                            {contact.last_message}
                          </p>
                        </div>

                        {/* Unread dot */}
                        {contact.unread && !isActive && (
                          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#2D6A4F] shrink-0 shadow-sm" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 sm:py-16 px-4 sm:px-6 text-center">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                      <MessageSquare className="w-6 sm:w-7 h-6 sm:h-7 text-gray-400" />
                    </div>
                    <p className="text-sm sm:text-base font-bold text-gray-900">
                      No conversations yet
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1.5 font-medium">
                      When you connect with buyers or sellers, messages will
                      appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel — Active Conversation */}
            <div
              className={`flex-1 flex flex-col bg-white ${
                showContacts ? "hidden lg:flex" : "flex"
              }`}
            >
              {activeContactId ? (
                <>
                  {/* Conversation Header */}
                  <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100/80 bg-white/80 backdrop-blur-sm z-10">
                    <button
                      onClick={() => {
                        setActiveContactId(null);
                        setShowContacts(true);
                      }}
                      className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>
                    <div className="relative">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#2D6A4F]/10 to-[#2D6A4F]/5 flex items-center justify-center font-bold text-[#2D6A4F] shadow-sm">
                        {activeContactId.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm sm:text-base">
                        User {activeContactId.slice(-5).toUpperCase()}
                      </p>
                      <p className="text-xs text-green-600 font-medium mt-0.5">
                        Online
                      </p>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4 bg-[#F8FAFC]/50 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {loadingConversation ? (
                      <div className="space-y-3 sm:space-y-4">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-10 sm:h-12 bg-gray-200/50 animate-pulse rounded-2xl w-2/3 max-w-sm ${
                              i % 2 === 0
                                ? "ml-auto rounded-tr-sm"
                                : "rounded-tl-sm"
                            }`}
                          />
                        ))}
                      </div>
                    ) : conversation && conversation.length > 0 ? (
                      conversation.map((msg) => {
                        const isMine = msg.sender_id === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${
                              isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`group max-w-[85%] sm:max-w-[75%] lg:max-w-[65%] flex flex-col gap-1 sm:gap-1.5 ${
                                isMine ? "items-end" : "items-start"
                              }`}
                            >
                              <div
                                className={`px-3 sm:px-4 py-2 sm:py-3 rounded-[18px] sm:rounded-[20px] text-sm sm:text-[15px] shadow-sm ${
                                  isMine
                                    ? "bg-gradient-to-br from-[#2D6A4F] to-[#1b4332] text-white rounded-tr-[4px]"
                                    : "bg-white border border-gray-100 text-gray-800 rounded-tl-[4px]"
                                }`}
                                style={{ wordBreak: "break-word" }}
                              >
                                {msg.content}
                              </div>
                              <div className="flex items-center gap-1.5 px-1">
                                <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium">
                                  {formatTime(msg.created_at)}
                                </span>
                                {isMine && (
                                  <CheckCheck
                                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                                      msg.read
                                        ? "text-[#2D6A4F]"
                                        : "text-gray-300"
                                    }`}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                          <span className="text-xl sm:text-2xl">👋</span>
                        </div>
                        <div>
                          <p className="text-sm sm:text-sm font-bold text-gray-900">
                            Say hello!
                          </p>
                          <p className="text-xs text-gray-500 font-medium mt-1">
                            This is the beginning of your conversation.
                          </p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input Container */}
                  <div className="p-3 sm:p-4 lg:p-6 bg-white border-t border-gray-100/80">
                    <div className="flex items-end gap-2 sm:gap-3 bg-gray-50/80 rounded-2xl sm:rounded-3xl p-2 pl-3 sm:pl-4 border border-gray-200/60 focus-within:border-[#2D6A4F]/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#2D6A4F]/5 transition-all shadow-sm">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 bg-transparent text-sm sm:text-[15px] font-medium text-gray-800 placeholder:text-gray-400 py-2 sm:py-2.5 focus:outline-none resize-none max-h-24 sm:max-h-32 min-h-[36px] sm:min-h-[44px]"
                        style={{ scrollbarWidth: "none" }}
                      />
                      <button
                        onClick={handleSend}
                        disabled={sending || !messageText.trim()}
                        className="w-9 h-9 sm:w-11 sm:h-11 bg-[#2D6A4F] hover:bg-[#1b4332] disabled:opacity-40 disabled:hover:bg-[#2D6A4F] rounded-full flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-md shadow-[#2D6A4F]/20 mb-0.5"
                      >
                        {sending ? (
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white ml-0.5" />
                        )}
                      </button>
                    </div>
                    <p className="hidden sm:block text-[11px] text-gray-400 font-medium mt-2.5 text-center">
                      Press{" "}
                      <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 font-sans">
                        Enter
                      </kbd>{" "}
                      to send ·{" "}
                      <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 font-sans">
                        Shift + Enter
                      </kbd>{" "}
                      for new line
                    </p>
                  </div>
                </>
              ) : (
                // No conversation selected
                <div className="flex flex-col items-center justify-center h-full text-center px-6 sm:px-8 bg-gray-50/30">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm border border-gray-100">
                    <MessageSquare className="w-7 h-7 sm:w-10 sm:h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
                    Your Messages
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto mt-2 sm:mt-2.5 font-medium text-sm sm:text-sm leading-relaxed">
                    Select an existing conversation from the sidebar or start a
                    new one to connect with others.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
