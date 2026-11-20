/* Pure timing helpers. Positions are derived from elapsed time, never tick counts. */
window.BreathingEngine = {
  timeline(technique, rounds, multiplier, skipHolds = false) {
    let end = 0;
    return Array.from({ length: rounds }, (_, round) =>
      technique.phases.filter(p => !skipHolds || !p.action.startsWith('hold')).map(phase => {
        const duration = phase.action === 'pump' ? phase.reps * phase.sec_per_rep :
          phase.duration_sec * (technique.engine_type === 'continuous_timer' ? multiplier : 1);
        const entry = { phase, round: round + 1, start: end, end: end + duration, duration };
        end += duration;
        return entry;
      })
    ).flat();
  },
  position(timeline, elapsed) {
    const index = timeline.findIndex(entry => elapsed < entry.end);
    if (index < 0) return null;
    const entry = timeline[index];
    const progress = Math.max(0, Math.min(1, (elapsed - entry.start) / entry.duration));
    const beat = entry.phase.action === 'pump' ? Math.floor((elapsed - entry.start) / entry.phase.sec_per_rep) : -1;
    return { ...entry, index, progress, beat, remaining: Math.ceil(entry.end - elapsed),
      reps: entry.phase.reps - beat };
  }
};
