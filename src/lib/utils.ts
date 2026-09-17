import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | Date): string {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string | Date): string {
  const d = new Date(dateString);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface BMICalculationResult {
  bmi: number;
  category: "Underweight" | "Normal weight" | "Overweight" | "Obesity";
  colorClass: string;
  badgeBg: string;
  interpretation: string;
}

export function calculateBMI(heightCm: number, weightKg: number): BMICalculationResult {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return {
      bmi: 0,
      category: "Normal weight",
      colorClass: "text-gray-400",
      badgeBg: "bg-gray-800 text-gray-300",
      interpretation: "Please enter valid height and weight.",
    };
  }

  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  if (bmi < 18.5) {
    return {
      bmi,
      category: "Underweight",
      colorClass: "text-amber-400",
      badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      interpretation: "Below standard weight range. Consider strength training & caloric surplus.",
    };
  } else if (bmi < 25) {
    return {
      bmi,
      category: "Normal weight",
      colorClass: "text-emerald-400",
      badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      interpretation: "Healthy weight range! Maintain your active workout routine & balanced macros.",
    };
  } else if (bmi < 30) {
    return {
      bmi,
      category: "Overweight",
      colorClass: "text-amber-400",
      badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      interpretation: "Slightly above recommended weight range. Higher cardio & resistance split advised.",
    };
  } else {
    return {
      bmi,
      category: "Obesity",
      colorClass: "text-rose-400",
      badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      interpretation: "Significantly above recommended target. Personalized trainer consultation recommended.",
    };
  }
}
