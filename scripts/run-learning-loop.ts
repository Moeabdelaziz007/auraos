// Background Learning Loop Runner
// Ensures the learning system continuously ingests events and produces recommendations

import { initializeLearningSystem, getLearningSystem } from '../server/learning-automation.ts';
import { getSmartLearningAI } from '../server/smart-learning-ai.ts';

// Config via env
const ENABLE_CONTINUOUS_LEARNING = process.env.ENABLE_CONTINUOUS_LEARNING !== 'false';
const LOOP_INTERVAL_MS = Number(process.env.LEARNING_LOOP_INTERVAL_MS || 30000); // 30s default
const USER_SAMPLE = process.env.LEARNING_LOOP_USER_SAMPLE || 'demo-user';

async function main() {
  if (!ENABLE_CONTINUOUS_LEARNING) {
    console.log('[learning-loop] Continuous learning disabled via ENABLE_CONTINUOUS_LEARNING=false');
    return;
  }

  const system = initializeLearningSystem();
  const smart = getSmartLearningAI();

  console.log('[learning-loop] Starting continuous learning loop...', { LOOP_INTERVAL_MS, USER_SAMPLE });

  // Seed a minimal recurring tick that:
  // 1) simulates low-risk activities if none exist (keeps streaks alive)
  // 2) queries recommendations to keep them fresh
  // 3) invokes smart-learning meta update on a heartbeat context
  const tick = async () => {
    try {
      const now = new Date();

      // Record a heartbeat feature usage to keep learning streaks/current recency alive
      await system.recordActivity({
        userId: USER_SAMPLE,
        type: 'feature_usage',
        category: 'learning_heartbeat',
        points: 5,
        metadata: { source: 'learning_loop', at: now.toISOString() },
        difficulty: 'beginner',
      });

      // Pull recommendations (forces re-rank based on updated profile)
      const recs = system.getUserRecommendations(USER_SAMPLE);
      if (recs.length) {
        console.log(`[learning-loop] Top recommendation: ${recs[0].title} (prio ${recs[0].priority})`);
      }

      // Meta-learning heartbeat
      // We pass a lightweight context so SmartLearning can update performance metrics over time.
      // This expects server/smart-learning-ai.ts to be resilient to minimal contexts.
      const context: any = {
        userId: USER_SAMPLE,
        taskType: 'meta_heartbeat',
        input: { note: 'background_heartbeat' },
        feedback: { rating: 0.5 },
      };

      if (smart && typeof (smart as any).processLearningRequest === 'function') {
        await (smart as any).processLearningRequest(context);
      }
    } catch (err) {
      console.error('[learning-loop] Tick error:', err);
    }
  };

  // Immediate tick, then interval
  await tick();
  const interval = setInterval(tick, LOOP_INTERVAL_MS);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n[learning-loop] Stopping...');
    clearInterval(interval);
    process.exit(0);
  });
}

main().catch((e) => {
  console.error('[learning-loop] Fatal error:', e);
  process.exit(1);
});
