"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getStoredTestimonials, saveTestimonials, initializeStorage } from "@/lib/storage";
import { Testimonial } from "@/types";
import { Star, MessageSquare, Plus, X } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";

export default function ReviewsPage() {
  const { showToast } = useNotification();
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    initializeStorage();
    setReviews(getStoredTestimonials());
  }, []);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;

    const newRev: Testimonial = {
      id: `tst-${Date.now()}`,
      memberName: name,
      memberRole: "Verified Member",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      rating: Number(rating),
      comment: comment,
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    saveTestimonials(updated);

    showToast("Review Submitted!", "Thank you for sharing your transformation story.", "success");
    setName("");
    setComment("");
    setIsSubmitOpen(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          Member Transformations
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white font-display">
          VERIFIED MEMBER REVIEWS
        </h1>
        <p className="text-sm text-slate-400">
          Real results, body transformations, and strength milestones shared by our community.
        </p>

        <button
          onClick={() => setIsSubmitOpen(true)}
          className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase shadow-neon inline-flex items-center gap-2 mt-4"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto space-y-3 shadow-xl">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Reviews Submitted Yet</h3>
          <p className="text-xs text-slate-400">
            Be the first member to share your transformation experience and review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-slate-700">
                  <Image src={rev.avatar} alt={rev.memberName} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{rev.memberName}</h4>
                  <span className="text-[10px] text-slate-500 font-semibold">{rev.memberRole}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-cyan-400 text-cyan-400" />
                ))}
              </div>

              <p className="text-xs text-slate-300 italic leading-relaxed">"{rev.comment}"</p>
            </div>
          ))}
        </div>
      )}

      {/* Write Review Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Submit Member Review</h3>
              <button onClick={() => setIsSubmitOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none"
                >
                  <option value={5}>5 Stars ★★★★★</option>
                  <option value={4}>4 Stars ★★★★☆</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold text-[10px] mb-1">Review Comment</label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold uppercase shadow-neon"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
