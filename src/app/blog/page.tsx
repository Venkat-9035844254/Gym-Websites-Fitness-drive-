"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getStoredBlogPosts, initializeStorage } from "@/lib/storage";
import { BlogPost } from "@/types";
import { BookOpen, Clock, Tag } from "lucide-react";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    initializeStorage();
    setPosts(getStoredBlogPosts());
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          Fitness Journal
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white font-display">
          ATHLETIC INSIGHTS & SCIENCE
        </h1>
        <p className="text-sm text-slate-400">
          Articles on progressive overload, nutrition strategies, sleep optimization, and recovery protocols.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto space-y-3 shadow-xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Blog Articles Published Yet</h3>
          <p className="text-xs text-slate-400">
            There are currently no published blog posts in the database. Published articles from admins will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 cursor-pointer hover:border-cyan-500/40 transition-all shadow-xl"
            >
              <div className="relative w-full h-56 rounded-2xl overflow-hidden">
                <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-cyan-400 text-[10px] font-bold uppercase">
                  {post.category}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white font-display">{post.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{post.summary}</p>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
                <span>By {post.authorName}</span>
                <span>{post.publishedAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto space-y-6 shadow-2xl">
            <h2 className="text-2xl font-black text-white font-display">{selectedPost.title}</h2>
            <div className="text-xs text-cyan-400 font-bold uppercase">{selectedPost.category} • {selectedPost.publishedAt}</div>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{selectedPost.content}</p>
            <button
              onClick={() => setSelectedPost(null)}
              className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs"
            >
              Close Article
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
