export interface ExerciseImageMapping {
  exerciseName: string;
  category: string;
  filename: string;
  assetPath: string;
  fallbackUrl: string;
}

export const EXERCISE_IMAGE_CATALOG: Record<string, ExerciseImageMapping> = {
  // 1. CHEST
  "Barbell Bench Press": {
    exerciseName: "Barbell Bench Press",
    category: "chest",
    filename: "barbell_bench_press.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077495/file_00000000ae60821194a5b30fadfcc959.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077495/file_00000000ae60821194a5b30fadfcc959.png",
  },
  "Incline Barbell Bench Press": {
    exerciseName: "Incline Barbell Bench Press",
    category: "chest",
    filename: "incline_barbell_bench_press.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077529/file_00000000e3788211a819349d4a66e4e9.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077529/file_00000000e3788211a819349d4a66e4e9.png",
  },
  "Dumbbell Chest Fly": {
    exerciseName: "Dumbbell Chest Fly",
    category: "chest",
    filename: "dumbbell_chest_fly.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077577/file_00000000d6b48211b2b1647a48b38345.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077577/file_00000000d6b48211b2b1647a48b38345.png",
  },
  "Cable Crossover": {
    exerciseName: "Cable Crossover",
    category: "chest",
    filename: "cable_crossover.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077660/file_0000000099dc821187b855b9bb98af6d.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077660/file_0000000099dc821187b855b9bb98af6d.png",
  },
  "Push-Ups": {
    exerciseName: "Push-Ups",
    category: "chest",
    filename: "push_ups.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077625/file_0000000035208211b72b0c8a4169e25c.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077625/file_0000000035208211b72b0c8a4169e25c.png",
  },

  // 2. BACK
  "Lat Pulldown": {
    exerciseName: "Lat Pulldown",
    category: "back",
    filename: "lat_pulldown.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077270/file_000000001b6482119e88daf0c2fc9506.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077270/file_000000001b6482119e88daf0c2fc9506.png",
  },
  "Bent-Over Barbell Row": {
    exerciseName: "Bent-Over Barbell Row",
    category: "back",
    filename: "bent_over_barbell_row.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077232/file_00000000974c8208ab21408da1936a02.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077232/file_00000000974c8208ab21408da1936a02.png",
  },
  "Seated Cable Row": {
    exerciseName: "Seated Cable Row",
    category: "back",
    filename: "seated_cable_row.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077309/file_00000000666082118ca8547618d2864b.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077309/file_00000000666082118ca8547618d2864b.png",
  },
  "Wide-Grip Pull-Ups": {
    exerciseName: "Wide-Grip Pull-Ups",
    category: "back",
    filename: "wide_grip_pull_ups.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077447/file_0000000020008211bc30290b822c2729.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077447/file_0000000020008211bc30290b822c2729.png",
  },
  "Single-Arm Dumbbell Row": {
    exerciseName: "Single-Arm Dumbbell Row",
    category: "back",
    filename: "single_arm_dumbbell_row.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077343/file_0000000024e082118dc8279e33f52f34.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077343/file_0000000024e082118dc8279e33f52f34.png",
  },

  // 3. SHOULDERS (MOVEMENT-ACCURATE UPDATED ASSETS)
  "Overhead Barbell Press": {
    exerciseName: "Overhead Barbell Press",
    category: "shoulders",
    filename: "overhead_barbell_press.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055444/file_00000000056c8207b73f8f5e8837a11e.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055444/file_00000000056c8207b73f8f5e8837a11e.png",
  },
  "Seated Dumbbell Shoulder Press": {
    exerciseName: "Seated Dumbbell Shoulder Press",
    category: "shoulders",
    filename: "seated_dumbbell_shoulder_press.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055445/file_000000004a448211899250d85934bdb8.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055445/file_000000004a448211899250d85934bdb8.png",
  },
  "Dumbbell Lateral Raise": {
    exerciseName: "Dumbbell Lateral Raise",
    category: "shoulders",
    filename: "dumbbell_lateral_raise.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055445/file_00000000b6dc8208bcf985cad3f71068.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055445/file_00000000b6dc8208bcf985cad3f71068.png",
  },
  "Dumbbell Front Raise": {
    exerciseName: "Dumbbell Front Raise",
    category: "shoulders",
    filename: "dumbbell_front_raise.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055445/file_000000001e2c8211bdf3fb8558a52071.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055445/file_000000001e2c8211bdf3fb8558a52071.png",
  },
  "Rear Delt Fly": {
    exerciseName: "Rear Delt Fly",
    category: "shoulders",
    filename: "rear_delt_fly.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055445/file_00000000c8408207b0a2a34e9b177bf5.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055445/file_00000000c8408207b0a2a34e9b177bf5.png",
  },

  // 4. BICEPS
  "Standing Barbell Bicep Curl": {
    exerciseName: "Standing Barbell Bicep Curl",
    category: "biceps",
    filename: "standing_barbell_bicep_curl.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055445/file_0000000064a082119f6d875892915c8a.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055445/file_0000000064a082119f6d875892915c8a.png",
  },
  "Alternating Dumbbell Curl": {
    exerciseName: "Alternating Dumbbell Curl",
    category: "biceps",
    filename: "alternating_dumbbell_curl.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055644/file_00000000a3408211ac31cf5f44ee2dee.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055644/file_00000000a3408211ac31cf5f44ee2dee.png",
  },
  "Hammer Curl": {
    exerciseName: "Hammer Curl",
    category: "biceps",
    filename: "hammer_curl.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055645/file_00000000b5ec8211a6f0166fce0637b3.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055645/file_00000000b5ec8211a6f0166fce0637b3.png",
  },
  "Preacher Curl": {
    exerciseName: "Preacher Curl",
    category: "biceps",
    filename: "preacher_curl.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055645/file_00000000599c82119ae5fa2b63a62961.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055645/file_00000000599c82119ae5fa2b63a62961.png",
  },
  "Cable Bicep Curl": {
    exerciseName: "Cable Bicep Curl",
    category: "biceps",
    filename: "cable_bicep_curl.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055646/file_0000000010e88211a415e04094507c09.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788055646/file_0000000010e88211a415e04094507c09.png",
  },

  // 5. TRICEPS
  "Triceps Cable Pushdown": {
    exerciseName: "Triceps Cable Pushdown",
    category: "triceps",
    filename: "triceps_cable_pushdown.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788057998/file_000000001aa08206ace2fbe2e7bbe488.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788057998/file_000000001aa08206ace2fbe2e7bbe488.png",
  },
  "Overhead Dumbbell Triceps Extension": {
    exerciseName: "Overhead Dumbbell Triceps Extension",
    category: "triceps",
    filename: "overhead_dumbbell_triceps_extension.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058076/file_00000000c4c08207acf86a82daf5b719.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058076/file_00000000c4c08207acf86a82daf5b719.png",
  },
  "Skull Crushers (EZ Bar Extension)": {
    exerciseName: "Skull Crushers (EZ Bar Extension)",
    category: "triceps",
    filename: "skull_crushers_ez_bar_extension.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058111/file_000000003e208211b8ae142acf5d2748.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058111/file_000000003e208211b8ae142acf5d2748.png",
  },
  "Close-Grip Bench Press": {
    exerciseName: "Close-Grip Bench Press",
    category: "triceps",
    filename: "close_grip_bench_press.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788025605/file_000000001be082079653f802c8a23124.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788025605/file_000000001be082079653f802c8a23124.png",
  },
  "Bench Dips": {
    exerciseName: "Bench Dips",
    category: "triceps",
    filename: "bench_dips.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788057968/file_00000000a0548206b5bb22bee4aead27.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788057968/file_00000000a0548206b5bb22bee4aead27.png",
  },

  // 6. FOREARMS & GRIP
  "Seated Barbell Wrist Curl": {
    exerciseName: "Seated Barbell Wrist Curl",
    category: "forearms_grip",
    filename: "seated_barbell_wrist_curl.webp",
    assetPath: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=804&q=80",
    fallbackUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=804&q=80",
  },
  "Reverse Barbell Wrist Curl": {
    exerciseName: "Reverse Barbell Wrist Curl",
    category: "forearms_grip",
    filename: "reverse_barbell_wrist_curl.webp",
    assetPath: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=803&q=80",
    fallbackUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=803&q=80",
  },
  "Heavy Farmer's Carry": {
    exerciseName: "Heavy Farmer's Carry",
    category: "forearms_grip",
    filename: "heavy_farmers_carry.webp",
    assetPath: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=804&q=80",
    fallbackUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=804&q=80",
  },
  "Wrist Roller": {
    exerciseName: "Wrist Roller",
    category: "forearms_grip",
    filename: "wrist_roller.webp",
    assetPath: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=802&q=80",
    fallbackUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=802&q=80",
  },
  "Reverse Barbell Bicep Curl": {
    exerciseName: "Reverse Barbell Bicep Curl",
    category: "forearms_grip",
    filename: "reverse_barbell_bicep_curl.webp",
    assetPath: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=804&q=80",
    fallbackUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=804&q=80",
  },

  // 7. ABS & OBLIQUES
  "Hanging Leg Raises": {
    exerciseName: "Hanging Leg Raises",
    category: "abs_obliques",
    filename: "hanging_leg_raises.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061066/file_000000004d448211aac8e500cba01391.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061066/file_000000004d448211aac8e500cba01391.png",
  },
  "Weighted Cable Crunch": {
    exerciseName: "Weighted Cable Crunch",
    category: "abs_obliques",
    filename: "weighted_cable_crunch.webp",
    assetPath: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=803&q=80",
    fallbackUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=803&q=80",
  },
  "Classic Floor Crunch": {
    exerciseName: "Classic Floor Crunch",
    category: "abs_obliques",
    filename: "classic_floor_crunch.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788060530/file_0000000063888211b1c8bec08de930e5.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788060530/file_0000000063888211b1c8bec08de930e5.png",
  },
  "Forearm Plank Hold": {
    exerciseName: "Forearm Plank Hold",
    category: "abs_obliques",
    filename: "forearm_plank_hold.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788060877/file_000000003d0c82078ac1e5d9712d962f.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788060877/file_000000003d0c82078ac1e5d9712d962f.png",
  },
  "Bicycle Crunches": {
    exerciseName: "Bicycle Crunches",
    category: "abs_obliques",
    filename: "bicycle_crunches.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788060104/file_000000000dac8211aaf6e9c7bc55a322.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788060104/file_000000000dac8211aaf6e9c7bc55a322.png",
  },
  "Russian Twists": {
    exerciseName: "Russian Twists",
    category: "abs_obliques",
    filename: "russian_twists.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061271/file_00000000155882119aedc0033a8a5cea.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061271/file_00000000155882119aedc0033a8a5cea.png",
  },
  "Side Plank Hold": {
    exerciseName: "Side Plank Hold",
    category: "abs_obliques",
    filename: "side_plank_hold.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061326/file_00000000ac648211912db329162c2e7c.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061326/file_00000000ac648211912db329162c2e7c.png",
  },
  "Cable Woodchoppers": {
    exerciseName: "Cable Woodchoppers",
    category: "abs_obliques",
    filename: "cable_woodchoppers.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788060236/file_000000004de08208bbd6b5d099782b83.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788060236/file_000000004de08208bbd6b5d099782b83.png",
  },
  "Hanging Oblique Knee Raise": {
    exerciseName: "Hanging Oblique Knee Raise",
    category: "abs_obliques",
    filename: "hanging_oblique_knee_raise.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788060979/file_000000009b988211a8b79d04572a2bd0.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788060979/file_000000009b988211a8b79d04572a2bd0.png",
  },
  "Dumbbell Side Bend": {
    exerciseName: "Dumbbell Side Bend",
    category: "abs_obliques",
    filename: "dumbbell_side_bend.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788060646/file_00000000e7e88211ae3a5641d1122830.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788060646/file_00000000e7e88211ae3a5641d1122830.png",
  },

  // 8. LOWER BACK
  "Hyperextensions (Back Extension)": {
    exerciseName: "Hyperextensions (Back Extension)",
    category: "lower_back",
    filename: "hyperextensions_back_extension.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061183/file_00000000c53c820893248d044f041d4d.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061183/file_00000000c53c820893248d044f041d4d.png",
  },
  "Barbell Good Mornings": {
    exerciseName: "Barbell Good Mornings",
    category: "lower_back",
    filename: "barbell_good_mornings.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788059950/file_000000008bb0820884ca71c00cad9790.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788059950/file_000000008bb0820884ca71c00cad9790.png",
  },
  "Superman Hold": {
    exerciseName: "Superman Hold",
    category: "lower_back",
    filename: "superman_hold.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061441/file_00000000a58882089d1e086e8ca766ce.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061441/file_00000000a58882089d1e086e8ca766ce.png",
  },
  "Bird-Dog Core Hold": {
    exerciseName: "Bird-Dog Core Hold",
    category: "lower_back",
    filename: "bird_dog_core_hold.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788060177/file_0000000071b48211af2eff6c73b5f58f.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788060177/file_0000000071b48211af2eff6c73b5f58f.png",
  },
  "Barbell Rack Pulls": {
    exerciseName: "Barbell Rack Pulls",
    category: "lower_back",
    filename: "barbell_rack_pulls.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788060035/file_00000000f68c8211a82109f2a2e4a9ff.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788060035/file_00000000f68c8211a82109f2a2e4a9ff.png",
  },

  // 9. QUADRICEPS
  "Barbell Back Squat": {
    exerciseName: "Barbell Back Squat",
    category: "quadriceps",
    filename: "barbell_back_squat.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077767/file_00000000085c8211a61dc8ca3af89a8a.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077767/file_00000000085c8211a61dc8ca3af89a8a.png",
  },
  "45-Degree Leg Press": {
    exerciseName: "45-Degree Leg Press",
    category: "quadriceps",
    filename: "45_degree_leg_press.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077726/file_00000000053c8211b7d78a088b335642.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077726/file_00000000053c8211b7d78a088b335642.png",
  },
  "Seated Leg Extension": {
    exerciseName: "Seated Leg Extension",
    category: "quadriceps",
    filename: "seated_leg_extension.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788078084/file_000000003b2882119cef542ee64642ce.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788078084/file_000000003b2882119cef542ee64642ce.png",
  },
  "Bulgarian Split Squat": {
    exerciseName: "Bulgarian Split Squat",
    category: "quadriceps",
    filename: "bulgarian_split_squat.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077807/file_0000000004308211a2f97665be5a8c37.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077807/file_0000000004308211a2f97665be5a8c37.png",
  },
  "Dumbbell Goblet Squat": {
    exerciseName: "Dumbbell Goblet Squat",
    category: "quadriceps",
    filename: "dumbbell_goblet_squat.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077899/file_0000000000508211babf8238afd2cced.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788077899/file_0000000000508211babf8238afd2cced.png",
  },

  // 10. HAMSTRINGS & GLUTES
  "Romanian Deadlift (RDL)": {
    exerciseName: "Romanian Deadlift (RDL)",
    category: "hamstrings_glutes",
    filename: "romanian_deadlift_rdl.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061888/file_00000000a6988211bc6fe7023c996da9.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061888/file_00000000a6988211bc6fe7023c996da9.png",
  },
  "Lying Leg Curl": {
    exerciseName: "Lying Leg Curl",
    category: "hamstrings_glutes",
    filename: "lying_leg_curl.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061840/file_00000000eca482119a3e51da070aa1b6.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061840/file_00000000eca482119a3e51da070aa1b6.png",
  },
  "Seated Leg Curl": {
    exerciseName: "Seated Leg Curl",
    category: "hamstrings_glutes",
    filename: "seated_leg_curl.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788062011/file_00000000f44c8211968637e9c6eeef4e.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788062011/file_00000000f44c8211968637e9c6eeef4e.png",
  },
  "Barbell Hip Thrust": {
    exerciseName: "Barbell Hip Thrust",
    category: "hamstrings_glutes",
    filename: "barbell_hip_thrust.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061637/file_000000008d4c8211b3d425c03073a3d9.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061637/file_000000008d4c8211b3d425c03073a3d9.png",
  },
  "Bodyweight Glute Bridge": {
    exerciseName: "Bodyweight Glute Bridge",
    category: "hamstrings_glutes",
    filename: "bodyweight_glute_bridge.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061687/file_00000000ef4482118eac60579f6b6960.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061687/file_00000000ef4482118eac60579f6b6960.png",
  },
  "Cable Glute Kickback": {
    exerciseName: "Cable Glute Kickback",
    category: "hamstrings_glutes",
    filename: "cable_glute_kickback.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061739/file_00000000e7588211bd4b991d1b218303.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788061739/file_00000000e7588211bd4b991d1b218303.png",
  },
  "Walking Dumbbell Lunges": {
    exerciseName: "Walking Dumbbell Lunges",
    category: "hamstrings_glutes",
    filename: "walking_dumbbell_lunges.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788062206/file_0000000056ac8208afd2f1d8202092e8.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788062206/file_0000000056ac8208afd2f1d8202092e8.png",
  },
  "Sumo Deadlift": {
    exerciseName: "Sumo Deadlift",
    category: "hamstrings_glutes",
    filename: "sumo_deadlift.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788062148/file_000000004ab882088237e514edd5725f.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788062148/file_000000004ab882088237e514edd5725f.png",
  },

  // 11. CALVES & HIPS
  "Standing Machine Calf Raise": {
    exerciseName: "Standing Machine Calf Raise",
    category: "calves_hips",
    filename: "standing_machine_calf_raise.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058864/file_000000007558821190072ca334aee9cc.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058864/file_000000007558821190072ca334aee9cc.png",
  },
  "Seated Calf Raise": {
    exerciseName: "Seated Calf Raise",
    category: "calves_hips",
    filename: "seated_calf_raise.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058674/file_00000000032482118527dcf7e1bbe1aa.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058674/file_00000000032482118527dcf7e1bbe1aa.png",
  },
  "Leg Press Calf Press": {
    exerciseName: "Leg Press Calf Press",
    category: "calves_hips",
    filename: "leg_press_calf_press.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058635/file_000000007704821194fae282237214ee.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058635/file_000000007704821194fae282237214ee.png",
  },
  "Single-Leg Bodyweight Calf Raise": {
    exerciseName: "Single-Leg Bodyweight Calf Raise",
    category: "calves_hips",
    filename: "single_leg_bodyweight_calf_raise.webp",
    assetPath: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=808&q=80",
    fallbackUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=808&q=80",
  },
  "Seated Machine Hip Adduction": {
    exerciseName: "Seated Machine Hip Adduction",
    category: "calves_hips",
    filename: "seated_machine_hip_adduction.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058674/file_00000000032482118527dcf7e1bbe1aa.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058674/file_00000000032482118527dcf7e1bbe1aa.png",
  },
  "Seated Machine Hip Abduction": {
    exerciseName: "Seated Machine Hip Abduction",
    category: "calves_hips",
    filename: "seated_machine_hip_abduction.webp",
    assetPath: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=809&q=80",
    fallbackUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=809&q=80",
  },
  "Lateral Band Walk": {
    exerciseName: "Lateral Band Walk",
    category: "calves_hips",
    filename: "lateral_band_walk.webp",
    assetPath: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=808&q=80",
    fallbackUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=808&q=80",
  },
  "Copenhagen Plank": {
    exerciseName: "Copenhagen Plank",
    category: "calves_hips",
    filename: "copenhagen_plank.webp",
    assetPath: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=809&q=80",
    fallbackUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=809&q=80",
  },

  // 12. FULL BODY & CONDITIONING
  "Barbell Thruster": {
    exerciseName: "Barbell Thruster",
    category: "full_body_conditioning",
    filename: "barbell_thruster.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058405/file_0000000057648211a1e06989bd3d2c6a.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058405/file_0000000057648211a1e06989bd3d2c6a.png",
  },
  "Kettlebell Swing": {
    exerciseName: "Kettlebell Swing",
    category: "full_body_conditioning",
    filename: "kettlebell_swing.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058553/file_00000000544c8211b1eb0fd919763bab.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058553/file_00000000544c8211b1eb0fd919763bab.png",
  },
  "Explosive Burpees": {
    exerciseName: "Explosive Burpees",
    category: "full_body_conditioning",
    filename: "explosive_burpees.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058511/file_0000000096148211aa9efe7c01a4570f.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058511/file_0000000096148211aa9efe7c01a4570f.png",
  },
  "Dumbbell Clean and Press": {
    exerciseName: "Dumbbell Clean and Press",
    category: "full_body_conditioning",
    filename: "dumbbell_clean_and_press.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058435/file_000000004fd48211bef4f77b80d06afc.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058435/file_000000004fd48211bef4f77b80d06afc.png",
  },
  "Man Maker": {
    exerciseName: "Man Maker",
    category: "full_body_conditioning",
    filename: "man_maker.webp",
    assetPath: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058580/file_00000000d8ec82119e4bb3c72dc388a2.png",
    fallbackUrl: "https://res.cloudinary.com/crnwvrdz/image/upload/v1788058580/file_00000000d8ec82119e4bb3c72dc388a2.png",
  },
};

export function getExerciseAssetPath(exerciseName: string): string {
  const item = EXERCISE_IMAGE_CATALOG[exerciseName];
  if (item) return item.assetPath || item.fallbackUrl;
  return "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80";
}
