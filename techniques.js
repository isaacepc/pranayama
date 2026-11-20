// Technique configuration: the local source of truth for the practice library.
window.PRANAYAMA_TECHNIQUES = [
  {
    id: "dirga",
    name: "Dirga Pranayama",
    english_name: "Three-Part Breath",
    category: "Calming & Stress Relief",
    engine_type: "continuous_timer",
    description: "Fill the belly, ribs, and upper chest sequentially on the inhale, then empty from top to bottom.",
    default_rounds: 10,
    phases: [
      { action: "inhale", label: "Inhale (Belly → Ribs → Chest)", duration_sec: 6, nostril: "both" },
      { action: "exhale", label: "Exhale (Chest → Ribs → Belly)", duration_sec: 6, nostril: "both" }
    ],
    ui_cue: "3-segment vertical fill bar",
    cautions: []
  },
  {
    id: "nadi_shodhana",
    name: "Nadi Shodhana",
    english_name: "Alternate Nostril Breathing",
    category: "Calming & Stress Relief",
    engine_type: "continuous_timer",
    description: "Breathe slowly through alternating nostrils using your right thumb and ring finger.",
    default_rounds: 8,
    phases: [
      { action: "inhale", label: "Inhale Left Nostril", duration_sec: 4, nostril: "left" },
      { action: "hold_full", label: "Hold (Close Both)", duration_sec: 4, nostril: "none" },
      { action: "exhale", label: "Exhale Right Nostril", duration_sec: 4, nostril: "right" },
      { action: "inhale", label: "Inhale Right Nostril", duration_sec: 4, nostril: "right" },
      { action: "hold_full", label: "Hold (Close Both)", duration_sec: 4, nostril: "none" },
      { action: "exhale", label: "Exhale Left Nostril", duration_sec: 4, nostril: "left" }
    ],
    ui_cue: "Left/right nostril indicator with expanding circle",
    cautions: ["Skip holds if pregnant or managing high blood pressure."]
  },
  {
    id: "sama_vritti",
    name: "Sama Vritti",
    english_name: "Equal / Box Breathing",
    category: "Focus & Balance",
    engine_type: "continuous_timer",
    description: "Inhale, hold, exhale, and hold empty for equal counts to steady the mind.",
    default_rounds: 10,
    phases: [
      { action: "inhale", label: "Inhale", duration_sec: 4, nostril: "both" },
      { action: "hold_full", label: "Hold Full", duration_sec: 4, nostril: "none" },
      { action: "exhale", label: "Exhale", duration_sec: 4, nostril: "both" },
      { action: "hold_empty", label: "Hold Empty", duration_sec: 4, nostril: "none" }
    ],
    ui_cue: "4-sided box perimeter trace",
    cautions: ["Skip breath holds if pregnant or uncomfortable with air hunger."]
  },
  {
    id: "ujjayi",
    name: "Ujjayi Pranayama",
    english_name: "Ocean Breath",
    category: "Focus & Balance",
    engine_type: "continuous_timer",
    description: "Gently constrict the back of the throat while breathing through the nose to create a soft ocean sound.",
    default_rounds: 12,
    phases: [
      { action: "inhale", label: "Slow Throat Inhale", duration_sec: 5, nostril: "both" },
      { action: "exhale", label: "Slow Throat Exhale", duration_sec: 5, nostril: "both" }
    ],
    ui_cue: "Smooth wave expansion/contraction",
    cautions: []
  },
  {
    id: "kapalabhati",
    name: "Kapalabhati",
    english_name: "Skull Shining Breath",
    category: "Energy & Activation",
    engine_type: "pump_cycle",
    description: "Rapid, forceful abdominal exhales paired with passive, automatic inhales.",
    default_rounds: 3,
    phases: [
      { action: "pump", label: "Active Exhale / Passive Inhale", reps: 30, sec_per_rep: 1.0 },
      { action: "rest", label: "Normal Recovery Breath", duration_sec: 15 }
    ],
    ui_cue: "Sharp pulse animation on exhale beat",
    cautions: ["Avoid if pregnant, hypertensive, or experiencing dizziness/heart conditions."]
  },
  {
    id: "bhastrika",
    name: "Bhastrika",
    english_name: "Bellows Breath",
    category: "Energy & Activation",
    engine_type: "pump_cycle",
    description: "Equal, forceful inhales and exhales driven by the diaphragm to quickly generate heat and alertness.",
    default_rounds: 3,
    phases: [
      { action: "pump", label: "Forceful Inhale & Exhale", reps: 20, sec_per_rep: 1.5 },
      { action: "rest", label: "Normal Recovery Breath", duration_sec: 20 }
    ],
    ui_cue: "Dual-direction bellows pulse (expand & contract)",
    cautions: ["Avoid if pregnant, hypertensive, or prone to panic/dizziness."]
  }
];
