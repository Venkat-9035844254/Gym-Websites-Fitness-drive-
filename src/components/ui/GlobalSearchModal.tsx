"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Dumbbell, Calendar, BookOpen, Users, Award, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { getStoredTrainers, getStoredClasses, getStoredExercises } from "@/lib/storage";
import { INITIAL_BLOG_POSTS, INITIAL_PLANS } from "@/lib/seedData";
import { Exercise, BlogPost, MembershipPlan } from "@/types";

interface SearchResultItem {
  id: string;
  type: "class" | "trainer" | "exercise" | "blog" | "plan";
  title: string;
  subtitle: string;
  url: string;
}

export function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const items: SearchResultItem[] = [];

    // Search Classes
    getStoredClasses().forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) {
        items.push({
          id: c.id,
          type: "class",
          title: c.name,
          subtitle: `Class (${c.category}) • Coach ${c.trainerName}`,
          url: `/classes`,
        });
      }
    });

    // Search Trainers
    getStoredTrainers().forEach((t) => {
      if (t.name.toLowerCase().includes(q) || t.specialization.toLowerCase().includes(q)) {
        items.push({
          id: t.id,
          type: "trainer",
          title: t.name,
          subtitle: `Trainer • ${t.specialization}`,
          url: `/trainers`,
        });
      }
    });

    // Search Exercises
    getStoredExercises().forEach((ex: Exercise) => {
      if (ex.name.toLowerCase().includes(q) || ex.muscleGroup.toLowerCase().includes(q)) {
        items.push({
          id: ex.id,
          type: "exercise",
          title: ex.name,
          subtitle: `Exercise (${ex.muscleGroup}) • ${ex.equipment}`,
          url: `/exercises`,
        });
      }
    });

    // Search Blog
    INITIAL_BLOG_POSTS.forEach((b: BlogPost) => {
      if (b.title.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)) {
        items.push({
          id: b.id,
          type: "blog",
          title: b.title,
          subtitle: `Blog Article • ${b.category}`,
          url: `/blog`,
        });
      }
    });

    // Search Plans
    INITIAL_PLANS.forEach((p: MembershipPlan) => {
      if (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
        items.push({
          id: p.id,
          type: "plan",
          title: p.name,
          subtitle: `Membership Plan • ₹${p.priceMonthly}/mo`,
          url: `/membership`,
        });
      }
    });

    setResults(items.slice(0, 8));
  }, [query]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "class": return <Calendar className="w-4 h-4 text-cyan-400" />;
      case "trainer": return <Users className="w-4 h-4 text-emerald-400" />;
      case "exercise": return <Dumbbell className="w-4 h-4 text-purple-400" />;
      case "blog": return <BookOpen className="w-4 h-4 text-amber-400" />;
      default: return <Award className="w-4 h-4 text-pink-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search classes, trainers, exercises, articles, or plans..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 outline-none focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-96 overflow-y-auto">
          {query.trim() === "" ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Type to search across Apex Athletics dataset...
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching results found for "{query}".
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => {
                    router.push(r.url);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                      {getIcon(r.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {r.title}
                      </h4>
                      <p className="text-xs text-slate-400">{r.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Press ESC to close</span>
          <span className="font-mono text-cyan-400">Ctrl + K</span>
        </div>
      </div>
    </div>
  );
}
