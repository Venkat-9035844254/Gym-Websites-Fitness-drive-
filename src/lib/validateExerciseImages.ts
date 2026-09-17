import { INITIAL_EXERCISES } from "./seedData";
import { EXERCISE_IMAGE_CATALOG } from "./exerciseImageCatalog";

export interface ExerciseValidationResult {
  id: string;
  name: string;
  category: string;
  equipment: string;
  imageUrl: string;
  exists: boolean;
  isUnique: boolean;
  isCorrect: boolean;
}

export function validateAllExerciseImages(): {
  results: ExerciseValidationResult[];
  totalExercises: number;
  totalUniqueImages: number;
  duplicateCount: number;
  allValid: boolean;
} {
  const imageCountMap: Record<string, number> = {};

  // Count occurrences of each imageUrl
  INITIAL_EXERCISES.forEach((ex) => {
    const url = ex.imageUrl || "";
    imageCountMap[url] = (imageCountMap[url] || 0) + 1;
  });

  const results: ExerciseValidationResult[] = INITIAL_EXERCISES.map((ex) => {
    const url = ex.imageUrl || "";
    const catalogItem = EXERCISE_IMAGE_CATALOG[ex.name];
    const isUnique = imageCountMap[url] === 1;
    const exists = Boolean(url && url.length > 0);
    // Correct if image URL exists, is unique, and matches catalog asset path or fallback
    const isCorrect = exists && isUnique && Boolean(catalogItem);

    return {
      id: ex.id,
      name: ex.name,
      category: ex.muscleGroup,
      equipment: ex.equipment,
      imageUrl: url,
      exists,
      isUnique,
      isCorrect,
    };
  });

  const duplicateCount = Object.values(imageCountMap).filter((count) => count > 1).length;
  const totalUniqueImages = Object.keys(imageCountMap).length;
  const allValid = results.every((r) => r.isCorrect);

  return {
    results,
    totalExercises: INITIAL_EXERCISES.length,
    totalUniqueImages,
    duplicateCount,
    allValid,
  };
}
