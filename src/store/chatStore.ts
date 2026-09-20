import { create } from "zustand";

export interface ChatMessage {
  id: string;
  senderId: string; // "user" or "tch-1"
  senderName: string;
  text: string;
  timestamp: string; // "10:30 AM"
  isSystem?: boolean;
  attachmentUrl?: string;
}

export interface ConversationThread {
  id: string; // e.g. "conv-tch-1"
  teacherId: string;
  teacherName: string;
  teacherAvatar: string;
  teacherSubject: string;
  childName: string; // e.g. "Aarav Sharma"
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  messages: ChatMessage[];
}

interface ChatStoreState {
  threads: ConversationThread[];
  activeThreadId: string | null;

  // Actions
  setActiveThreadId: (id: string | null) => void;
  sendMessage: (threadId: string, text: string) => void;
  markThreadAsRead: (threadId: string) => void;
  getThreadByTeacherId: (teacherId: string) => ConversationThread | undefined;
}

const MOCK_THREADS: ConversationThread[] = [
  {
    id: "conv-tch-1",
    teacherId: "tch-1",
    teacherName: "Priya Sharma",
    teacherAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80",
    teacherSubject: "Mathematics",
    childName: "Aarav Sharma",
    unreadCount: 1,
    lastMessage: "Hello! Looking forward to our session tomorrow at 5:00 PM. Please keep the Class 10 RD Sharma book ready.",
    lastMessageTime: "10:30 AM",
    messages: [
      {
        id: "msg-1",
        senderId: "tch-1",
        senderName: "Priya Sharma",
        text: "Namaste Mr. Sharma! I have accepted the booking request for Aarav's Class 10 Math session.",
        timestamp: "Yesterday, 06:15 PM",
      },
      {
        id: "msg-2",
        senderId: "system",
        senderName: "System",
        text: "Session confirmed for Monday, Sep 21 at 05:00 PM (Online Class).",
        timestamp: "Yesterday, 06:16 PM",
        isSystem: true,
      },
      {
        id: "msg-3",
        senderId: "user",
        senderName: "Rajesh Sharma",
        text: "Thank you Priya Ma'am. We will ensure Aarav is ready.",
        timestamp: "Yesterday, 07:00 PM",
      },
      {
        id: "msg-4",
        senderId: "tch-1",
        senderName: "Priya Sharma",
        text: "Hello! Looking forward to our session tomorrow at 5:00 PM. Please keep the Class 10 RD Sharma book ready.",
        timestamp: "10:30 AM",
      },
    ],
  },
  {
    id: "conv-tch-2",
    teacherId: "tch-2",
    teacherName: "Dr. Rajesh Verma",
    teacherAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&q=80",
    teacherSubject: "Physics",
    childName: "Aarav Sharma",
    unreadCount: 0,
    lastMessage: "I will arrive at your home address in Vasant Vihar by 3:55 PM tomorrow.",
    lastMessageTime: "Yesterday",
    messages: [
      {
        id: "msg-201",
        senderId: "tch-2",
        senderName: "Dr. Rajesh Verma",
        text: "I will arrive at your home address in Vasant Vihar by 3:55 PM tomorrow.",
        timestamp: "Yesterday",
      },
    ],
  },
];

export const useChatStore = create<ChatStoreState>((set, get) => ({
  threads: MOCK_THREADS,
  activeThreadId: "conv-tch-1",

  setActiveThreadId: (id) => {
    set({ activeThreadId: id });
    if (id) {
      get().markThreadAsRead(id);
    }
  },

  sendMessage: (threadId, text) => {
    if (!text.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: "user",
      senderName: "Rajesh Sharma",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    set((state) => ({
      threads: state.threads.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            lastMessage: text.trim(),
            lastMessageTime: "Just now",
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      }),
    }));
  },

  markThreadAsRead: (threadId) => {
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === threadId ? { ...t, unreadCount: 0 } : t
      ),
    }));
  },

  getThreadByTeacherId: (teacherId) => {
    return get().threads.find((t) => t.teacherId === teacherId);
  },
}));
