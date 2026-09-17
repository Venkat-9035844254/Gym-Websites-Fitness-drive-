"use client";

import React, { createContext, useContext, useState } from "react";
import { GymBranch } from "@/types";
import { INITIAL_BRANCHES } from "@/lib/seedData";

interface GymBranchContextType {
  branches: GymBranch[];
  selectedBranch: GymBranch;
  selectBranch: (branchId: string) => void;
}

const GymBranchContext = createContext<GymBranchContextType | undefined>(undefined);

export function GymBranchProvider({ children }: { children: React.ReactNode }) {
  const [branches] = useState<GymBranch[]>(INITIAL_BRANCHES);
  const [selectedBranch, setSelectedBranch] = useState<GymBranch>(INITIAL_BRANCHES[0]);

  const selectBranch = (branchId: string) => {
    const found = branches.find((b) => b.id === branchId);
    if (found) setSelectedBranch(found);
  };

  return (
    <GymBranchContext.Provider value={{ branches, selectedBranch, selectBranch }}>
      {children}
    </GymBranchContext.Provider>
  );
}

export function useGymBranch() {
  const context = useContext(GymBranchContext);
  if (!context) throw new Error("useGymBranch must be used within GymBranchProvider");
  return context;
}
