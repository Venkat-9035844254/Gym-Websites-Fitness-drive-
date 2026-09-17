import { cloudinary, isCloudinaryConfigured, buildOptimizedImageUrl } from "./cloudinary";
import { INITIAL_EXERCISES } from "./seedData";
import { EXERCISE_IMAGE_CATALOG } from "./exerciseImageCatalog";
import { Exercise } from "@/types";

export interface CloudinaryExerciseItem {
  id: string;
  name: string;
  publicId: string;
  imageUrl: string;
  category: string;
  equipment?: string;
  difficulty?: string;
  instructions?: string[];
  secondaryMuscles?: string[];
}

export interface CategoryExercisesResult {
  category: string;
  count: number;
  exercises: CloudinaryExerciseItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AllCategoriesResult {
  categories: {
    name: string;
    count: number;
    exercises: CloudinaryExerciseItem[];
  }[];
}

// Supported Cloudinary folders & aliases
const CATEGORY_FOLDER_MAP: Record<string, { folder: string; displayName: string; catalogKeys: string[] }> = {
  chest: {
    folder: "gym-exercises/chest",
    displayName: "chest",
    catalogKeys: ["chest", "Chest"],
  },
  back: {
    folder: "gym-exercises/back",
    displayName: "back",
    catalogKeys: ["back", "Back"],
  },
  shoulders: {
    folder: "gym-exercises/shoulders",
    displayName: "shoulders",
    catalogKeys: ["shoulders", "Shoulders"],
  },
  biceps: {
    folder: "gym-exercises/biceps",
    displayName: "biceps",
    catalogKeys: ["biceps", "Biceps", "Arms"],
  },
  triceps: {
    folder: "gym-exercises/triceps",
    displayName: "triceps",
    catalogKeys: ["triceps", "Triceps", "Arms"],
  },
  core: {
    folder: "gym-exercises/core",
    displayName: "core",
    catalogKeys: ["core", "Core", "abs_obliques", "lower_back", "Abs", "Obliques"],
  },
  quads: {
    folder: "gym-exercises/quads",
    displayName: "quads",
    catalogKeys: ["quads", "quadriceps", "Quadriceps"],
  },
  hamstrings: {
    folder: "gym-exercises/hamstrings",
    displayName: "hamstrings",
    catalogKeys: ["hamstrings", "hamstrings_glutes", "Hamstrings", "Glutes"],
  },
  calves: {
    folder: "gym-exercises/calves",
    displayName: "calves",
    catalogKeys: ["calves", "calves_hips", "Calves"],
  },
  hips: {
    folder: "gym-exercises/hips",
    displayName: "hips",
    catalogKeys: ["hips", "calves_hips", "Adductors", "Abductors"],
  },
  "full-body": {
    folder: "gym-exercises/full-body",
    displayName: "full-body",
    catalogKeys: ["full-body", "full_body_conditioning", "Full Body"],
  },
};

// Aliases mapping for flexible URL params (e.g. quadriceps -> quads, abs -> core)
const ALIAS_MAP: Record<string, string> = {
  quadriceps: "quads",
  abs: "core",
  obliques: "core",
  "lower-back": "core",
  "lower_back": "core",
  glutes: "hamstrings",
  "hamstrings-glutes": "hamstrings",
  arms: "biceps",
  "full_body": "full-body",
  "fullbody": "full-body",
};

// Server-side in-memory cache (5 minute TTL)
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL_MS = 5 * 60 * 1000;

function getFromCache<T>(key: string): T | null {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }
  return null;
}

function setToCache(key: string, data: any) {
  cache[key] = { data, timestamp: Date.now() };
}

/**
 * Normalizes string for fuzzy exercise name matching.
 * e.g. "3-1-overhead-barbell-press" -> "overheadbarbellpress"
 * e.g. "Overhead Barbell Press" -> "overheadbarbellpress"
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/^\d+[-_]\d+[-_]/, "") // strip leading numbers like 3-1- or 3_1_
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Find matching exercise record from seedData / catalog by filename or public ID.
 */
function findMatchingExerciseRecord(filenameOrPublicId: string, categoryKey: string): Exercise | null {
  const normKey = normalizeString(filenameOrPublicId);

  // 1. Check INITIAL_EXERCISES
  const foundSeed = INITIAL_EXERCISES.find((ex) => {
    const normName = normalizeString(ex.name);
    return normName === normKey || normKey.includes(normName) || normName.includes(normKey);
  });

  if (foundSeed) return foundSeed;

  // 2. Check EXERCISE_IMAGE_CATALOG keys
  for (const [name, catalogItem] of Object.entries(EXERCISE_IMAGE_CATALOG)) {
    const normCatalogName = normalizeString(name);
    const normFilename = normalizeString(catalogItem.filename);
    if (normCatalogName === normKey || normFilename === normKey) {
      return {
        id: `ex-${normKey}`,
        name,
        muscleGroup: mapToMuscleGroup(catalogItem.category),
        primaryBodyPart: mapToPrimaryBodyPart(catalogItem.category),
        equipment: "Machine",
        difficulty: "Intermediate",
        instructions: ["Perform with controlled form and proper posture."],
        imageUrl: catalogItem.assetPath || catalogItem.fallbackUrl,
      };
    }
  }

  return null;
}

