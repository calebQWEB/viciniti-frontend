"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { getInitials } from "@/lib/utils";
import Image from "next/image";
import {
  Send,
  MessageSquare,
  Loader2,
  ArrowLeft,
  Search,
  CheckCheck,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

interface UserSummary {
  id: string;
  name: string;
  avatar: string | null;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: UserSummary;
  receiver?: UserSummary;
}

interface Contact {
  user_id: string;
  name: string;
  avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
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
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

function formatDateDivider(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Avatar({
  name,
  avatar,
  size = "md",
  isActive = false,
}: {
  name: string;
  avatar: string | null;
  size?: "md" | "lg" | "xl";
  isActive?: boolean;
}) {
  const sizeClasses = {
    md: "w-10 h-10 text-xs",
    lg: "w-11 h-11 text-sm",
    xl: "w-12 h-12 text-sm",
  };
  return (
    <div
      className={`relative shrink-0 rounded-full flex items-center justify-center font-bold shadow-sm overflow-hidden ${sizeClasses[size]} ${
        isActive
          ? "bg-white/20 text-white"
          : "bg-gradient-to-br from-[#2D6A4F]/15 to-[#2D6A4F]/5 text-[#2D6A4F]"
      }`}
    >
      {avatar ? (
        <Image src={avatar} alt={name} fill className="object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
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

  const { data: contacts, isLoading: loadingContacts } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const response = await api.get("/messages/contacts");
      return response.data as Contact[];
    },
    refetchInterval: 5000,
  });

  const filteredContacts = (contacts ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const activeContact = contacts?.find((c) => c.user_id === activeContactId);

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
    setShowContacts(!activeContactId);
  }, [activeContactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

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
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
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

  const groupedConversation: { divider: string; messages: Message[] }[] = [];
  conversation?.forEach((msg) => {
    const divider = formatDateDivider(msg.created_at);
    const lastGroup = groupedConversation[groupedConversation.length - 1];
    if (lastGroup && lastGroup.divider === divider) {
      lastGroup.messages.push(msg);
    } else {
      groupedConversation.push({ divider, messages: [msg] });
    }
  });

  const activeContactName =
    activeContact?.name ??
    conversation?.find((m) => m.sender_id === activeContactId)?.sender?.name ??
    conversation?.find((m) => m.receiver_id === activeContactId)?.receiver
      ?.name ??
    "Conversation";
  const activeContactAvatar =
    activeContact?.avatar ??
    conversation?.find((m) => m.sender_id === activeContactId)?.sender
      ?.avatar ??
    null;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#FDFDFD] pb-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Messages
          </h1>
        </div>

        {/* Chat Layout Container */}
        <div
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          style={{ height: "calc(100vh - 160px)", minHeight: "520px" }}
        >
          <div className="flex h-full">
            {/* Left Panel — Contacts */}
            <div
              className={`w-full lg:w-[340px] border-r border-gray-100 bg-white flex flex-col ${
                showContacts ? "flex" : "hidden lg:flex"
              }`}
            >
              {/* Search */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#2D6A4F] transition-colors" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 placeholder:text-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]/40 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Contact List */}
              <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
                {loadingContacts ? (
                  <div className="space-y-2 p-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-16 bg-gray-50 animate-pulse rounded-xl"
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
                        className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all text-left ${
                          isActive
                            ? "bg-[#2D6A4F] shadow-md shadow-[#2D6A4F]/20"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <Avatar
                          name={contact.name}
                          avatar={contact.avatar}
                          size="lg"
                          isActive={isActive}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <p
                              className={`text-sm font-bold truncate ${isActive ? "text-white" : "text-gray-900"}`}
                            >
                              {contact.name}
                            </p>
                            <span
                              className={`text-xs font-medium shrink-0 ${isActive ? "text-white/70" : "text-gray-400"}`}
                            >
                              {formatTime(contact.last_message_time)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-xs truncate font-medium ${
                                isActive
                                  ? "text-white/85"
                                  : contact.unread_count > 0
                                    ? "text-gray-900 font-semibold"
                                    : "text-gray-500"
                              }`}
                            >
                              {contact.last_message}
                            </p>
                            {contact.unread_count > 0 && !isActive && (
                              <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#2D6A4F] text-white text-[10px] font-black flex items-center justify-center">
                                {contact.unread_count > 9
                                  ? "9+"
                                  : contact.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-10 px-4 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
                      <MessageSquare className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      No conversations yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">
                      When you connect with buyers or sellers, messages will
                      appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel — Active Conversation */}
            <div
              className={`flex-1 flex flex-col min-w-0 ${showContacts ? "hidden lg:flex" : "flex"}`}
            >
              {activeContactId ? (
                <>
                  {/* Conversation Header */}
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-gray-100 bg-white">
                    <button
                      onClick={() => setActiveContactId(null)}
                      className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <Avatar
                      name={activeContactName}
                      avatar={activeContactAvatar}
                      size="xl"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm sm:text-base truncate">
                        {activeContactName}
                      </p>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div
                    className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4"
                    style={{
                      backgroundColor: "#F6F8F6",
                      backgroundImage:
                        "radial-gradient(circle, rgba(45,106,79,0.06) 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  >
                    {loadingConversation ? (
                      <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-11 bg-gray-200/50 animate-pulse rounded-2xl w-2/3 max-w-sm ${
                              i % 2 === 0
                                ? "ml-auto rounded-tr-sm"
                                : "rounded-tl-sm"
                            }`}
                          />
                        ))}
                      </div>
                    ) : groupedConversation.length > 0 ? (
                      groupedConversation.map((group) => (
                        <div key={group.divider} className="space-y-3">
                          <div className="flex items-center justify-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                              {group.divider}
                            </span>
                          </div>
                          {group.messages.map((msg) => {
                            const isMine = msg.sender_id === user?.id;
                            return (
                              <div
                                key={msg.id}
                                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[85%] sm:max-w-[65%] flex flex-col gap-1.5 ${isMine ? "items-end" : "items-start"}`}
                                >
                                  <div
                                    className={`px-4 py-3 rounded-2xl text-sm sm:text-base leading-relaxed shadow-sm ${
                                      isMine
                                        ? "bg-[#2D6A4F] text-white rounded-tr-[4px]"
                                        : "bg-white border border-gray-100 text-gray-800 rounded-tl-[4px]"
                                    }`}
                                    style={{ wordBreak: "break-word" }}
                                  >
                                    {msg.content}
                                  </div>
                                  <div className="flex items-center gap-1.5 px-1">
                                    <span className="text-xs text-gray-400 font-medium">
                                      {formatTime(msg.created_at)}
                                    </span>
                                    {isMine && (
                                      <CheckCheck
                                        className={`w-3.5 h-3.5 ${msg.read ? "text-[#2D6A4F]" : "text-gray-300"}`}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                        <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                          <span className="text-xl">👋</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            Say hello!
                          </p>
                          <p className="text-xs text-gray-400 font-medium mt-0.5">
                            This is the beginning of your conversation.
                          </p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-3 sm:p-4 bg-white border-t border-gray-100">
                    <div className="flex items-end gap-2.5 bg-gray-50 rounded-2xl p-2 pl-4 border border-gray-200 focus-within:border-[#2D6A4F]/40 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#2D6A4F]/5 transition-all">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 bg-transparent text-sm sm:text-base font-medium text-gray-800 placeholder:text-gray-400 py-2 focus:outline-none resize-none max-h-32 min-h-[40px]"
                      />
                      <button
                        onClick={handleSend}
                        disabled={sending || !messageText.trim()}
                        className="w-10 h-10 bg-[#2D6A4F] hover:bg-[#1b4332] disabled:opacity-40 disabled:hover:bg-[#2D6A4F] rounded-full flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-md shadow-[#2D6A4F]/20"
                      >
                        {sending ? (
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5 text-white ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div
                  className="flex flex-col items-center justify-center h-full text-center px-6 sm:px-8"
                  style={{
                    backgroundColor: "#F6F8F6",
                    backgroundImage:
                      "radial-gradient(circle, rgba(45,106,79,0.06) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                    <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900">
                    Your Messages
                  </h3>
                  <p className="text-gray-400 max-w-sm mx-auto mt-2 font-medium text-sm leading-relaxed">
                    Select a conversation from the list to catch up, or start a
                    new one from a listing or service page.
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
