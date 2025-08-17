import { deleteMessage } from "@/utils/user-agent-chat/api.deleteMessage";
import { saveDraftToDB } from "@/utils/user-agent-chat/api.draft";
import { getChatUsers } from "@/utils/user-agent-chat/api.getChatUsers";
import { getMessages } from "@/utils/user-agent-chat/api.getMessages";
import { markMessagesAsRead } from "@/utils/user-agent-chat/api.markMessagesAsRead";
import { sendMessage } from "@/utils/user-agent-chat/api.sendMessage";
import { create } from "zustand";

export interface Message {
  _id: string;
  sender: string;
  receiver: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatUser {
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  lastMessage: {
    message: string;
    timestamp: string;
  };
  draftMessage?: string;
  unreadCount: number;
}

interface ChatStore {
  // Users + pagination state
  users: ChatUser[]
  userPage: number
  userLimit: number
  hasMoreUsers: boolean
  loadingUsers: boolean

  // Message state
  messages: Message[]
  nextCursor: string | null
  loadingMessages: boolean

  // Active chat
  currentChatUserId: string | null
  drafts: Record<string, string>

  // Actions
  fetchUsers: (reset?: boolean) => Promise<void>
  fetchMoreUsers: () => Promise<void>
  fetchMessages: (userId: string) => Promise<void>
  loadMoreMessages: () => Promise<void>
  markRead: (userId: string, viewerId: string) => Promise<void>
  send: (text: string) => Promise<void>
  removeMessage: (id: string) => Promise<void>

  setCurrentChatUserId: (id: string) => Promise<void>
  setDraft: (userId: string, text: string) => void
  getDraft: (userId: string) => string
  clearDraft: (userId: string) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // initial state
  users: [],
  userPage: 1,
  userLimit: 10,
  hasMoreUsers: true,
  loadingUsers: false,

  messages: [],
  nextCursor: null,
  loadingMessages: false,

  currentChatUserId: null,
  drafts: {},

  // set active chat and clear its messages/cursor
  setCurrentChatUserId: async (id) => {
    const currUserId = get().currentChatUserId;
    const currUserDraft = get().getDraft(get().currentChatUserId || "");
    if (currUserId && currUserDraft) {
      await saveDraftToDB(currUserId, currUserDraft);
    }
    if (id !== currUserId) {
      set({ currentChatUserId: id, messages: [], nextCursor: null });
    }
  },

  // 1) Fetch first page or reset
  fetchUsers: async (reset = true) => {
    if (reset) {
      set({ loadingUsers: true, userPage: 1, users: [] })
    }
    const page = reset ? 1 : get().userPage + 1
    const limit = get().userLimit

    const res = await getChatUsers(page, limit)
    if (res) {
      set({
        users: reset
          ? res.users
          : [...get().users, ...res.users],
        userPage: res.pagination.page,
        hasMoreUsers: res.pagination.hasMore,
      })
    }
    set({ loadingUsers: false })
  },

  // 2) Fetch next page
  fetchMoreUsers: async () => {
    if (!get().hasMoreUsers || get().loadingUsers) return
    await get().fetchUsers(false)
  },

  // 3) Fetch messages for a partner
  fetchMessages: async (userId) => {
    set({ loadingMessages: true })
    const res = await getMessages(userId)
    if (res) {
      set({ messages: res.messages, nextCursor: res.nextCursor })
    }
    set({ loadingMessages: false })
  },

  // 4) Load more chat messages (infinite scroll)
  loadMoreMessages: async () => {
    const { currentChatUserId, nextCursor, messages } = get()
    if (!currentChatUserId || !nextCursor) return
    const res = await getMessages(currentChatUserId, nextCursor)
    if (res) {
      set({
        messages: [...messages, ...res.messages],
        nextCursor: res.nextCursor,
      })
    }
  },

  // 5) Mark as read
  markRead: async (userId, viewerId) => {
    const success = await markMessagesAsRead(userId, viewerId)
    if (success) {
      set((state) => ({
        users: state.users.map((u) => {
          if (u.user._id === userId) {
            return { ...u, unreadCount: 0 }
          }
          return u
        }),
      }))
    }
  },

  // 6) Send a new message
  send: async (text) => {
    const { currentChatUserId, messages, clearDraft } = get()
    if (!currentChatUserId) return
    const sent = await sendMessage(currentChatUserId, text)
    if (sent && typeof sent === 'object' && '_id' in sent) {
      clearDraft(currentChatUserId)
      set({ messages: [...messages, sent as Message] })
    }
  },

  // 7) Delete a message
  removeMessage: async (id) => {
    const deleted = await deleteMessage(id)
    if (deleted) {
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== id),
      }))
    }
  },

  // ——— Draft Management ———

  // Updates a user's draftMessage and persists
  setDraft: (userId, text) => {
    set((state) => ({
      users: state.users.map((cu) =>
        cu.user._id === userId ? { ...cu, draftMessage: text } : cu
      ),
    }))
  },

  // Reads the draftMessage for a given user
  getDraft: (userId) => {
    const user = get().users.find((cu) => cu.user._id === userId)
    return user?.draftMessage ?? ""
  },

  // Clears a user's draftMessage and persists
  clearDraft: (userId) => {
    set((state) => ({
      users: state.users.map((cu) =>
        cu.user._id === userId
          ? { ...cu, draftMessage: undefined }
          : cu
      ),
    }))
  }
}));
