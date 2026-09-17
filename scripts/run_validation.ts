import { validateAllExerciseImages } from "../src/lib/validateExerciseImages";

const report = validateAllExerciseImages();

console.log("==================================================");
console.log("FITNESS DRIVE EXERCISE IMAGE VALIDATION REPORT");
console.log("==================================================");
console.log(`Total Exercises: ${report.totalExercises}`);
console.log(`Total Unique Images: ${report.totalUniqueImages}`);
console.log(`Duplicate Count: ${report.duplicateCount}`);
console.log(`All Valid & Unique: ${report.allValid}`);
console.log("==================================================");

let failedCount = 0;
report.results.forEach((r, idx) => {
  const status = r.isCorrect ? "✓ PASS" : "✗ FAIL";
  if (!r.isCorrect) failedCount++;
  console.log(`${idx + 1}. [${status}] ${r.name} (${r.category}) -> ${r.imageUrl}`);
});

console.log("==================================================");
console.log(`Final Status: ${failedCount === 0 ? "100% PERFECT MATCH & UNIQUE" : `${failedCount} EXERCISES FAILED`}`);
