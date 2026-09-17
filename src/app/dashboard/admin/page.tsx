"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getStoredMembers,
  getStoredUsers,
  getStoredTrainers,
  getStoredLeads,
  getStoredInvoices,
  getStoredSettings,
  getStoredPlans,
  getStoredClasses,
  getStoredExercises,
  getStoredBlogPosts,
  getStoredTestimonials,
  saveMembers,
  saveUsers,
  saveTrainers,
  savePlans,
  saveClasses,
  saveExercises,
  saveBlogPosts,
  saveTestimonials,
  saveSettings,
  saveLeads
} from "@/lib/storage";
import {
  getExpiringMembershipsReport,
  runMembershipExpiryCheck
} from "@/lib/reminderEngine";
import {
  ExpiringMembershipReport,
  GymSettings,
  MemberProfile,
  TrainerProfile,
  MembershipPlan,
  ClassItem,
  BlogPost,
  Testimonial,
  Lead
} from "@/types";
import {
  Shield,
  ShieldCheck,
  Users,
  User,
  Award,
  DollarSign,
  TrendingUp,
  Search,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  X,
  FileText,
  UserCheck,
  Building,
  BarChart3,
  Bell,
  Clock,
  Dumbbell,
  Send,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Calendar,
  Sparkles,
  BookOpen,
  MessageSquareQuote,
  Check,
  Ban,
  CreditCard,
  Wallet
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { useNotification } from "@/context/NotificationContext";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState<GymSettings>(getStoredSettings());

  const [activeTab, setActiveTab] = useState<"ANALYTICS" | "VERIFICATIONS" | "EXPIRING" | "MEMBERS" | "TRAINERS" | "PLANS" | "CLASSES" | "EXERCISES" | "BLOG" | "SETTINGS" | "PAYMENTS">("ANALYTICS");
  const [searchMember, setSearchMember] = useState("");
  const [rangeFilter, setRangeFilter] = useState<number | undefined>(5);
  const [expiringReports, setExpiringReports] = useState<ExpiringMembershipReport[]>([]);

  // Live Database Analytics State
  const [adminDbStats, setAdminDbStats] = useState<any>(null);

  const fetchAdminDbStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminDbStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load admin stats from DB:", err);
    }
  };

  // Verification Requests Admin State
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [verificationMetrics, setVerificationMetrics] = useState<any>({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [verifStatusFilter, setVerifStatusFilter] = useState<string>("PENDING_VERIFICATION");
  const [verifSearchQuery, setVerifSearchQuery] = useState<string>("");
  const [isLoadingVerif, setIsLoadingVerif] = useState<boolean>(false);
  const [selectedVerifDetail, setSelectedVerifDetail] = useState<any>(null);
  const [rejectModalReq, setRejectModalReq] = useState<any>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>("");
  const [isProcessingApproval, setIsProcessingApproval] = useState<boolean>(false);

  const fetchVerificationRequests = async () => {
    setIsLoadingVerif(true);
    try {
      const url = `/api/admin/verification-requests?status=${encodeURIComponent(verifStatusFilter)}&search=${encodeURIComponent(verifSearchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setVerificationRequests(data.requests || []);
        setVerificationMetrics(data.metrics || { pending: 0, approved: 0, rejected: 0, total: 0 });
      }
    } catch (err) {
      console.error("Failed to load admin verification requests:", err);
    } finally {
      setIsLoadingVerif(false);
    }
  };

  useEffect(() => {
    fetchAdminDbStats();
    fetchVerificationRequests();
  }, []);

  useEffect(() => {
    fetchAdminDbStats();
    if (activeTab === "VERIFICATIONS" || activeTab === "ANALYTICS") {
      fetchVerificationRequests();
    }
  }, [activeTab, verifStatusFilter, verifSearchQuery]);

  const handleApproveRequest = async (requestId: string) => {
    if (isProcessingApproval) return;
    setIsProcessingApproval(true);
    try {
      const res = await fetch(`/api/admin/verification-requests/${requestId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Request Approved!", "Membership activated & digital pass generated.", "success");
        setSelectedVerifDetail(null);
        fetchVerificationRequests();
        fetchAdminDbStats();
      } else {
        showToast("Approval Error", data.message || "Failed to approve request", "error");
      }
    } catch (err: any) {
      showToast("Error", err?.message || "Server error approving request", "error");
    } finally {
      setIsProcessingApproval(false);
    }
  };

  const handleRejectRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalReq || !rejectionReasonInput.trim()) return;
    setIsProcessingApproval(true);
    try {
      const res = await fetch(`/api/admin/verification-requests/${rejectModalReq.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: rejectionReasonInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Request Rejected", "Member notified of rejection reason.", "info");
        setRejectModalReq(null);
        setRejectionReasonInput("");
        setSelectedVerifDetail(null);
        fetchVerificationRequests();
        fetchAdminDbStats();
      } else {
        showToast("Rejection Error", data.message || "Failed to reject request", "error");
      }
    } catch (err: any) {
      showToast("Error", err?.message || "Server error rejecting request", "error");
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // Real Backend Admin Razorpay Payments State
  const [adminTransactions, setAdminTransactions] = useState<any[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<any>(null);
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>("ALL");
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>("");
  const [isLoadingAdminPayments, setIsLoadingAdminPayments] = useState<boolean>(false);

  // Refund Modal State
  const [refundModalOrder, setRefundModalOrder] = useState<any>(null);
  const [refundReasonInput, setRefundReasonInput] = useState<string>("Customer requested refund");
  const [isSubmittingRefund, setIsSubmittingRefund] = useState<boolean>(false);

  const fetchAdminPayments = async () => {
    setIsLoadingAdminPayments(true);
    try {
      const url = `/api/admin/payments?status=${encodeURIComponent(adminStatusFilter)}&search=${encodeURIComponent(adminSearchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminTransactions(data.transactions || []);
        setAdminMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error("Failed to load admin payments:", err);
    } finally {
      setIsLoadingAdminPayments(false);
    }
  };

  useEffect(() => {
    if (activeTab === "PAYMENTS") {
      fetchAdminPayments();
    }
  }, [activeTab, adminStatusFilter, adminSearchQuery]);

  const handleExecuteRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalOrder || !refundModalOrder.payment) return;

    setIsSubmittingRefund(true);
    try {
      const res = await fetch("/api/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: refundModalOrder.payment.id,
          reason: refundReasonInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Refund Processed!", `Razorpay Refund ID ${data.refundId} issued.`, "success");
        setRefundModalOrder(null);
        fetchAdminPayments();
        fetchAdminDbStats();
      } else {
        showToast("Refund Error", data.message || "Failed to issue refund", "error");
      }
    } catch (err: any) {
      showToast("Refund Failed", err?.message || "Network error issuing refund", "error");
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  // Modals
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemName, setNewMemName] = useState("");
  const [newMemEmail, setNewMemEmail] = useState("");
  const [newMemPhone, setNewMemPhone] = useState("");

  const [isAddTrainerOpen, setIsAddTrainerOpen] = useState(false);
  const [trName, setTrName] = useState("");
  const [trEmail, setTrEmail] = useState("");
  const [trPhone, setTrPhone] = useState("");
  const [trSpec, setTrSpec] = useState("Strength & Conditioning");

  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState(3999);
  const [planDesc, setPlanDesc] = useState("");

  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [clsName, setClsName] = useState("");
  const [clsCategory, setClsCategory] = useState<any>("HIIT");
  const [clsCapacity, setClsCapacity] = useState(20);

  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [exName, setExName] = useState("");
  const [exBodyPart, setExBodyPart] = useState<any>("Chest");
  const [exEquip, setExEquip] = useState<any>("Barbell");
  const [exDiff, setExDiff] = useState<any>("Intermediate");
  const [exInstructions, setExInstructions] = useState("");

  const [exercises, setExercises] = useState<any[]>([]);
  const [editingImageExercise, setEditingImageExercise] = useState<any | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");

  const handleSaveExerciseImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImageExercise) return;
    const updated = exercises.map((ex) =>
      ex.id === editingImageExercise.id ? { ...ex, imageUrl: editImageUrl } : ex
    );
    setExercises(updated);
    saveExercises(updated);
    showToast("Exercise Image Updated", `Updated image mapping for ${editingImageExercise.name}`, "success");
    setEditingImageExercise(null);
  };

  const [isAddBlogOpen, setIsAddBlogOpen] = useState(false);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogCategory, setBlogCategory] = useState<any>("Fitness");

  const loadAllData = () => {
    setMembers(getStoredMembers());
    setUsers(getStoredUsers());
    setTrainers(getStoredTrainers());
    setPlans(getStoredPlans());
    setClasses(getStoredClasses());
    setExercises(getStoredExercises());
    setLeads(getStoredLeads());
    setInvoices(getStoredInvoices());
    setBlogPosts(getStoredBlogPosts());
    setTestimonials(getStoredTestimonials());
    setSettings(getStoredSettings());

    const r = getExpiringMembershipsReport(rangeFilter);
    setExpiringReports(r);
  };

  useEffect(() => {
    loadAllData();
  }, [rangeFilter]);

  // Aggregate Dynamic Business Statistics from Live Database API
  const totalRevenue = adminDbStats ? adminDbStats.totalRevenue : 0;
  const activeMembersCount = adminDbStats ? adminDbStats.activeMembers : 0;
  const urgentExpiringCount = adminDbStats ? adminDbStats.expiringSoonCount : 0;
  const chartData = adminDbStats?.revenueChartData || [];

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemName || !newMemEmail) {
      showToast("Missing Info", "Please enter member name and email.", "error");
      return;
    }

    const uId = `usr-mem-${Date.now()}`;
    const newUserObj = {
      id: uId,
      email: newMemEmail,
      name: newMemName,
      phone: newMemPhone || "+91 98000 11111",
      role: "MEMBER" as const,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newMemName)}`,
      branchId: "branch-1",
      createdAt: new Date().toISOString(),
    };

    const newMemObj: MemberProfile = {
      id: `mem-${Date.now()}`,
      userId: uId,
      qrCode: `APEX-MEM-${Math.floor(100000 + Math.random() * 900000)}`,
      membershipStatus: "ACTIVE",
      currentPlanId: plans[0]?.id || "plan-pro",
      joinDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };

    const updatedUsers = [...users, newUserObj];
    const updatedMembers = [...members, newMemObj];

    setUsers(updatedUsers);
    setMembers(updatedMembers);
    saveUsers(updatedUsers);
    saveMembers(updatedMembers);

    showToast("Member Registered!", `Added ${newMemName} to database.`, "success");
    setIsAddMemberOpen(false);
    loadAllData();
  };

  const handleCreateTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trName || !trEmail) return;

    const uId = `usr-tr-${Date.now()}`;
    const newUserObj = {
      id: uId,
      email: trEmail,
      name: trName,
      role: "TRAINER" as const,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trName)}`,
      createdAt: new Date().toISOString(),
    };

    const newTrObj: TrainerProfile = {
      id: `tr-${Date.now()}`,
      userId: uId,
      name: trName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trName)}`,
      bio: "Certified fitness specialist.",
      specialization: trSpec,
      experienceYears: 5,
      rating: 5.0,
      certifications: ["ACE Certified"],
      languages: ["English"],
      isAvailable: true,
    };

    const updatedUsers = [...users, newUserObj];
    const updatedTrainers = [...trainers, newTrObj];

    setUsers(updatedUsers);
    setTrainers(updatedTrainers);
    saveUsers(updatedUsers);
    saveTrainers(updatedTrainers);

    showToast("Trainer Created!", `Registered coach ${trName}.`, "success");
    setIsAddTrainerOpen(false);
    loadAllData();
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName) return;

    const newPlan: MembershipPlan = {
      id: `plan-${Date.now()}`,
      name: planName,
      description: planDesc || "High performance gym access.",
      priceMonthly: Number(planPrice),
      priceSixMonths: Number(planPrice) * 6,
      priceYearly: Number(planPrice) * 10,
      features: ["Full Gym Floor Access", "Locker Room Access", "Digital Key Pass"],
      isPopular: false,
      trialDays: 3,
    };

    const updated = [...plans, newPlan];
    setPlans(updated);
    savePlans(updated);
    showToast("Membership Plan Created!", `Added ${planName} (₹${planPrice}/mo).`, "success");
    setIsAddPlanOpen(false);
    loadAllData();
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clsName) return;

    const assignedTrainer = trainers[0];
    const newClass: ClassItem = {
      id: `cls-${Date.now()}`,
      name: clsName,
      description: "Dynamic group session led by certified coaches.",
      category: clsCategory,
      trainerId: assignedTrainer ? assignedTrainer.id : "tr-1",
      trainerName: assignedTrainer ? assignedTrainer.name : "Marcus Vance",
      scheduleTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      durationMins: 45,
      capacity: Number(clsCapacity),
      bookedCount: 0,
      location: "Studio 1",
      intensity: "Intermediate",
    };

    const updated = [...classes, newClass];
    setClasses(updated);
    saveClasses(updated);
    showToast("Class Scheduled!", `Added ${clsName} to timetable.`, "success");
    setIsAddClassOpen(false);
    loadAllData();
  };

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exName) return;

    const newEx = {
      id: `ex-${Date.now()}`,
      name: exName,
      muscleGroup: exBodyPart === "Abs" || exBodyPart === "Obliques" || exBodyPart === "Lower Back" ? "Core" : exBodyPart === "Quadriceps" || exBodyPart === "Hamstrings" || exBodyPart === "Glutes" || exBodyPart === "Calves" ? "Legs" : "Upper Body",
      primaryBodyPart: exBodyPart,
      equipment: exEquip,
      difficulty: exDiff,
      instructions: exInstructions ? exInstructions.split("\n").filter(Boolean) : ["Perform movement under controlled tempo."],
      imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
      setsDefault: 4,
      repsDefault: 10,
    };

    const updated = [...exercises, newEx];
    setExercises(updated);
    saveExercises(updated);
    showToast("Exercise Added!", `Created exercise ${exName}.`, "success");
    setIsAddExerciseOpen(false);
    loadAllData();
  };

  const handleCreateBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle) return;

    const newPost: BlogPost = {
      id: `post-${Date.now()}`,
      title: blogTitle,
      slug: blogTitle.toLowerCase().replace(/ /g, "-"),
      summary: blogContent.substring(0, 100) + "...",
      content: blogContent,
      coverImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
      category: blogCategory,
      authorName: user?.name || "Admin",
      publishedAt: new Date().toISOString().split("T")[0],
      readTimeMins: 4,
    };

    const updated = [...blogPosts, newPost];
    setBlogPosts(updated);
    saveBlogPosts(updated);
    showToast("Blog Published!", `Published article: ${blogTitle}`, "success");
    setIsAddBlogOpen(false);
    loadAllData();
  };

  const handleDeleteMember = (memberId: string) => {
    const updated = members.filter((m) => m.id !== memberId);
    setMembers(updated);
    saveMembers(updated);
    showToast("Member Deleted", "Removed member from database.", "info");
  };

  const handleDeleteTrainer = (trId: string) => {
    const updated = trainers.filter((t) => t.id !== trId);
    setTrainers(updated);
    saveTrainers(updated);
    showToast("Trainer Removed", "Deleted trainer profile.", "info");
  };

  const handleDeletePlan = (planId: string) => {
    const updated = plans.filter((p) => p.id !== planId);
    setPlans(updated);
    savePlans(updated);
    showToast("Plan Deleted", "Removed plan from catalog.", "info");
  };

  const handleDeleteClass = (clsId: string) => {
    const updated = classes.filter((c) => c.id !== clsId);
    setClasses(updated);
    saveClasses(updated);
    showToast("Class Cancelled", "Removed class from timetable.", "info");
  };

  const handleTriggerManualReminder = async (memberId: string) => {
    await runMembershipExpiryCheck({ forceSend: true });
    showToast("Manual Reminder Sent!", "Dispatched renewal notification.", "success");
    loadAllData();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    showToast("Notification Settings Saved!", "Updated system configuration.", "success");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Executive Portal</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              ADMIN COMMAND CENTER
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase shadow-neon flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Dynamic Database Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Gross Revenue (Database)</span>
          <div className="text-3xl font-black text-cyan-400 font-display">
            {formatCurrency(totalRevenue)}
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">{invoices.length} Payment Transactions</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Active Subscriptions</span>
          <div className="text-3xl font-black text-white font-display">{activeMembersCount}</div>
          <span className="text-[11px] text-emerald-400 font-semibold">Live Registered Members</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Expiring Reminders (≤5 Days)</span>
          <div className="text-3xl font-black text-rose-400 font-display">{urgentExpiringCount}</div>
          <span className="text-[11px] text-cyan-400 font-semibold">Automated Scheduler Active</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Classes Scheduled</span>
          <div className="text-3xl font-black text-amber-400 font-display">{classes.length}</div>
          <span className="text-[11px] text-slate-400 font-semibold">{trainers.length} Active Coaches</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {(["ANALYTICS", "VERIFICATIONS", "EXPIRING", "MEMBERS", "TRAINERS", "PLANS", "CLASSES", "EXERCISES", "BLOG", "SETTINGS", "PAYMENTS"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === tab
                ? "bg-cyan-500 text-slate-950 shadow-neon font-black"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <span>
              {tab === "VERIFICATIONS"
                ? "MEMBERSHIP VERIFICATIONS"
                : tab === "EXPIRING"
                ? "EXPIRING MEMBERSHIPS"
                : tab === "PAYMENTS"
                ? "PAYMENTS & REVENUE"
                : tab.replace("_", " ")}
            </span>
            {tab === "VERIFICATIONS" && verificationMetrics.pending > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                {verificationMetrics.pending} PENDING
              </span>
            )}
          </button>
        ))}
      </div>

      {/* MEMBERSHIP VERIFICATION REQUESTS SECTION */}
      {activeTab === "VERIFICATIONS" && (
        <div className="space-y-6">
          {/* Section Header & Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Pending Verifications</span>
              <div className="text-3xl font-black text-amber-400 font-display">{verificationMetrics.pending}</div>
              <span className="text-[11px] text-amber-300 font-semibold">Requires Admin Action</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Approved Passes</span>
              <div className="text-3xl font-black text-emerald-400 font-display">{verificationMetrics.approved}</div>
              <span className="text-[11px] text-emerald-300 font-semibold">Active Gym Passes</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Rejected Requests</span>
              <div className="text-3xl font-black text-rose-400 font-display">{verificationMetrics.rejected}</div>
              <span className="text-[11px] text-rose-300 font-semibold">Invalid Payment Refs</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Requests Submitted</span>
              <div className="text-3xl font-black text-white font-display">{verificationMetrics.total}</div>
              <span className="text-[11px] text-cyan-400 font-semibold">Lifetime Submissions</span>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {(["PENDING_VERIFICATION", "APPROVED", "REJECTED", "ALL"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setVerifStatusFilter(st)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      verifStatusFilter === st
                        ? "bg-cyan-500 text-slate-950 font-black shadow-neon"
                        : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {st === "PENDING_VERIFICATION"
                      ? "Pending Only"
                      : st === "APPROVED"
                      ? "Approved"
                      : st === "REJECTED"
                      ? "Rejected"
                      : "All Statuses"}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search member, ID, or UTR..."
                  value={verifSearchQuery}
                  onChange={(e) => setVerifSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Requests Table */}
            {isLoadingVerif ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading verification requests...</div>
            ) : verificationRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <p className="text-xs">No verification requests found for selected filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-4">Member Info</th>
                      <th className="p-4">Plan Selected</th>
                      <th className="p-4">Amount & Method</th>
                      <th className="p-4">Transaction UTR Ref</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Submitted Date</th>
                      <th className="p-4 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {verificationRequests.map((reqItem) => (
                      <tr key={reqItem.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                              {reqItem.user?.avatar ? (
                                <img src={reqItem.user.avatar} alt={reqItem.user.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-bold text-slate-400">{reqItem.user?.name?.charAt(0) || "M"}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-extrabold text-white">{reqItem.user?.name || "Member"}</div>
                              <div className="text-[11px] text-slate-400">{reqItem.user?.email}</div>
                              <div className="text-[10px] text-cyan-400 font-mono">ID: {reqItem.memberId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-white">{reqItem.plan?.name || "Plan"}</div>
                          <div className="text-[11px] text-cyan-400 font-semibold">{reqItem.billingCycle}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-black text-white">₹{reqItem.amount}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{reqItem.paymentMethod}</div>
                        </td>
                        <td className="p-4 font-mono font-bold text-cyan-300">{reqItem.transactionRef}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              reqItem.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : reqItem.status === "PENDING_VERIFICATION"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {reqItem.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(reqItem.requestDate).toLocaleDateString()}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedVerifDetail(reqItem)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-bold transition-all"
                          >
                            View & Verify
                          </button>
                          {reqItem.status === "PENDING_VERIFICATION" && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(reqItem.id)}
                                disabled={isProcessingApproval}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectModalReq(reqItem)}
                                disabled={isProcessingApproval}
                                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-[11px] font-bold transition-all"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "ANALYTICS" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase">Live Database Analytics</span>
              <h3 className="text-xl font-bold text-white font-display">Revenue Growth Chart</h3>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="py-16 text-center bg-slate-950 border border-slate-800 rounded-2xl p-8 space-y-3">
              <BarChart3 className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-base font-bold text-white">No Payment Data Recorded Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Financial growth charts dynamically aggregate actual database payment transactions. Once members subscribe or renew memberships, live analytics will render here.
              </p>
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "12px" }} />
                  <Bar dataKey="revenue" fill="#00f0ff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* EXPIRING MEMBERSHIPS TAB */}
      {activeTab === "EXPIRING" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase">Automated Renewal Oversight</span>
              <h3 className="text-xl font-bold text-white font-display">Memberships Expiring Soon</h3>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { label: "5 Days", value: 5 },
                { label: "Today (0 Days)", value: 0 },
                { label: "7 Days", value: 7 },
                { label: "30 Days", value: 30 },
                { label: "Expired", value: -1 },
                { label: "All Members", value: undefined },
              ].map((filter) => (
                <button
                  key={String(filter.value)}
                  onClick={() => setRangeFilter(filter.value)}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                    rangeFilter === filter.value
                      ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                  <th className="py-3.5 px-4 font-bold">Member Name & Email</th>
                  <th className="py-3.5 px-4 font-bold">Membership Plan</th>
                  <th className="py-3.5 px-4 font-bold">Expiry Date</th>
                  <th className="py-3.5 px-4 font-bold">Days Remaining</th>
                  <th className="py-3.5 px-4 font-bold">Reminder Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Manual Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expiringReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No memberships matching selected expiry range ({rangeFilter ?? "all"}).
                    </td>
                  </tr>
                ) : (
                  expiringReports.map((r) => (
                    <tr key={r.memberId} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white block">{r.memberName}</span>
                        <span className="text-[10px] text-slate-400">{r.memberEmail}</span>
                      </td>
                      <td className="py-3.5 px-4 text-cyan-400 font-semibold">{r.planName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{formatDate(r.expiryDate)}</td>
                      <td className="py-3.5 px-4 font-bold">
                        {r.daysRemaining <= 5 && r.daysRemaining >= 0 ? (
                          <span className="text-rose-400 font-black">⚠️ {r.daysRemaining} Days</span>
                        ) : r.daysRemaining < 0 ? (
                          <span className="text-amber-400">Expired ({Math.abs(r.daysRemaining)}d ago)</span>
                        ) : (
                          <span className="text-emerald-400">{r.daysRemaining} Days</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.reminderStatus === "SENT"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {r.reminderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleTriggerManualReminder(r.memberId)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-[10px] transition-colors inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send Reminder</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MEMBERS TAB */}
      {activeTab === "MEMBERS" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white">Member Directory (Database CRUD)</h3>
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold uppercase shadow-neon"
            >
              + Create Member
            </button>
          </div>

          {members.length === 0 ? (
            <div className="py-12 text-center bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No Members Registered Yet</h4>
              <p className="text-xs text-slate-400 mt-1">Add your first gym member to begin managing subscriptions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4 font-bold">Member Name</th>
                    <th className="py-3 px-4 font-bold">QR Key Pass</th>
                    <th className="py-3 px-4 font-bold">Expiry Date</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {members.map((m) => {
                    const uObj = users.find((u) => u.id === m.userId);
                    return (
                      <tr key={m.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-white">{uObj?.name || "Gym Member"}</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">{m.qrCode}</td>
                        <td className="py-3 px-4 font-mono text-slate-300">{m.expiryDate}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            m.membershipStatus === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          }`}>
                            {m.membershipStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleDeleteMember(m.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 text-[10px] font-bold hover:bg-rose-500/20"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TRAINERS TAB */}
      {activeTab === "TRAINERS" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Trainer Roster (CRUD)</h3>
            <button
              onClick={() => setIsAddTrainerOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold uppercase shadow-neon"
            >
              + Create Trainer Profile
            </button>
          </div>

          {trainers.length === 0 ? (
            <div className="py-12 text-center bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <Award className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No Trainers On Roster</h4>
              <p className="text-xs text-slate-400 mt-1">Add certified fitness coaches to assign group classes and workouts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainers.map((tr) => (
                <div key={tr.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{tr.name}</h4>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold text-[10px]">
                      {tr.specialization}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{tr.bio}</p>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">{tr.experienceYears} Years Exp</span>
                    <button
                      onClick={() => handleDeleteTrainer(tr.id)}
                      className="text-rose-400 hover:underline font-bold"
                    >
                      Delete Trainer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PLANS TAB */}
      {activeTab === "PLANS" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Membership Plan Catalog (CRUD)</h3>
            <button
              onClick={() => setIsAddPlanOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold uppercase shadow-neon"
            >
              + Create New Plan
            </button>
          </div>

          {plans.length === 0 ? (
            <div className="py-12 text-center bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <Building className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No Membership Plans Created</h4>
              <p className="text-xs text-slate-400 mt-1">Create membership packages to enable online member registration.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <h4 className="font-extrabold text-white text-base">{p.name}</h4>
                    <span className="font-mono text-cyan-400 font-bold text-sm">₹{p.priceMonthly}/mo</span>
                  </div>
                  <p className="text-slate-400">{p.description}</p>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-slate-500 text-[10px]">{p.features.length} Features</span>
                    <button
                      onClick={() => handleDeletePlan(p.id)}
                      className="text-rose-400 hover:underline font-bold text-[11px]"
                    >
                      Delete Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CLASSES TAB */}
      {activeTab === "CLASSES" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Class Timetable (CRUD)</h3>
            <button
              onClick={() => setIsAddClassOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold uppercase shadow-neon"
            >
              + Schedule New Class
            </button>
          </div>

          {classes.length === 0 ? (
            <div className="py-12 text-center bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No Classes Scheduled</h4>
              <p className="text-xs text-slate-400 mt-1">Schedule group HIIT, Yoga, or Strength sessions for members to book.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((cls) => (
                <div key={cls.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-white text-sm">{cls.name}</h4>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold text-[10px]">
                      {cls.category}
                    </span>
                  </div>
                  <p className="text-slate-400">{cls.description}</p>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Coach: {cls.trainerName} • Cap: {cls.capacity}</span>
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="text-rose-400 hover:underline font-bold"
                    >
                      Cancel Class
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EXERCISES TAB */}
      {activeTab === "EXERCISES" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Asset & Catalog Management</span>
              <h3 className="text-lg font-bold text-white font-display">Exercise Library & Image Manager</h3>
            </div>
            <button
              onClick={() => setIsAddExerciseOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold uppercase shadow-neon"
            >
              + Create New Exercise
            </button>
          </div>

          {exercises.length === 0 ? (
            <div className="py-12 text-center bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <Dumbbell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No Exercises in Library</h4>
              <p className="text-xs text-slate-400 mt-1">Add exercise movements to populate the body-part exercise catalog.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exercises.map((ex) => (
                <div key={ex.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs overflow-hidden flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="relative h-32 w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                      <img
                        src={ex.imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%230f172a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-family='sans-serif' font-size='20' font-weight='bold'%3EImage Unavailable%3C/text%3E%3C/svg%3E"}
                        alt={ex.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-cyan-950/80 backdrop-blur-md border border-cyan-500/30 text-cyan-400 font-bold text-[10px]">
                        {ex.primaryBodyPart}
                      </span>
                    </div>

                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">{ex.name}</h4>
                        <p className="text-slate-400 text-[11px]">Eq: {ex.equipment} • Diff: {ex.difficulty}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setEditingImageExercise(ex);
                        setEditImageUrl(ex.imageUrl || "");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold text-[11px] flex items-center gap-1.5"
                    >
                      <Edit className="w-3 h-3" /> Edit Exercise Image
                    </button>
                    <button
                      onClick={() => {
                        const updated = exercises.filter((e) => e.id !== ex.id);
                        setExercises(updated);
                        saveExercises(updated);
                        showToast("Exercise Deleted", "Removed movement from library.", "info");
                      }}
                      className="text-rose-400 hover:underline font-bold text-[10px]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BLOG TAB */}
      {activeTab === "BLOG" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Blog Content Management (CRUD)</h3>
            <button
              onClick={() => setIsAddBlogOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold uppercase shadow-neon"
            >
              + Publish New Article
            </button>
          </div>

          {blogPosts.length === 0 ? (
            <div className="py-12 text-center bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No Blog Articles Published</h4>
              <p className="text-xs text-slate-400 mt-1">Publish fitness and nutrition guides to educate your gym members.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blogPosts.map((post) => (
                <div key={post.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white text-sm">{post.title}</h4>
                    <span className="text-slate-400 text-[11px]">{post.category} • Published: {post.publishedAt}</span>
                  </div>
                  <button
                    onClick={() => {
                      const updated = blogPosts.filter((b) => b.id !== post.id);
                      setBlogPosts(updated);
                      saveBlogPosts(updated);
                      showToast("Post Deleted", "Removed article from blog.", "info");
                    }}
                    className="text-rose-400 font-bold hover:underline"
                  >
                    Delete Post
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NOTIFICATION SETTINGS CONTROLS */}
      {activeTab === "SETTINGS" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl space-y-6 shadow-xl">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase">System Configuration</span>
            <h3 className="text-xl font-bold text-white font-display">Membership Expiry Notification Settings</h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <span className="font-bold text-white block">Enable Expiry Reminders</span>
                <span className="text-slate-400 text-[11px]">Automatically trigger renewal notifications before expiry.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableExpiryReminders}
                onChange={(e) => setSettings({ ...settings, enableExpiryReminders: e.target.checked })}
                className="w-5 h-5 accent-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">
                Reminder Threshold (Days Before Expiry)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.reminderDaysBefore}
                onChange={(e) => setSettings({ ...settings, reminderDaysBefore: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase shadow-neon"
            >
              Save Notification Settings
            </button>
          </form>
        </div>
      )}

      {/* CREATE MEMBER MODAL */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Create Member Profile</h3>
              <button onClick={() => setIsAddMemberOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateMember} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newMemName}
                  onChange={(e) => setNewMemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newMemEmail}
                  onChange={(e) => setNewMemEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold uppercase shadow-neon"
              >
                Save Member Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TRAINER MODAL */}
      {isAddTrainerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Create Trainer Profile</h3>
              <button onClick={() => setIsAddTrainerOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTrainer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Coach Name</label>
                <input
                  type="text"
                  required
                  value={trName}
                  onChange={(e) => setTrName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={trEmail}
                  onChange={(e) => setTrEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold uppercase shadow-neon"
              >
                Save Trainer Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PLAN MODAL */}
      {isAddPlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Create Membership Plan</h3>
              <button onClick={() => setIsAddPlanOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePlan} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Plan Title</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Monthly Price (₹)</label>
                <input
                  type="number"
                  required
                  value={planPrice}
                  onChange={(e) => setPlanPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold uppercase shadow-neon"
              >
                Save Plan to Catalog
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CLASS MODAL */}
      {isAddClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Schedule Group Class</h3>
              <button onClick={() => setIsAddClassOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Class Title</label>
                <input
                  type="text"
                  required
                  value={clsName}
                  onChange={(e) => setClsName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold uppercase shadow-neon"
              >
                Save Class Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE EXERCISE MODAL */}
      {isAddExerciseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Add Exercise to Library</h3>
              <button onClick={() => setIsAddExerciseOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateExercise} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Exercise Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incline Dumbbell Bench Press"
                  value={exName}
                  onChange={(e) => setExName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Primary Target Body Part</label>
                <select
                  value={exBodyPart}
                  onChange={(e) => setExBodyPart(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none"
                >
                  {["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Forearms", "Abs", "Obliques", "Lower Back", "Quadriceps", "Hamstrings", "Glutes", "Calves", "Adductors", "Abductors", "Full Body"].map((bp) => (
                    <option key={bp} value={bp}>{bp}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Equipment</label>
                  <select
                    value={exEquip}
                    onChange={(e) => setExEquip(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    {["Barbell", "Dumbbell", "Cable", "Machine", "Bodyweight", "Kettlebell"].map((eq) => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Difficulty</label>
                  <select
                    value={exDiff}
                    onChange={(e) => setExDiff(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Instructions (One per line)</label>
                <textarea
                  rows={3}
                  placeholder="Lower bar under control..."
                  value={exInstructions}
                  onChange={(e) => setExInstructions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold uppercase shadow-neon"
              >
                Save Exercise to Database
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE BLOG MODAL */}
      {isAddBlogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Publish Blog Post</h3>
              <button onClick={() => setIsAddBlogOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateBlog} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Article Content</label>
                <textarea
                  rows={4}
                  required
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold uppercase shadow-neon"
              >
                Publish Article
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EXERCISE IMAGE MODAL */}
      {editingImageExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Edit Exercise Image</h3>
              <button onClick={() => setEditingImageExercise(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExerciseImage} className="space-y-4 text-xs">
              <div>
                <span className="text-white font-bold block text-sm mb-1">{editingImageExercise.name}</span>
                <span className="text-slate-400 text-[11px] block mb-3">
                  Category: {editingImageExercise.primaryBodyPart} • Equipment: {editingImageExercise.equipment}
                </span>
              </div>

              <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={editImageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%230f172a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-family='sans-serif' font-size='20' font-weight='bold'%3EImage Unavailable%3C/text%3E%3C/svg%3E"}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-950/80 backdrop-blur-md text-[10px] text-cyan-400 font-bold border border-slate-800">
                  Live Preview
                </span>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">
                  Image Asset Path or Image URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="/images/exercises/quadriceps/barbell_back_squat.webp"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditImageUrl("")}
                  className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase text-[11px]"
                >
                  Remove Image
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold uppercase shadow-neon text-[11px]"
                >
                  Save Image Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* PAYMENTS & REVENUE TAB (Razorpay Integration) */}
      {activeTab === "PAYMENTS" && (
        <div className="space-y-6">
          {/* Revenue Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Net Revenue</span>
              <div className="text-2xl font-black text-cyan-400 font-display">
                {formatCurrency(adminMetrics?.totalRevenue || 0)}
              </div>
              <span className="text-[10px] text-slate-400">Verified Razorpay Payments</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Successful Transactions</span>
              <div className="text-2xl font-black text-emerald-400 font-display">
                {adminMetrics?.successfulPayments || 0}
              </div>
              <span className="text-[10px] text-slate-400">Paid & Activated Passes</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Pending & Failed</span>
              <div className="text-2xl font-black text-amber-400 font-display">
                {(adminMetrics?.pendingPayments || 0) + (adminMetrics?.failedPayments || 0)}
              </div>
              <span className="text-[10px] text-slate-400">
                {adminMetrics?.pendingPayments || 0} Pending • {adminMetrics?.failedPayments || 0} Failed
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Refunds</span>
              <div className="text-2xl font-black text-purple-400 font-display">
                {formatCurrency(adminMetrics?.totalRefundsAmount || 0)}
              </div>
              <span className="text-[10px] text-slate-400">{adminMetrics?.refundedPayments || 0} Refunded Orders</span>
            </div>
          </div>

          {/* Transaction Filter Controls & Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Razorpay Transactions Master Ledger</h3>
                <p className="text-xs text-slate-400">System-wide transaction audit, status filters, and admin refund tools.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search Order / Email..."
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-cyan-400 w-full sm:w-48"
                />

                {/* Status Filter Selector */}
                <select
                  value={adminStatusFilter}
                  onChange={(e) => setAdminStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-cyan-400 w-full sm:w-auto"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                  <option value="FAILED">FAILED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>

                <button
                  onClick={fetchAdminPayments}
                  disabled={isLoadingAdminPayments}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold transition-all shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingAdminPayments ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {isLoadingAdminPayments ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Fetching transaction ledger...</p>
              </div>
            ) : adminTransactions.length === 0 ? (
              <div className="py-16 text-center bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-2">
                <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Transactions Match Filter</h4>
                <p className="text-xs text-slate-400">Try adjusting your status filter or search parameters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">User Details</th>
                      <th className="p-4">Razorpay Order ID</th>
                      <th className="p-4">Item / Plan</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {adminTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 font-mono text-[11px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-white block">{tx.user?.name || "Member"}</span>
                          <span className="text-slate-500 text-[11px]">{tx.user?.email}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-cyan-400">
                          {tx.orderId}
                          {tx.payment?.paymentId && (
                            <span className="text-[10px] text-slate-500 block font-normal">
                              Pay ID: {tx.payment.paymentId}
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-semibold text-slate-200">
                          {tx.planName}
                        </td>
                        <td className="p-4 font-black text-white">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              tx.status === "PAID"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : tx.status === "FAILED"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                                : tx.status === "REFUNDED"
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {tx.status === "PAID" && tx.payment && (
                            <button
                              onClick={() => setRefundModalOrder(tx)}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-all"
                            >
                              Initiate Refund
                            </button>
                          )}
                          {tx.status === "REFUNDED" && (
                            <span className="text-[11px] text-purple-400 font-bold">Refunded</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN REFUND CONFIRMATION MODAL */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Process Razorpay Refund</h3>
              <button onClick={() => setRefundModalOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteRefund} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Order ID:</span>
                  <span className="text-cyan-400 font-mono font-bold">{refundModalOrder.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Member:</span>
                  <span className="text-white font-bold">{refundModalOrder.user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Refund Amount:</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(refundModalOrder.amount)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">
                  Reason for Refund (Optional)
                </label>
                <input
                  type="text"
                  required
                  value={refundReasonInput}
                  onChange={(e) => setRefundReasonInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRefundModalOrder(null)}
                  className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRefund}
                  className="w-2/3 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold uppercase shadow-neon text-[11px] flex items-center justify-center gap-1.5"
                >
                  {isSubmittingRefund ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirm & Issue Refund"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERIFICATION REQUEST DETAIL INSPECTION MODAL */}
      {selectedVerifDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-extrabold text-white font-display">
                  Cross-Check & Verify Membership Payment
                </span>
              </div>
              <button onClick={() => setSelectedVerifDetail(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Member Card Summary */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {selectedVerifDetail.user?.avatar ? (
                    <img src={selectedVerifDetail.user.avatar} alt={selectedVerifDetail.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-slate-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-base font-black text-white">{selectedVerifDetail.user?.name}</h4>
                  <p className="text-xs text-slate-400">{selectedVerifDetail.user?.email} • {selectedVerifDetail.user?.phone || "No Phone"}</p>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">Member ID: {selectedVerifDetail.memberId}</span>
                </div>
              </div>

              {/* Transaction Details Grid */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Membership Plan Selected:</span>
                  <span className="font-extrabold text-white">{selectedVerifDetail.plan?.name || "Gym Plan"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Selected Billing Cycle:</span>
                  <span className="font-extrabold text-cyan-400">{selectedVerifDetail.billingCycle}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Amount Paid:</span>
                  <span className="font-black text-emerald-400 text-sm">₹{selectedVerifDetail.amount}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Payment Method:</span>
                  <span className="font-mono text-slate-200">{selectedVerifDetail.paymentMethod}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Transaction Ref / UTR:</span>
                  <span className="font-mono font-bold text-cyan-300">{selectedVerifDetail.transactionRef}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Submission Date:</span>
                  <span className="text-slate-300">{new Date(selectedVerifDetail.requestDate).toLocaleString()}</span>
                </div>
              </div>

              {/* Receipt Proof Preview Link */}
              {selectedVerifDetail.receiptUrl && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Proof / Receipt:</span>
                  <a
                    href={selectedVerifDetail.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 underline font-mono hover:text-cyan-300 break-all"
                  >
                    {selectedVerifDetail.receiptUrl}
                  </a>
                </div>
              )}

              {/* Cross-Check Verification Notice */}
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs space-y-1">
                <span className="font-bold block">Admin Cross-Verification Checklist:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-cyan-200/80">
                  <li>Verify UTR <strong>{selectedVerifDetail.transactionRef}</strong> in bank statement / merchant portal.</li>
                  <li>Confirm total payment amount of <strong>₹{selectedVerifDetail.amount}</strong> was received.</li>
                  <li>Clicking Approve will calculate validity from today and generate active reception pass.</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {selectedVerifDetail.status === "PENDING_VERIFICATION" ? (
                  <>
                    <button
                      onClick={() => setRejectModalReq(selectedVerifDetail)}
                      className="w-1/3 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-bold text-xs uppercase transition-all"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={() => handleApproveRequest(selectedVerifDetail.id)}
                      disabled={isProcessingApproval}
                      className="w-2/3 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessingApproval ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Approve & Issue Pass</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectedVerifDetail(null)}
                    className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase"
                  >
                    Close Inspection
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white font-display">Reject Verification Request</h3>
              <button onClick={() => setRejectModalReq(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRejectRequest} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <p className="text-slate-300">Rejecting request for <strong className="text-white">{rejectModalReq.user?.name}</strong></p>
                <p className="text-slate-400 font-mono">Ref: {rejectModalReq.transactionRef} (₹{rejectModalReq.amount})</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Rejection Reason <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Transaction UTR reference not found in bank statement, or invalid receipt attached."
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRejectModalReq(null)}
                  className="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingApproval || !rejectionReasonInput.trim()}
                  className="w-2/3 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessingApproval ? "Processing..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

