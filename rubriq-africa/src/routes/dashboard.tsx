/* eslint-disable react-hooks/exhaustive-deps */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Users,
  Package,
  LogOut,
  MessageSquare,
  Bot,
  User,
  Trash2,
  ShieldAlert,
  Key,
  Globe,
  Search,
  RefreshCw,
  Layers,
  CheckCircle2,
  XCircle,
  Send,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSession, logout, getToken, type Session } from "@/lib/auth";
import { BACKEND_URL } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Administrator Console — Rubriq Africa" }] }),
  component: Dashboard,
});

type Tab = "overview" | "support" | "users" | "logs";

type DashboardStats = {
  products: number;
  stock: number;
  users: number;
  logs: number;
};

type UserRecord = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  is_verified: boolean;
  created_at: string;
};

type AuthLogRecord = {
  id: number;
  user_id: number | null;
  attempt_identifier: string;
  ip: string;
  device: string;
  is_success: boolean;
  time: string;
};

type ChatThread = {
  session_id: string;
  sender_name: string;
  last_message: string;
  timestamp: string;
  is_read: boolean;
  chat_mode: "bot" | "human";
};

type ChatMessage = {
  id: number;
  sender_id: string;
  recipient_id: string;
  sender_name: string;
  message: string;
  is_read: boolean;
  timestamp: string;
};

function Dashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  
  // Dashboard Stats
  const [stats, setStats] = useState<DashboardStats>({ products: 0, stock: 0, users: 0, logs: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // User Management
  const [userList, setUserList] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchUser, setSearchUser] = useState("");

  // Audit Logs
  const [logList, setLogList] = useState<AuthLogRecord[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [searchLog, setSearchLog] = useState("");
  const [logFilterSuccess, setLogFilterSuccess] = useState<"all" | "success" | "failed">("all");

  // Support Desk Chat
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const token = getToken();

  useEffect(() => {
    const s = getSession();
    if (!s) {
      navigate({ to: "/login" });
      return;
    }
    setSession(s);
  }, [navigate]);

  // Load initial statistics
  const fetchStats = async () => {
    if (!token) return;
    try {
      setLoadingStats(true);
      const res = await fetch(`${BACKEND_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session]);

  // Handle Tab Switch Actions
  useEffect(() => {
    if (!session || !token) return;
    if (activeTab === "overview") {
      fetchStats();
    } else if (activeTab === "users") {
      fetchUsers();
    } else if (activeTab === "logs") {
      fetchLogs();
    } else if (activeTab === "support") {
      fetchThreads();
    }
  }, [activeTab]);

  // Periodically poll for messages if support desk tab and a thread is selected
  useEffect(() => {
    if (activeTab !== "support") return;
    const interval = setInterval(() => {
      fetchThreads(true); // silent fetch threads
      if (selectedThread) {
        fetchMessages(selectedThread.session_id, true); // silent fetch messages
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeTab, selectedThread]);

  // ============================================
  // ADMINISTRATIVE API CALLS
  // ============================================

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch(`${BACKEND_URL}/api/dashboard/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserList(data);
      }
    } catch (err) {
      toast.error("Failed to load users list");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Toggle User Role
  const handleToggleRole = async (userId: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/dashboard/users/${userId}/toggle-role`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to toggle role");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  // Toggle User Status (Lock/Unlock)
  const handleToggleStatus = async (userId: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/dashboard/users/${userId}/toggle-status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to toggle status");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? This will remove all their items, chat logs, and logs!")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/dashboard/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to delete user");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  // Fetch Audit Logs
  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await fetch(`${BACKEND_URL}/api/dashboard/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLogList(data);
      }
    } catch (err) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  // ============================================
  // SUPPORT CHAT API CALLS
  // ============================================

  // Fetch Threads
  const fetchThreads = async (silent = false) => {
    try {
      if (!silent) setLoadingThreads(true);
      const res = await fetch(`${BACKEND_URL}/api/chat/threads`);
      if (res.ok) {
        const data = await res.json();
        setThreads(data);
        
        // If a thread is selected, keep its status updated in case the mode changed
        if (selectedThread) {
          const updated = data.find((t: ChatThread) => t.session_id === selectedThread.session_id);
          if (updated) setSelectedThread(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoadingThreads(false);
    }
  };

  // Fetch Messages for a thread
  const fetchMessages = async (sessionId: string, silent = false) => {
    try {
      if (!silent) setLoadingMessages(true);
      const res = await fetch(`${BACKEND_URL}/api/chat/messages?session_id=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Send admin response
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !replyText.trim() || sendingReply) return;
    const txt = replyText.trim();
    setReplyText("");
    setSendingReply(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: "admin",
          recipient_id: selectedThread.session_id,
          sender_name: "Admin Support",
          message: txt,
        }),
      });

      if (res.ok) {
        fetchMessages(selectedThread.session_id, true);
        fetchThreads(true);
      } else {
        toast.error("Failed to send message");
      }
    } catch (err) {
      toast.error("Error sending reply");
    } finally {
      setSendingReply(false);
    }
  };

  // Toggle Chat Thread Mode (AI vs Human)
  const handleToggleThreadMode = async (sessionId: string, currentMode: "bot" | "human") => {
    const targetMode = currentMode === "bot" ? "human" : "bot";
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/thread/${sessionId}/toggle-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: targetMode }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Agent switched to ${targetMode === "bot" ? "AI Chatbot" : "Human Representative"}`);
        fetchThreads(true);
      } else {
        toast.error(data.error || "Failed to toggle agent mode");
      }
    } catch (err) {
      toast.error("Error toggling mode");
    }
  };

  if (!session) return null;

  const isAdmin = session.role === "admin" || session.role === "superadmin";
  const isSuperAdmin = session.role === "superadmin";

  if (!isAdmin) {
    return (
      <section className="mx-auto max-w-xl px-6 py-24 text-center">
        <ShieldAlert className="mx-auto h-16 w-16 text-destructive animate-pulse" />
        <h1 className="mt-6 font-display text-3xl font-bold">Unauthorized Access</h1>
        <p className="mt-3 text-muted-foreground">
          The administrator console is restricted to official team representatives of Rubriq Africa.
        </p>
        <Button onClick={() => navigate({ to: "/" })} className="mt-6 rounded-full bg-brand-gradient">
          Return to Catalog
        </Button>
      </section>
    );
  }

  // Filter lists based on search
  const filteredUsers = userList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.phone.includes(searchUser)
  );

  const filteredLogs = logList.filter((l) => {
    const matchesSearch =
      l.attempt_identifier.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.ip.includes(searchLog);
    const matchesFilter =
      logFilterSuccess === "all" ||
      (logFilterSuccess === "success" && l.is_success) ||
      (logFilterSuccess === "failed" && !l.is_success);
    return matchesSearch && matchesFilter;
  });

  return (
    <section className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* TOP GLASSMORPHIC HEADER */}
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 p-6 shadow-xl backdrop-blur-xl mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="absolute inset-0 bg-brand-gradient-soft opacity-5 mix-blend-multiply" />
          <div className="relative flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-primary-foreground shadow-brand shrink-0">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold">Admin Console</h1>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live
                </span>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <span>Welcome, <strong className="text-foreground">{session.name}</strong></span>
                <span>•</span>
                <span className="capitalize text-primary font-medium flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5" /> {session.role}
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-3 relative shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="rounded-full border-border/60 hover:bg-muted bg-background/50 hover:text-foreground text-muted-foreground transition-smooth px-5"
            >
              <LogOut className="mr-2 h-4.5 w-4.5" /> Log out
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT SIDEBAR NAVIGATION */}
          <aside className="lg:col-span-1 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-card/45 p-4 shadow-card backdrop-blur-md">
              <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-3">Navigation</p>
              <nav className="space-y-1">
                {[
                  { id: "overview", label: "System Overview", icon: Layers },
                  { id: "support", label: "Support Chat Desk", icon: MessageSquare, badge: threads.filter(t => !t.is_read).length },
                  { id: "users", label: "User Management", icon: Users },
                  { id: "logs", label: "Security Audit Logs", icon: Key }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as Tab)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-smooth ${
                        isActive
                          ? "bg-brand-gradient text-primary-foreground shadow-brand"
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={`h-4.5 w-4.5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                        {item.label}
                      </span>
                      {!!item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? "bg-white text-primary" : "bg-destructive text-destructive-foreground animate-pulse"}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* QUICK METRICS PREVIEW */}
            <div className="rounded-2xl border border-white/10 bg-card/20 p-5 shadow-card backdrop-blur-md text-xs space-y-4">
              <div>
                <p className="text-muted-foreground font-medium">Database Status</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-foreground">SQLite (Active)</span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Auto-Lockout Rule</p>
                <p className="mt-0.5 text-foreground leading-relaxed">
                  5 consecutive failure attempts triggers a <strong className="text-secondary">15-minute</strong> device block.
                </p>
              </div>
            </div>
          </aside>

          {/* MAIN WORKING PANELS */}
          <main className="lg:col-span-3">
            
            {/* OVERVIEW PANEL */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* METRICS CARD GRID */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Active Products", count: stats.products, sub: "In catalog", icon: Package, color: "text-primary bg-primary/10" },
                    { label: "Total Units", count: stats.stock.toLocaleString(), sub: "In stock", icon: Layers, color: "text-secondary bg-secondary/10" },
                    { label: "Registered Users", count: stats.users, sub: "Total base", icon: Users, color: "text-emerald-600 bg-emerald-500/10" },
                    { label: "Security Logs", count: stats.logs, sub: "Logins/Blocks", icon: Key, color: "text-purple-600 bg-purple-500/10" }
                  ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <div key={i} className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/65 p-6 shadow-card backdrop-blur-md hover:-translate-y-1 transition-smooth">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground">{card.label}</p>
                            <h3 className="mt-2 font-display text-3xl font-bold text-foreground">
                              {loadingStats ? "..." : card.count}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                          </div>
                          <div className={`p-3 rounded-xl shrink-0 ${card.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* NUTRIBLEND STYLE STATS / CHARTS */}
                <div className="grid gap-6 md:grid-cols-3">
                  {/* PROGRESS GAUGES */}
                  <div className="md:col-span-1 rounded-2xl border border-white/10 bg-card/45 p-6 shadow-card backdrop-blur-md flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold">Stock Capacity</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Warehouse occupancy level</p>
                    </div>

                    <div className="my-6 flex justify-center relative">
                      {/* SVG Circle Gauge */}
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="50" className="stroke-muted" strokeWidth="10" fill="transparent" />
                        <circle cx="64" cy="64" r="50" className="stroke-secondary" strokeWidth="10" fill="transparent"
                          strokeDasharray={2 * Math.PI * 50}
                          strokeDashoffset={2 * Math.PI * 50 * (1 - Math.min(stats.stock / 100000, 1))}
                          strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                        <span className="text-xl font-bold">{Math.round(Math.min((stats.stock / 100000) * 100, 100))}%</span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Capacity</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      Aggregated stock units across 5 certified eco-material categories.
                    </p>
                  </div>

                  <div className="md:col-span-2 rounded-2xl border border-white/10 bg-card/45 p-6 shadow-card backdrop-blur-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-display text-lg font-bold">Secure Core Logs</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Login tracking & activity records</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { fetchStats(); toast.success("Refreshed statistics!"); }}
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                          title="Refresh stats"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* QUICK SYSTEM LOG PREVIEW */}
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold border-b pb-2 text-muted-foreground">
                          <span>Security Verification</span>
                          <span>Timestamp</span>
                        </div>
                        {loadingStats ? (
                          <p className="text-xs text-muted-foreground py-4 text-center">Loading audit log...</p>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs">
                              <span className="flex items-center gap-2 text-emerald-700 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                SQLite Connection Secured
                              </span>
                              <span className="text-muted-foreground text-[10px]">Just now</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/10 text-xs">
                              <span className="flex items-center gap-2 text-primary font-medium">
                                <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                                JWT Guarding REST Blueprint
                              </span>
                              <span className="text-muted-foreground text-[10px]">Active</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/5 border border-secondary/10 text-xs">
                              <span className="flex items-center gap-2 text-secondary font-medium">
                                <Bot className="h-3.5 w-3.5 text-secondary shrink-0" />
                                Gemini AI Chat Engine
                              </span>
                              <span className="text-muted-foreground text-[10px]">Online</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => setActiveTab("logs")}
                      className="mt-5 w-full rounded-xl bg-muted hover:bg-muted/80 text-foreground border text-xs h-9 font-semibold"
                    >
                      Open Security Logs Table
                    </Button>
                  </div>
                </div>

                {/* BUSINESS INFO CARD */}
                <div className="rounded-2xl border border-white/10 bg-brand-gradient-soft/5 p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-brand-gradient text-primary-foreground grid place-items-center shadow-brand shrink-0">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-display text-lg font-bold text-foreground">Rubriq Africa Eco-Operations</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                      Administrating recycling inventory and customer relationships. Make sure to audit security logs periodically to ensure that failed logins do not compromise user profiles.
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveTab("support")}
                    className="rounded-full bg-brand-gradient text-primary-foreground font-semibold px-6 shadow-brand shrink-0"
                  >
                    Open Live Support Desk
                  </Button>
                </div>
              </div>
            )}

            {/* SUPPORT DESK PANEL */}
            {activeTab === "support" && (
              <div className="rounded-2xl border border-white/10 bg-card/65 shadow-card backdrop-blur-md overflow-hidden flex flex-col md:flex-row h-[600px] animate-fadeIn">
                
                {/* THREADS SIDEBAR */}
                <div className="w-full md:w-80 border-r flex flex-col bg-card/25 shrink-0">
                  <div className="p-4 border-b bg-card/45 flex items-center justify-between shrink-0">
                    <h3 className="font-display text-base font-bold flex items-center gap-2">
                      <MessageSquare className="h-4.5 w-4.5 text-primary" /> Active Inquiries
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fetchThreads()}
                      className="h-8 w-8 rounded-full"
                      disabled={loadingThreads}
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${loadingThreads ? "animate-spin" : ""}`} />
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-muted/20">
                    {loadingThreads && threads.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-8">Retrieving chat channels...</p>
                    ) : threads.length === 0 ? (
                      <div className="text-center py-10 px-4">
                        <MessageSquare className="h-8 w-8 text-muted-foreground/45 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">No customer chat sessions available.</p>
                      </div>
                    ) : (
                      threads.map((t) => {
                        const isSelected = selectedThread?.session_id === t.session_id;
                        return (
                          <button
                            key={t.session_id}
                            onClick={() => {
                              setSelectedThread(t);
                              fetchMessages(t.session_id);
                            }}
                            className={`w-full text-left p-3 rounded-xl transition-smooth flex flex-col relative border ${
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground shadow-sm"
                                : "bg-card hover:bg-muted/65 border-border/40 text-foreground"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-xs truncate max-w-[70%]">
                                {t.sender_name}
                              </span>
                              <span className={`text-[9px] ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <p className={`text-[11px] mt-1.5 truncate ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                              {t.last_message}
                            </p>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[9px] uppercase tracking-wider font-semibold">
                              <span className={`flex items-center gap-1 ${isSelected ? "text-primary-foreground" : "text-primary"}`}>
                                {t.chat_mode === "bot" ? (
                                  <>
                                    <Bot className="h-3 w-3" /> AI Bot
                                  </>
                                ) : (
                                  <>
                                    <User className="h-3 w-3" /> Agent Mode
                                  </>
                                )}
                              </span>
                              {!t.is_read && (
                                <span className="bg-destructive text-destructive-foreground font-bold px-1.5 py-0.5 rounded-full text-[8px] animate-pulse">
                                  New
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* MESSAGES VIEW */}
                <div className="flex-1 flex flex-col bg-card/10">
                  {selectedThread ? (
                    <>
                      {/* CHAT CHANNEL HEADER & MODE CONTROLLERS */}
                      <div className="p-4 border-b bg-card/65 flex flex-wrap items-center justify-between gap-3 shrink-0">
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">{selectedThread.sender_name}</h4>
                          <p className="text-[10px] text-muted-foreground">Session: {selectedThread.session_id}</p>
                        </div>

                        {/* AGENT MODE SWITCH TOGGLE */}
                        <div className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-background/50 p-1.5 text-xs">
                          <span className={`font-semibold px-2 py-1 rounded-lg transition-smooth ${selectedThread.chat_mode === "bot" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}>
                            AI Bot
                          </span>
                          <button
                            onClick={() => handleToggleThreadMode(selectedThread.session_id, selectedThread.chat_mode)}
                            className="relative inline-flex h-5 w-9 items-center rounded-full bg-muted border hover:bg-muted/80 transition-smooth"
                            title="Click to toggle agent mode"
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 rounded-full bg-foreground transition-smooth transform ${
                                selectedThread.chat_mode === "human" ? "translate-x-4.5" : "translate-x-1"
                              }`}
                            />
                          </button>
                          <span className={`font-semibold px-2 py-1 rounded-lg transition-smooth ${selectedThread.chat_mode === "human" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}>
                            Human Agent
                          </span>
                        </div>
                      </div>

                      {/* MESSAGE SCROLLER */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10 text-xs flex flex-col">
                        {loadingMessages && chatMessages.length === 0 ? (
                          <p className="text-muted-foreground text-center py-10">Loading messages...</p>
                        ) : (
                          chatMessages.map((m) => {
                            const isAdminMsg = m.sender_id === "admin";
                            return (
                              <div
                                key={m.id}
                                className={`flex flex-col max-w-[80%] ${isAdminMsg ? "self-end items-end" : "self-start items-start"}`}
                              >
                                <span className="mb-0.5 text-[9px] text-muted-foreground">
                                  {m.sender_name} · {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div
                                  className={`rounded-2xl px-3 py-2 leading-relaxed shadow-sm ${
                                    isAdminMsg
                                      ? "bg-primary text-primary-foreground rounded-tr-none"
                                      : "bg-card text-card-foreground border rounded-tl-none"
                                  }`}
                                >
                                  {m.message}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* REPLY FORM */}
                      <form onSubmit={handleSendReply} className="p-3 border-t bg-card/65 flex gap-2 shrink-0">
                        <Input
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={
                            selectedThread.chat_mode === "bot"
                              ? "⚠️ Switch to Human Agent to reply manually..."
                              : "Write a supportive response..."
                          }
                          disabled={selectedThread.chat_mode === "bot" || sendingReply}
                          className="text-xs bg-background/50"
                        />
                        <Button
                          type="submit"
                          disabled={selectedThread.chat_mode === "bot" || !replyText.trim() || sendingReply}
                          className="bg-brand-gradient text-primary-foreground rounded-xl shrink-0 h-9 px-4 flex items-center gap-2 shadow-brand"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                      <MessageSquare className="h-14 w-14 text-muted-foreground/35 mb-3" />
                      <h4 className="font-display text-base font-bold text-muted-foreground">No Conversation Selected</h4>
                      <p className="text-xs text-muted-foreground max-w-xs mt-1">
                        Select an active customer inquiry from the left panel to begin communicating or toggle between bot / human agents.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* USER MANAGEMENT PANEL */}
            {activeTab === "users" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/45 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search name, email, phone..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>
                  <Button
                    onClick={fetchUsers}
                    variant="outline"
                    className="text-xs rounded-xl h-9 hover:bg-muted"
                    disabled={loadingUsers}
                  >
                    <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loadingUsers ? "animate-spin" : ""}`} /> Refresh Table
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-card/65 shadow-card backdrop-blur-md">
                  <table className="min-w-full text-xs text-left">
                    <thead className="bg-muted/40 uppercase tracking-wider text-[10px] text-muted-foreground border-b font-semibold">
                      <tr>
                        <th className="px-5 py-3">Member Details</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3 text-center">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {loadingUsers && userList.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-10 text-muted-foreground">Retrieving accounts database...</td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-10 text-muted-foreground">No accounts found.</td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => {
                          const isCurrentUser = user.id === session.id;
                          return (
                            <tr key={user.id} className="hover:bg-muted/20">
                              <td className="px-5 py-3">
                                <div className="font-semibold text-foreground">{user.name}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">{user.email} · {user.phone}</div>
                              </td>
                              <td className="px-5 py-3">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  user.role === "superadmin"
                                    ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                    : user.role === "admin"
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-center">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  user.is_verified
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    : "bg-destructive/10 text-destructive border border-destructive/20"
                                }`}>
                                  {user.is_verified ? "Active / Verified" : "Locked / Unverified"}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right">
                                <div className="flex justify-end gap-1.5">
                                  {/* TOGGLE STATUS LOCK */}
                                  <Button
                                    onClick={() => handleToggleStatus(user.id)}
                                    disabled={isCurrentUser}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-lg text-[10px] border-border/50 hover:bg-muted"
                                    title={user.is_verified ? "Lock / Disable user" : "Unlock / Verify user"}
                                  >
                                    {user.is_verified ? "Lock" : "Unlock"}
                                  </Button>

                                  {/* TOGGLE ROLE (Superadmin only) */}
                                  {isSuperAdmin && (
                                    <Button
                                      onClick={() => handleToggleRole(user.id)}
                                      disabled={isCurrentUser}
                                      variant="outline"
                                      size="sm"
                                      className="h-8 rounded-lg text-[10px] border-border/50 hover:bg-muted"
                                    >
                                      Role
                                    </Button>
                                  )}

                                  {/* DELETE */}
                                  {isSuperAdmin && (
                                    <Button
                                      onClick={() => handleDeleteUser(user.id)}
                                      disabled={isCurrentUser}
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                                      title="Delete user"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SECURITY LOGS PANEL */}
            {activeTab === "logs" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/45 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                  <div className="relative w-full sm:w-60 shrink-0">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Filter identifier, IP..."
                      value={searchLog}
                      onChange={(e) => setSearchLog(e.target.value)}
                      className="pl-9 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                    {[
                      { id: "all", label: "All Attempts" },
                      { id: "success", label: "Success" },
                      { id: "failed", label: "Failed / Blocks" }
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setLogFilterSuccess(filter.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 border transition-smooth ${
                          logFilterSuccess === filter.id
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-card text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={fetchLogs}
                    variant="outline"
                    className="text-xs rounded-xl h-9 hover:bg-muted shrink-0"
                    disabled={loadingLogs}
                  >
                    <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loadingLogs ? "animate-spin" : ""}`} /> Refresh Logs
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-card/65 shadow-card backdrop-blur-md">
                  <table className="min-w-full text-xs text-left">
                    <thead className="bg-muted/40 uppercase tracking-wider text-[10px] text-muted-foreground border-b font-semibold">
                      <tr>
                        <th className="px-5 py-3">Authentication Subject</th>
                        <th className="px-5 py-3">Verify Result</th>
                        <th className="px-5 py-3">Audit Details</th>
                        <th className="px-5 py-3 text-right">Registered Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-medium">
                      {loadingLogs && logList.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-10 text-muted-foreground">Loading system audit records...</td>
                        </tr>
                      ) : filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-10 text-muted-foreground">No logs found.</td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-muted/20">
                            <td className="px-5 py-3">
                              <span className="font-semibold text-foreground">{log.attempt_identifier}</span>
                              <div className="text-[10px] text-muted-foreground mt-0.5">Device ID: {log.user_id ? `User #${log.user_id}` : "Guest / Invalid user"}</div>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                log.is_success
                                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                  : "bg-destructive/10 text-destructive border border-destructive/20 animate-pulse"
                              }`}>
                                {log.is_success ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3" /> Success
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3" /> Failed / Blocked
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1 text-foreground">
                                <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span>{log.ip}</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-xs" title={log.device}>
                                {log.device}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-right text-muted-foreground">
                              {new Date(log.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>
    </section>
  );
}
