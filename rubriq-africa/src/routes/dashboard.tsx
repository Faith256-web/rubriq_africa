import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  ShieldCheck, Users, Package, LogOut, LayoutDashboard, 
  MessageSquare, FileText, Plus, Trash2, Edit, Check, X,
  Send, RefreshCw, Eye, ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSession, logout, getToken, type Session } from "@/lib/auth";
import { formatUGX } from "@/lib/products";
import { getImageUrl, BACKEND_URL } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Rubriq Africa" }] }),
  component: Dashboard,
});

type Tab = "overview" | "stock" | "users" | "chat" | "inquiries" | "orders";

function Dashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const token = getToken();

  // Dashboard Stats
  const [stats, setStats] = useState({ products: 0, stock: 0, users: 0, logs: 0 });
  const [overviewLoading, setOverviewLoading] = useState(true);

  // Products state
  const [productsList, setProductsList] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    name: "", category: "Pavers", price: "", unit: "per paver", stock: "", description: "", image: ""
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Users state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Inquiries state
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);

  // Live Chat state
  const [threads, setThreads] = useState<any[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeThreadName, setActiveThreadName] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Orders state
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      navigate({ to: "/login" });
      return;
    }
    // Only allow admins and superadmins
    if (!s.is_admin && s.role !== "superadmin") {
      toast.error("Access denied. Admin portal only.");
      navigate({ to: "/" });
      return;
    }
    setSession(s);
    fetchOverviewStats();
  }, [navigate]);

  // -------------- FETCH OVERVIEW STATS --------------
  const fetchOverviewStats = async () => {
    try {
      setOverviewLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard statistics");
      const data = await res.json();
      setStats(data.stats);
    } catch (err) {
      toast.error("Could not load dashboard stats");
    } finally {
      setOverviewLoading(false);
    }
  };

  // -------------- ORDER ACTIONS --------------
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/orders/view_all_orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrdersList(data.orders || []);
    } catch (err) {
      toast.error("Failed to load orders list");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/update_order_status/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ order_status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      fetchOverviewStats();
    } catch (err) {
      toast.error("Could not update order status");
    }
  };

  const handleUpdatePaymentStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/update_order_status/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ payment_status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update payment status");
      toast.success(`Payment status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error("Could not update payment status");
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to delete/cancel this order?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/delete_order/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete order");
      toast.success("Order deleted successfully");
      fetchOrders();
      fetchOverviewStats();
    } catch (err) {
      toast.error("Could not delete order");
    }
  };

  // -------------- STOCK ACTIONS --------------
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/products/`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProductsList(data);
    } catch (err) {
      toast.error("Failed to load products catalogue");
    } finally {
      setProductsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (isEdit) {
        setEditingProduct({ ...editingProduct, image: data.image_url });
      } else {
        setProductForm({ ...productForm, image: data.image_url });
      }
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Failed to upload product image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.stock) {
      toast.error("Please fill in required fields");
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock)
        })
      });
      if (!res.ok) throw new Error("Failed to create product");
      toast.success("Product created successfully!");
      setIsAddingProduct(false);
      setProductForm({ name: "", category: "Pavers", price: "", unit: "per paver", stock: "", description: "", image: "" });
      fetchProducts();
      fetchOverviewStats();
    } catch (err) {
      toast.error("Could not add product");
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editingProduct,
          price: parseFloat(editingProduct.price),
          stock: parseInt(editingProduct.stock)
        })
      });
      if (!res.ok) throw new Error("Failed to update product");
      toast.success("Product updated!");
      setEditingProduct(null);
      fetchProducts();
      fetchOverviewStats();
    } catch (err) {
      toast.error("Could not update product");
    }
  };

  const handleDeleteProduct = async (pId: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/${pId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Product deleted");
      fetchProducts();
      fetchOverviewStats();
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  // -------------- USER MANAGEMENT ACTIONS --------------
  const fetchUsersAndLogs = async () => {
    try {
      setUsersLoading(true);
      setLogsLoading(true);
      
      const usersRes = await fetch(`${BACKEND_URL}/api/dashboard/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const usersData = await usersRes.json();
      setUsersList(usersData);
      setUsersLoading(false);

      const logsRes = await fetch(`${BACKEND_URL}/api/dashboard/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!logsRes.ok) throw new Error("Failed to fetch logs");
      const logsData = await logsRes.json();
      setAuditLogs(logsData);
      setLogsLoading(false);
    } catch (err) {
      toast.error("Could not load users or logs data");
      setUsersLoading(false);
      setLogsLoading(false);
    }
  };

  const handleToggleStatus = async (uId: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/dashboard/users/${uId}/toggle-status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Toggle status failed");
      const data = await res.json();
      toast.success(data.message);
      fetchUsersAndLogs();
    } catch (err) {
      toast.error("Could not toggle user lock state");
    }
  };

  const handleToggleRole = async (uId: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/dashboard/users/${uId}/toggle-role`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Toggle role failed");
      const data = await res.json();
      toast.success(data.message);
      fetchUsersAndLogs();
    } catch (err) {
      toast.error("Could not change user role");
    }
  };

  const handleDeleteUser = async (uId: number) => {
    if (!window.confirm("Are you sure you want to delete this user? All their cart/log data will be purged.")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/dashboard/users/${uId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("User deleted");
      fetchUsersAndLogs();
      fetchOverviewStats();
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  // -------------- INQUIRIES ACTIONS --------------
  const fetchInquiries = async () => {
    try {
      setInquiriesLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/inquiries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load inquiries");
      const data = await res.json();
      setInquiries(data);
    } catch (err) {
      toast.error("Could not load inquiries");
    } finally {
      setInquiriesLoading(false);
    }
  };

  // -------------- LIVE CHAT ACTIONS --------------
  const fetchChatThreads = async () => {
    try {
      setThreadsLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/chat/threads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load active support chats");
      const data = await res.json();
      setThreads(data);
    } catch (err) {
      toast.error("Failed to load active chats");
    } finally {
      setThreadsLoading(false);
    }
  };

  const selectThread = async (sId: string, name: string) => {
    setActiveThreadId(sId);
    setActiveThreadName(name);
    fetchThreadMessages(sId);
  };

  const fetchThreadMessages = async (sId: string) => {
    try {
      setMessagesLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/chat/messages?session_id=${sId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to retrieve thread messages");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      toast.error("Could not load chat messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThreadId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sender_id: "admin",
          recipient_id: activeThreadId,
          sender_name: session?.name || "Admin Operator",
          message: replyText,
          chat_mode: "human" // Explicitly human reply, turns off bot automatic responder
        })
      });
      if (!res.ok) throw new Error("Reply failed to send");
      setReplyText("");
      fetchThreadMessages(activeThreadId);
      fetchChatThreads();
    } catch (err) {
      toast.error("Could not send reply");
    }
  };

  // -------------- TAB ROUTING LOADER --------------
  useEffect(() => {
    if (activeTab === "stock") fetchProducts();
    if (activeTab === "users") fetchUsersAndLogs();
    if (activeTab === "inquiries") fetchInquiries();
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "chat") {
      fetchChatThreads();
      // Periodically poll active thread messages if open
      const interval = setInterval(() => {
        if (activeThreadId) fetchThreadMessages(activeThreadId);
        fetchChatThreads();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, activeThreadId]);

  if (!session) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      {/* HEADER CARD */}
      <div className="flex flex-wrap items-center justify-between gap-4 border p-6 rounded-3xl bg-card shadow-card mb-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-brand-gradient-soft grid place-items-center text-primary-foreground text-2xl font-bold">
            🏢
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Rubriq Control Center</h1>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">{session.email}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-gradient px-2.5 py-0.5 font-bold text-primary-foreground text-[10px]">
                <ShieldCheck className="h-3 w-3" /> {session.role === "superadmin" ? "Super Admin" : "Operator Admin"}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => {
            logout();
            navigate({ to: "/login" });
          }}
          className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SIDE BAR NAVIGATION */}
        <aside className="lg:col-span-3 border p-4 rounded-3xl bg-card shadow-card h-fit space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2">Management Tools</p>
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === "overview" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" /> Overview Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab("stock")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === "stock" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            <Package className="h-4 w-4" /> Manage Stock
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === "orders" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            <ShoppingBag className="h-4 w-4" /> Manage Orders
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === "users" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            <Users className="h-4 w-4" /> Users & Audit Logs
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === "chat" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            <MessageSquare className="h-4 w-4" /> Support Chat
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === "inquiries" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            <FileText className="h-4 w-4" /> Inquiries
          </button>
        </aside>

        {/* DETAILS WINDOW CONTAINER */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {overviewLoading ? (
                <div className="flex items-center justify-center py-12"><RefreshCw className="animate-spin text-primary" /></div>
              ) : (
                <>
                  {/* Stats Tiles */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border bg-card p-5 shadow-card hover:border-primary transition">
                      <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-3">
                        <Package className="h-5 w-5" />
                      </div>
                      <p className="font-display text-2xl font-black">{stats.products}</p>
                      <p className="text-xs text-muted-foreground">Unique Products</p>
                    </div>

                    <div className="rounded-2xl border bg-card p-5 shadow-card hover:border-primary transition">
                      <div className="h-10 w-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-3">
                        <Package className="h-5 w-5" />
                      </div>
                      <p className="font-display text-2xl font-black">{stats.stock.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Aggregate Stock Units</p>
                    </div>

                    <div className="rounded-2xl border bg-card p-5 shadow-card hover:border-primary transition">
                      <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 mb-3">
                        <Users className="h-5 w-5" />
                      </div>
                      <p className="font-display text-2xl font-black">{stats.users}</p>
                      <p className="text-xs text-muted-foreground">Registered Accounts</p>
                    </div>

                    <div className="rounded-2xl border bg-card p-5 shadow-card hover:border-primary transition">
                      <div className="h-10 w-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600 mb-3">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <p className="font-display text-2xl font-black">{stats.logs}</p>
                      <p className="text-xs text-muted-foreground">System Audit Entries</p>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="border bg-card p-6 rounded-3xl shadow-card">
                    <h3 className="font-display text-xl font-bold mb-2">Welcome to Rubriq Admin Portal</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You are logged in as <span className="font-semibold text-foreground">{session.name}</span>. 
                      From this control panel, you have operational clearance to manage inventory catalog items, approve/verify 
                      client registrations, review connection audit logs to detect brute-force activity, and respond in real-time to active support tickets.
                    </p>
                    <div className="mt-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-800">
                      💡 <span className="font-bold">System Reminder:</span> Password policies enforce lockout security. If any account fails 5 consecutive login attempts within a 15 minute window, it is locked dynamically in the database.
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ================= TAB 2: MANAGE STOCK ================= */}
          {activeTab === "stock" && (
            <div className="space-y-6">
              {/* Product actions bar */}
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="font-display text-xl font-bold">Catalogue Inventory</h2>
                <Button 
                  onClick={() => setIsAddingProduct(!isAddingProduct)}
                  className="rounded-full bg-brand-gradient text-primary-foreground font-bold flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Product
                </Button>
              </div>

              {/* Add Product Card */}
              {isAddingProduct && (
                <form onSubmit={handleAddProduct} className="border bg-card p-6 rounded-3xl shadow-card space-y-4">
                  <h3 className="font-semibold text-lg">Add New Catalogue Item</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="prodName">Product Name *</Label>
                      <Input
                        id="prodName"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        placeholder="e.g. Hexagonal Paver block"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="prodCategory">Category *</Label>
                      <select
                        id="prodCategory"
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full h-10 border rounded-md px-3 bg-background"
                      >
                        <option value="Bricks">Bricks</option>
                        <option value="Pavers">Pavers</option>
                        <option value="Blocks">Blocks</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="prodPrice">Unit Price (UGX) *</Label>
                      <Input
                        id="prodPrice"
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        placeholder="3500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="prodUnit">Selling Unit</Label>
                      <Input
                        id="prodUnit"
                        value={productForm.unit}
                        onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                        placeholder="per paver"
                      />
                    </div>
                    <div>
                      <Label htmlFor="prodStock">Stock Level (Units) *</Label>
                      <Input
                        id="prodStock"
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        placeholder="5000"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="prodImg">Product Image</Label>
                      <div className="flex gap-2">
                        <Input
                          id="prodImg"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, false)}
                          className="file:bg-muted file:border-0 file:rounded-md file:px-2"
                        />
                        {uploadingImage && <RefreshCw className="animate-spin h-5 w-5 mt-2" />}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="prodDesc">Description</Label>
                    <textarea
                      id="prodDesc"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full border rounded-md p-3 bg-background h-20 text-sm"
                      placeholder="Enter a premium description detailing materials, eco recycled ratios and specifications..."
                    />
                  </div>
                  
                  {productForm.image && (
                    <div className="mt-2 text-xs text-emerald-600">
                      Uploaded file path: <code>{productForm.image}</code>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" className="rounded-full" onClick={() => setIsAddingProduct(false)}>Cancel</Button>
                    <Button type="submit" className="rounded-full bg-brand-gradient text-primary-foreground font-bold">Save Product</Button>
                  </div>
                </form>
              )}

              {/* Edit Product Modal/Form */}
              {editingProduct && (
                <form onSubmit={handleUpdateProduct} className="border border-orange-200 bg-orange-500/5 p-6 rounded-3xl shadow-card space-y-4">
                  <h3 className="font-semibold text-lg text-orange-950">Editing: {editingProduct.name}</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Product Name *</Label>
                      <Input
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Category *</Label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full h-10 border rounded-md px-3 bg-background"
                      >
                        <option value="Bricks">Bricks</option>
                        <option value="Pavers">Pavers</option>
                        <option value="Blocks">Blocks</option>
                      </select>
                    </div>
                    <div>
                      <Label>Unit Price (UGX) *</Label>
                      <Input
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Selling Unit</Label>
                      <Input
                        value={editingProduct.unit}
                        onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Stock Level *</Label>
                      <Input
                        type="number"
                        value={editingProduct.stock}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Change Image</Label>
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, true)}
                          className="file:bg-muted file:border-0 file:rounded-md file:px-2"
                        />
                        {uploadingImage && <RefreshCw className="animate-spin h-5 w-5 mt-2" />}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <textarea
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full border rounded-md p-3 bg-background h-20 text-sm"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" className="rounded-full" onClick={() => setEditingProduct(null)}>Cancel</Button>
                    <Button type="submit" className="rounded-full bg-brand-gradient text-primary-foreground font-bold">Update Product</Button>
                  </div>
                </form>
              )}

              {/* Inventory table */}
              {productsLoading ? (
                <div className="flex items-center justify-center py-12"><RefreshCw className="animate-spin text-primary" /></div>
              ) : (
                <div className="border rounded-2xl overflow-hidden bg-card shadow-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Image</th>
                          <th className="px-4 py-3">Product Name</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Price</th>
                          <th className="px-4 py-3">Stock</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {productsList.map((p) => (
                          <tr key={p.id} className="hover:bg-muted/40 transition">
                            <td className="px-4 py-3">
                              <img
                                src={getImageUrl(p.image)}
                                alt=""
                                className="h-10 w-10 rounded-md object-cover bg-muted border"
                                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400"; }}
                              />
                            </td>
                            <td className="px-4 py-3 font-semibold">{p.name}</td>
                            <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-muted border font-medium">{p.category}</span></td>
                            <td className="px-4 py-3 font-bold text-brand-gradient">{formatUGX(p.price)}</td>
                            <td className="px-4 py-3 font-mono">{p.stock.toLocaleString()} <span className="text-xs text-muted-foreground">({p.unit})</span></td>
                            <td className="px-4 py-3 text-right flex justify-end gap-1.5 pt-4">
                              <Button 
                                onClick={() => setEditingProduct(p)} 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 text-primary hover:bg-primary/5"
                                title="Edit Product"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                onClick={() => handleDeleteProduct(p.id)} 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:bg-destructive/5"
                                title="Delete Product"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: USERS & AUDIT LOGS ================= */}
          {activeTab === "users" && (
            <div className="space-y-8">
              {/* Accounts Management */}
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold border-b pb-2">Registered Accounts</h2>
                
                {usersLoading ? (
                  <div className="flex items-center justify-center py-6"><RefreshCw className="animate-spin text-primary" /></div>
                ) : (
                  <div className="border rounded-2xl overflow-hidden bg-card shadow-card">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                          <tr>
                            <th className="px-4 py-3">Account Details</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Administrative Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {usersList.map((u) => (
                            <tr key={u.id} className="hover:bg-muted/40 transition">
                              <td className="px-4 py-3">
                                <p className="font-semibold text-foreground">{u.name}</p>
                                <p className="text-xs text-muted-foreground">{u.email || "No email"}</p>
                              </td>
                              <td className="px-4 py-3 font-mono">{u.phone}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                  u.role === "superadmin" ? "bg-red-100 text-red-700" :
                                  u.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                }`}>
                                  {u.role.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                                  u.is_verified ? "text-emerald-600" : "text-destructive"
                                }`}>
                                  {u.is_verified ? <Check className="h-4.5 w-4.5" /> : <X className="h-4.5 w-4.5" />}
                                  {u.is_verified ? "Active / Verified" : "Locked / Unverified"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-1.5">
                                  {/* Toggle lockout status */}
                                  <Button
                                    onClick={() => handleToggleStatus(u.id)}
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full text-xs h-7 py-1 px-3.5"
                                    disabled={u.id === Number(session.id)}
                                  >
                                    {u.is_verified ? "Lock" : "Unlock"}
                                  </Button>

                                  {/* Toggle role admin/user (Superadmin only) */}
                                  {session.role === "superadmin" && (
                                    <Button
                                      onClick={() => handleToggleRole(u.id)}
                                      variant="outline"
                                      size="sm"
                                      className="rounded-full text-xs h-7 py-1 px-3.5 text-amber-600 border-amber-300 hover:bg-amber-50"
                                      disabled={u.id === Number(session.id) || u.role === "superadmin"}
                                    >
                                      Role Swap
                                    </Button>
                                  )}

                                  {/* Delete User (Superadmin only) */}
                                  {session.role === "superadmin" && (
                                    <Button
                                      onClick={() => handleDeleteUser(u.id)}
                                      variant="outline"
                                      size="sm"
                                      className="rounded-full text-xs h-7 py-1 px-3 text-destructive border-destructive/30 hover:bg-destructive/5"
                                      disabled={u.id === Number(session.id)}
                                    >
                                      Delete
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* System Audit Logs */}
              <div className="space-y-4 pt-4">
                <h2 className="font-display text-xl font-bold border-b pb-2">Brute-Force Detection & Access Audit Log</h2>
                
                {logsLoading ? (
                  <div className="flex items-center justify-center py-6"><RefreshCw className="animate-spin text-primary" /></div>
                ) : (
                  <div className="border rounded-2xl overflow-hidden bg-card shadow-card">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                          <tr>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">Identifier Attempted</th>
                            <th className="px-4 py-3">IP Address</th>
                            <th className="px-4 py-3">Result</th>
                            <th className="px-4 py-3">Device Agent</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y font-mono">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className={`hover:bg-muted/40 transition ${!log.is_success ? "bg-red-500/5" : ""}`}>
                              <td className="px-4 py-2 text-muted-foreground">{new Date(log.time).toLocaleString()}</td>
                              <td className="px-4 py-2 font-semibold text-foreground">{log.attempt_identifier || `UserID: ${log.user_id}`}</td>
                              <td className="px-4 py-2">{log.ip}</td>
                              <td className="px-4 py-2">
                                <span className={`font-bold ${log.is_success ? "text-emerald-600" : "text-destructive animate-pulse"}`}>
                                  {log.is_success ? "SUCCESS" : "FAILED"}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-muted-foreground truncate max-w-[200px]" title={log.device}>{log.device}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 4: SUPPORT CHAT ================= */}
          {activeTab === "chat" && (
            <div className="border rounded-3xl bg-card shadow-card overflow-hidden grid lg:grid-cols-12 h-[600px]">
              
              {/* Threads Left Column */}
              <div className="lg:col-span-4 border-r flex flex-col">
                <div className="p-4 border-b font-bold text-sm bg-muted/20 flex justify-between items-center">
                  <span>Customer Sessions</span>
                  <button onClick={fetchChatThreads} title="Refresh threads"><RefreshCw className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" /></button>
                </div>
                
                {threadsLoading ? (
                  <div className="flex items-center justify-center p-6"><RefreshCw className="animate-spin text-primary" /></div>
                ) : (
                  <div className="flex-1 overflow-y-auto divide-y">
                    {threads.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-12">No active support tickets.</p>
                    ) : (
                      threads.map((t) => (
                        <button
                          key={t.session_id}
                          onClick={() => selectThread(t.session_id, t.sender_name)}
                          className={`w-full text-left p-4 hover:bg-muted/40 transition flex flex-col gap-1 ${
                            activeThreadId === t.session_id ? "bg-primary/5 border-l-4 border-primary" : ""
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="font-bold text-sm truncate">{t.sender_name}</span>
                            <span className="text-[9px] text-muted-foreground">{new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate w-full">{t.last_message}</p>
                          {!t.is_read && (
                            <span className="self-end bg-primary h-2 w-2 rounded-full mt-1" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Chat View Right Column */}
              <div className="lg:col-span-8 flex flex-col h-full bg-muted/5">
                {activeThreadId ? (
                  <>
                    {/* Thread Header */}
                    <div className="p-4 border-b bg-card flex justify-between items-center">
                      <span className="font-bold text-sm">Conversation with {activeThreadName}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">Session: {activeThreadId}</span>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messagesLoading && messages.length === 0 ? (
                        <div className="flex items-center justify-center"><RefreshCw className="animate-spin h-5 w-5" /></div>
                      ) : (
                        messages.map((m) => {
                          const isAdmin = m.sender_id === "admin";
                          const isAI = m.sender_name.includes("AI");
                          return (
                            <div 
                              key={m.id} 
                              className={`flex flex-col max-w-[80%] ${isAdmin ? "ml-auto items-end" : "mr-auto items-start"}`}
                            >
                              <span className="text-[9px] text-muted-foreground font-semibold px-1 mb-0.5">{m.sender_name}</span>
                              <div className={`p-3 rounded-2xl text-sm ${
                                isAdmin ? (isAI ? "bg-slate-700 text-white rounded-br-none" : "bg-primary text-primary-foreground rounded-br-none") : "bg-card border rounded-bl-none shadow-sm"
                              }`}>
                                <p>{m.message}</p>
                              </div>
                              <span className="text-[8px] text-muted-foreground px-1 mt-0.5">{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Chat Input Footer */}
                    <form onSubmit={handleSendReply} className="p-3 bg-card border-t flex gap-2">
                      <Input
                        placeholder="Type reply as Operator (disables AI auto-response)..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="rounded-full flex-1"
                      />
                      <Button type="submit" size="icon" className="rounded-full h-10 w-10 bg-brand-gradient text-primary-foreground flex-shrink-0 grid place-items-center">
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-2" />
                    <p className="font-semibold">No Conversation Selected</p>
                    <p className="text-xs">Click an active client session on the left to start live chatting.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================= TAB 5: INQUIRIES ================= */}
          {activeTab === "inquiries" && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-bold border-b pb-2">Client Inquiries</h2>
              
              {inquiriesLoading ? (
                <div className="flex items-center justify-center py-12"><RefreshCw className="animate-spin text-primary" /></div>
              ) : inquiries.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No client inquiries found.</p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="border bg-card p-5 rounded-3xl shadow-card space-y-3 relative group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-foreground">{inq.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{inq.email}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : "Just now"}
                        </span>
                      </div>
                      <p className="text-sm text-foreground bg-muted/40 p-3 rounded-2xl border min-h-[60px] italic">
                        "{inq.message}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 6: MANAGE ORDERS ================= */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="font-display text-xl font-bold">Client Orders</h2>
                <button 
                  onClick={fetchOrders} 
                  title="Refresh orders" 
                  className="p-2 hover:bg-muted rounded-full transition"
                >
                  <RefreshCw className={`h-4 w-4 ${ordersLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="animate-spin text-primary h-8 w-8" />
                </div>
              ) : ordersList.length === 0 ? (
                <div className="text-center text-muted-foreground py-12 bg-card border rounded-3xl p-8 shadow-card">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/30 mb-2" />
                  <p className="font-semibold">No orders found.</p>
                  <p className="text-xs">Incoming cart checkouts will appear here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {ordersList.map((order) => (
                    <div key={order.order_id} className="border bg-card p-6 rounded-3xl shadow-card space-y-4">
                      {/* Order Header */}
                      <div className="flex flex-wrap justify-between items-start gap-4 border-b pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                              Order #{order.order_id}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {order.created_at}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm font-semibold text-foreground">
                              👤 {order.customer_name} ({order.phone})
                            </p>
                            <p className="text-xs text-muted-foreground">
                              📍 {order.address} {order.street_number && `, Street: ${order.street_number}`}
                            </p>
                            {order.message && (
                              <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-lg italic">
                                "{order.message}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status Badges & Controls */}
                        <div className="flex flex-col gap-2.5 items-end">
                          <div className="flex gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              order.status === "Delivered" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                              order.status === "Rejected" ? "bg-red-100 text-red-700 border border-red-200" :
                              "bg-amber-100 text-amber-700 border border-amber-200"
                            }`}>
                              📦 {order.status.toUpperCase()}
                            </span>

                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              order.payment_status === "Paid" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                              "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}>
                              💳 {order.payment_status.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex gap-1.5 flex-wrap justify-end">
                            {order.status !== "Delivered" && order.status !== "Rejected" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateOrderStatus(order.order_id, "Delivered")}
                                className="h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                              >
                                Mark Delivered
                              </Button>
                            )}
                            {order.status !== "Rejected" && order.status !== "Delivered" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateOrderStatus(order.order_id, "Rejected")}
                                className="h-8 rounded-full text-destructive border-destructive/20 hover:bg-destructive/5 font-bold text-xs"
                              >
                                Reject
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdatePaymentStatus(order.order_id, order.payment_status === "Paid" ? "Pending" : "Paid")}
                              className="h-8 rounded-full font-bold text-xs"
                            >
                              Toggle Payment
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteOrder(order.order_id)}
                              className="h-8 w-8 p-0 text-destructive border-destructive/20 hover:bg-destructive/5 rounded-full"
                              title="Delete Order"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Purchased Items */}
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Purchased Items</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {order.items && order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-3 items-center border bg-muted/20 p-2.5 rounded-2xl">
                              <img
                                src={getImageUrl(item.image)}
                                alt=""
                                className="h-10 w-10 rounded-lg object-cover bg-muted border"
                                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400"; }}
                              />
                              <div>
                                <p className="text-sm font-semibold">{item.product_name}</p>
                                <p className="text-xs text-muted-foreground font-mono">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

    </section>
  );
}