function mapToMuscleGroup(categoryStr: string): 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Core' | 'Cardio' | 'Full Body' {
  const cat = categoryStr.toLowerCase();
  if (cat.includes("chest")) return "Chest";
  if (cat.includes("back")) return "Back";
  if (cat.includes("shoulder")) return "Shoulders";
  if (cat.includes("bicep") || cat.includes("tricep") || cat.includes("arm") || cat.includes("forearm")) return "Arms";
  if (cat.includes("quad") || cat.includes("hamstring") || cat.includes("calf") || cat.includes("hip") || cat.includes("leg")) return "Legs";
  if (cat.includes("core") || cat.includes("abs") || cat.includes("oblique")) return "Core";
  if (cat.includes("full")) return "Full Body";
  return "Chest";
}

function mapToPrimaryBodyPart(categoryStr: string): any {
  const cat = categoryStr.toLowerCase();
  if (cat.includes("chest")) return "Chest";
  if (cat.includes("back") && !cat.includes("lower")) return "Back";
  if (cat.includes("lower")) return "Lower Back";
  if (cat.includes("shoulder")) return "Shoulders";
  if (cat.includes("bicep")) return "Biceps";
  if (cat.includes("tricep")) return "Triceps";
  if (cat.includes("forearm")) return "Forearms";
  if (cat.includes("abs")) return "Abs";
  if (cat.includes("oblique")) return "Obliques";
  if (cat.includes("quad")) return "Quadriceps";
  if (cat.includes("hamstring")) return "Hamstrings";
  if (cat.includes("glute")) return "Glutes";
  if (cat.includes("calf") || cat.includes("calve")) return "Calves";
  if (cat.includes("adductor")) return "Adductors";
  if (cat.includes("abductor")) return "Abductors";
  if (cat.includes("full")) return "Full Body";
  return "Chest";
}

/**
 * Normalizes requested category parameter into standard category slug.
 */
export function normalizeCategoryParam(param: string): string | null {
  if (!param) return null;
  const lower = param.trim().toLowerCase();
  const resolved = ALIAS_MAP[lower] || lower;
  return CATEGORY_FOLDER_MAP[resolved] ? resolved : null;
}

/**
 * Fallback generator for a category when Cloudinary API is unconfigured or returns empty.
 */
function getFallbackExercisesForCategory(catKey: string): CloudinaryExerciseItem[] {
  const catConfig = CATEGORY_FOLDER_MAP[catKey];
  if (!catConfig) return [];

  // Filter seed exercises matching category keys
  const matchingSeeds = INITIAL_EXERCISES.filter((ex) => {
    const pbp = ex.primaryBodyPart.toLowerCase();
    const mg = ex.muscleGroup.toLowerCase();
    return catConfig.catalogKeys.some((k) => k.toLowerCase() === pbp || k.toLowerCase() === mg);
  });

  if (matchingSeeds.length > 0) {
    return matchingSeeds.map((ex, index) => {
      const slug = ex.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const numId = `${getCategoryNumber(catKey)}.${index + 1}`;
      const publicId = `gym-exercises/${catKey}/${numId.replace(".", "-")}-${slug}`;
      const cloudUrl = buildOptimizedImageUrl(publicId);

      return {
        id: ex.id || numId,
        name: ex.name,
        publicId,
        imageUrl: cloudUrl,
        category: catKey,
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        instructions: ex.instructions,
        secondaryMuscles: ex.secondaryMuscles,
      };
    });
  }

  // Fallback to EXERCISE_IMAGE_CATALOG entries
  const catalogEntries = Object.entries(EXERCISE_IMAGE_CATALOG).filter(
    ([_, item]) => catConfig.catalogKeys.some((k) => k.toLowerCase() === item.category.toLowerCase())
  );

  return catalogEntries.map(([name, item], index) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const numId = `${getCategoryNumber(catKey)}.${index + 1}`;
    const publicId = `gym-exercises/${catKey}/${numId.replace(".", "-")}-${slug}`;
    const cloudUrl = buildOptimizedImageUrl(publicId);

    return {
      id: numId,
      name,
      publicId,
      imageUrl: cloudUrl,
      category: catKey,
      equipment: "Machine",
      difficulty: "Intermediate",
      instructions: ["Maintain proper posture and perform with controlled tension."],
    };
  });
}

function getCategoryNumber(catKey: string): number {
  const categoryOrder = [
    "chest",
    "back",
    "shoulders",
    "biceps",
    "triceps",
    "core",
    "quads",
    "hamstrings",
    "calves",
    "hips",
    "full-body",
  ];
  const idx = categoryOrder.indexOf(catKey);
  return idx !== -1 ? idx + 1 : 1;
}

