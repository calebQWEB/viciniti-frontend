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
  size?: "sm" | "md" | "lg";
  isActive?: boolean;
}) {
  const sizeClasses = {
    sm: "w-8 h-8 text-[10px]",
    md: "w-9 h-9 text-xs",
    lg: "w-9 h-9 text-xs",
  };
  return (
    <div
      className={`relative shrink-0 rounded-full flex items-center justify-center font-bold overflow-hidden ${sizeClasses[size]} ${
        isActive
          ? "bg-white/25 text-white"
          : "bg-gradient-to-br from-accent-400 to-accent-500 text-white"
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
  const [showList, setShowList] = useState(true);
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
    setShowList(!activeContactId);
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
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="flex" style={{ height: "calc(100vh - 96px)" }}>
        {/* Middle — Active Conversation */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${showList ? "hidden lg:flex" : "flex"}`}
        >
          {activeContactId ? (
            <>
              {/* Conversation Header */}
              <div className="flex items-center gap-2.5 px-4 sm:px-6 py-3 border-b border-earth-200">
                <button
                  onClick={() => setActiveContactId(null)}
                  className="lg:hidden w-7 h-7 flex items-center justify-center rounded-full hover:bg-earth-100 transition-colors shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <Avatar
                  name={activeContactName}
                  avatar={activeContactAvatar}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">
                    {activeContactName}
                  </p>
                </div>
                <button
                  onClick={() => setShowList(true)}
                  className="lg:hidden ml-auto w-7 h-7 flex items-center justify-center rounded-full hover:bg-earth-100 transition-colors shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
                {loadingConversation ? (
                  <div className="space-y-2.5">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-9 bg-earth-100 animate-pulse rounded-2xl w-2/3 max-w-sm ${
                          i % 2 === 0
                            ? "ml-auto rounded-tr-md"
                            : "rounded-tl-md"
                        }`}
                      />
                    ))}
                  </div>
                ) : groupedConversation.length > 0 ? (
                  groupedConversation.map((group) => (
                    <div key={group.divider} className="space-y-2.5">
                      <div className="flex items-center justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-earth-400 px-2.5 py-1 rounded-full">
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
                              className={`max-w-[85%] sm:max-w-[60%] flex flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}
                            >
                              <div
                                className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                                  isMine
                                    ? "bg-primary-500 text-white rounded-tr-md"
                                    : "bg-earth-100 text-gray-900 font-bold rounded-tl-md border border-earth-300"
                                }`}
                                style={{ wordBreak: "break-word" }}
                              >
                                {msg.content}
                              </div>
                              <div className="flex items-center gap-1 px-1">
                                <span className="text-[10px] text-earth-400 font-medium">
                                  {formatTime(msg.created_at)}
                                </span>
                                {isMine && (
                                  <CheckCheck
                                    className={`w-3 h-3 ${msg.read ? "text-primary-500" : "text-earth-200"}`}
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
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-1.5">
                    <div className="w-9 h-9 bg-earth-100 rounded-full flex items-center justify-center">
                      <span className="text-base">👋</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        Say hello!
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                        This is the beginning of your conversation.
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="px-4 sm:px-6 pt-3 border-t border-earth-200">
                <div className="flex items-end gap-2 bg-earth-100 rounded-2xl p-1.5 pl-3.5 border border-earth-200 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-500/10 transition-all">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 bg-transparent text-xs sm:text-sm font-medium text-gray-800 placeholder:text-earth-300 py-1.5 focus:outline-none resize-none max-h-28 min-h-[32px]"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !messageText.trim()}
                    className="w-8 h-8 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:hover:bg-primary-500 rounded-full flex items-center justify-center transition-all active:scale-95 shrink-0"
                  >
                    {sending ? (
                      <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    ) : (
                      <Send className="w-3 h-3 text-white ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-14 h-14 bg-earth-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-earth-300" />
              </div>
              <h3 className="text-base font-black text-gray-900">
                Your Messages
              </h3>
              <p className="text-gray-400 max-w-sm mx-auto mt-1.5 font-medium text-xs leading-relaxed">
                Select a conversation from the list to catch up, or start a new
                one from a listing or service page.
              </p>
            </div>
          )}
        </div>

        {/* Right — Conversation list */}
        <div
          className={`w-full lg:w-[300px] border-l border-earth-200 flex flex-col ${
            showList ? "flex" : "hidden lg:flex"
          }`}
        >
          <div className="px-4 sm:px-5 pt-5 sm:pt-6 pb-3">
            <h1 className="text-lg font-black text-gray-900 tracking-tight mb-3">
              Messages
            </h1>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-earth-300 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-8 pr-3 py-2.5 bg-earth-100 rounded-xl text-xs font-medium text-gray-700 placeholder:text-earth-300 border border-earth-200 focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
            {loadingContacts ? (
              <div className="space-y-1.5 px-1.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-14 bg-earth-100 animate-pulse rounded-xl"
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
                      setShowList(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all text-left ${
                      isActive ? "bg-primary-500" : "hover:bg-earth-100"
                    }`}
                  >
                    <Avatar
                      name={contact.name}
                      avatar={contact.avatar}
                      size="md"
                      isActive={isActive}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5 gap-1.5">
                        <p
                          className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-gray-900"}`}
                        >
                          {contact.name}
                        </p>
                        <span
                          className={`text-[10px] font-semibold shrink-0 ${isActive ? "text-white/70" : "text-earth-300"}`}
                        >
                          {formatTime(contact.last_message_time)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1.5">
                        <p
                          className={`text-[11px] truncate font-medium ${
                            isActive
                              ? "text-white/85"
                              : contact.unread_count > 0
                                ? "text-gray-800 font-semibold"
                                : "text-gray-400"
                          }`}
                        >
                          {contact.last_message}
                        </p>
                        {contact.unread_count > 0 && !isActive && (
                          <span className="shrink-0 min-w-[16px] h-4 px-1 rounded-full bg-accent-500 text-white text-[9px] font-black flex items-center justify-center">
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
              <div className="flex flex-col items-center justify-center h-full py-8 px-3 text-center">
                <div className="w-10 h-10 bg-earth-100 rounded-full flex items-center justify-center mb-2.5">
                  <MessageSquare className="w-5 h-5 text-earth-300" />
                </div>
                <p className="text-xs font-bold text-gray-900">
                  No conversations yet
                </p>
                <p className="text-[11px] text-gray-400 mt-1 font-medium">
                  When you connect with buyers or sellers, messages will appear
                  here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
