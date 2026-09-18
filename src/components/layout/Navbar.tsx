"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useGymBranch } from "@/context/GymBranchContext";
import { GlobalSearchModal } from "@/components/ui/GlobalSearchModal";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  Dumbbell,
  Sun,
  Moon,
  Search,
  Menu,
  X,
  MapPin,
  ChevronDown,
  UserCheck,
  Shield,
  User as UserIcon,
  QrCode,
  LogOut
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { branches, selectedBranch, selectBranch } = useGymBranch();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Membership", href: "/membership" },
    { name: "Classes", href: "/classes" },
    { name: "Trainers", href: "/trainers" },
    { name: "Exercise Library", href: "/exercises" },
    { name: "Nutrition", href: "/nutrition" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const getDashboardHref = () => {
    if (role === "ADMIN" || role === "STAFF") return "/dashboard/admin";
    if (role === "TRAINER") return "/dashboard/trainer";
    return "/dashboard/member";
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl transition-all">
        {/* Top Announcement & Branch Selector Strip */}
        <div className="hidden md:flex items-center justify-between px-6 py-1.5 bg-slate-900/60 border-b border-slate-800/50 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">FITNESS DRIVE Open: 24/7 VIP Access</span>
            <span className="text-slate-600">|</span>
            <span>Owner: Chetan (+91 88800 77188)</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Gym Branch Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors font-medium text-[11px]"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedBranch.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {isBranchDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1">
                    Select Gym Branch
                  </div>
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        selectBranch(b.id);
                        setIsBranchDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        selectedBranch.id === b.id
                          ? "bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span>{b.name}</span>
                      <span className="text-[10px] text-slate-500">{b.city}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link href="/qr-scanner" className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors text-[11px]">
              <QrCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Scanner Station</span>
            </Link>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 via-cyan-400 to-blue-600 shadow-neon group-hover:scale-105 transition-transform">
              <Dumbbell className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white font-display">
                FITNESS <span className="text-cyan-400">DRIVE</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                High Performance Club
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs transition-colors"
              title="Search (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search</span>
              <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-400 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth / Dashboard Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={getDashboardHref()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 text-xs font-bold transition-all shadow-md"
                >
                  {role === "ADMIN" ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  <span>{user.name.split(" ")[0]}'s Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-slate-400 hover:text-rose-400 px-2 py-2 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/membership"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase shadow-neon transition-all hover:scale-105"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    pathname === link.href
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              {user ? (
                <div className="space-y-2">
                  <Link
                    href={getDashboardHref()}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs uppercase"
                  >
                    <UserIcon className="w-4 h-4" />
                    Go to {role} Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout Account
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-3 text-center rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200"
                  >
                    Member Login
                  </Link>
                  <Link
                    href="/membership"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-3 text-center rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-neon"
                  >
                    Join Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