/**
 * Retrieves exercises for a specific category folder from Cloudinary or cached fallback.
 */
export async function getExercisesByCategory(
  categoryParam: string,
  page: number = 1,
  limit: number = 20
): Promise<CategoryExercisesResult> {
  const normCategory = normalizeCategoryParam(categoryParam);
  if (!normCategory) {
    throw new Error(`Invalid exercise category: '${categoryParam}'`);
  }

  const cacheKey = `category_${normCategory}_p${page}_l${limit}`;
  const cached = getFromCache<CategoryExercisesResult>(cacheKey);
  if (cached) return cached;

  const catConfig = CATEGORY_FOLDER_MAP[normCategory];
  let exercisesList: CloudinaryExerciseItem[] = [];

  if (isCloudinaryConfigured) {
    try {
      // Query Cloudinary Search API across all folder variations (Gym Excerise, Gym Exercise, gym-exercises, etc.)
      const searchExpression = `folder:"gym-exercises/${normCategory}/*" OR folder:"Gym Excerise/${normCategory}/*" OR folder:"Gym Exercise/${normCategory}/*" OR folder:"gym_exercises/${normCategory}/*" OR folder:"gym exercises/${normCategory}/*" OR folder:"*${normCategory}*"`;
      const searchResponse = await cloudinary.search
        .expression(searchExpression)
        .max_results(100)
        .execute();

      if (searchResponse && searchResponse.resources && searchResponse.resources.length > 0) {
        exercisesList = searchResponse.resources.map((res: any, index: number) => {
          const publicId = res.public_id;
          const filename = publicId.split("/").pop() || "";
          const matchedEx = findMatchingExerciseRecord(filename, normCategory);

          // Extract number prefix e.g. "3-1-" or "3.1" if present
          const numberMatch = filename.match(/^(\d+)[-_](\d+)/);
          const formattedId = numberMatch
            ? `${numberMatch[1]}.${numberMatch[2]}`
            : matchedEx?.id || `${getCategoryNumber(normCategory)}.${index + 1}`;

          // Format clean title from filename if no match found
          const fallbackTitle = filename
            .replace(/^\d+[-_]\d+[-_]/, "")
            .split(/[-_]/)
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

          const imageUrl = res.secure_url
            ? buildOptimizedImageUrl(res.secure_url)
            : buildOptimizedImageUrl(publicId);

          return {
            id: matchedEx?.id || formattedId,
            name: matchedEx?.name || fallbackTitle,
            publicId,
            imageUrl,
            category: normCategory,
            equipment: matchedEx?.equipment || "Machine",
            difficulty: matchedEx?.difficulty || "Intermediate",
            instructions: matchedEx?.instructions || ["Perform exercise under controlled motion."],
            secondaryMuscles: matchedEx?.secondaryMuscles,
          };
        });
      }
    } catch (err) {
      console.warn(`Cloudinary search failed for category '${normCategory}', using fallback catalog:`, err);
    }
  }

  // If Cloudinary didn't return resources or wasn't configured, use matched fallback catalog
  if (exercisesList.length === 0) {
    exercisesList = getFallbackExercisesForCategory(normCategory);
  }

  // Calculate pagination
  const total = exercisesList.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedExercises = exercisesList.slice(startIndex, startIndex + limit);

  const result: CategoryExercisesResult = {
    category: normCategory,
    count: paginatedExercises.length,
    exercises: paginatedExercises,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };

  setToCache(cacheKey, result);
  return result;
}

/**
 * Retrieves all categories and their exercises.
 */
export async function getAllExercises(): Promise<AllCategoriesResult> {
  const cacheKey = "all_exercises_categories";
  const cached = getFromCache<AllCategoriesResult>(cacheKey);
  if (cached) return cached;

  const categoriesKeys = Object.keys(CATEGORY_FOLDER_MAP);
  const categoryPromises = categoriesKeys.map(async (catKey) => {
    const res = await getExercisesByCategory(catKey, 1, 100);
    return {
      name: catKey,
      count: res.exercises.length,
      exercises: res.exercises,
    };
  });

  const categories = await Promise.all(categoryPromises);
  const result: AllCategoriesResult = { categories };

  setToCache(cacheKey, result);
  return result;
}

/**
 * Retrieves an individual exercise by category and exercise ID or name slug.
 */
export async function getExerciseById(
  categoryParam: string,
  exerciseId: string
): Promise<CloudinaryExerciseItem | null> {
  const normCategory = normalizeCategoryParam(categoryParam);
  if (!normCategory) return null;

  const catData = await getExercisesByCategory(normCategory, 1, 100);
  const normTarget = normalizeString(exerciseId);

  const found = catData.exercises.find((ex) => {
    return (
      ex.id === exerciseId ||
      normalizeString(ex.id) === normTarget ||
      normalizeString(ex.name) === normTarget ||
      normalizeString(ex.publicId) === normTarget
    );
  });

  return found || null;
}
