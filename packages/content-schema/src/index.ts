import { z } from 'zod';

export const TierSchema = z.enum(['basic', 'intermediate', 'pro']);
export type Tier = z.infer<typeof TierSchema>;

export const TourStepSchema = z.object({
  target: z.string(),
  title: z.string(),
  text: z.string(),
  side: z.enum(['top', 'right', 'bottom', 'left']).optional(),
  requireAction: z.enum(['click', 'input', 'none']).optional(),
});
export type TourStep = z.infer<typeof TourStepSchema>;

export const QuizDifficultySchema = z.enum(['basic', 'intermediate', 'thinking']);
export type QuizDifficulty = z.infer<typeof QuizDifficultySchema>;

export const QuizQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  options: z.array(z.string()).min(2),
  correct: z.number().int().min(0),
  explainRight: z.string(),
  explainWrong: z.string(),
  difficulty: QuizDifficultySchema.optional(),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const BaseStepSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
});

export const ReadStepSchema = BaseStepSchema.extend({
  type: z.literal('read'),
  body: z.string(),
});

export const TourStepDefSchema = BaseStepSchema.extend({
  type: z.literal('tour'),
  tourId: z.string(),
  steps: z.array(TourStepSchema),
});

export const SimulatorStepSchema = BaseStepSchema.extend({
  type: z.literal('simulator'),
  sim: z.string(),
  config: z.record(z.unknown()),
  goal: z
    .object({
      description: z.string(),
      targetProperty: z.string(),
      condition: z.enum(['lte', 'gte', 'eq']),
      targetValue: z.number(),
    })
    .optional(),
  hints: z.array(z.string()).default([]),
});

export const OnchainStepSchema = BaseStepSchema.extend({
  type: z.literal('onchain'),
  task: z.string(),
  instructions: z.string(),
  hints: z.array(z.string()).default([]),
});

export const RevealStepSchema = BaseStepSchema.extend({
  type: z.literal('reveal'),
  title: z.string(),
  body: z.string(),
});

export const QuizStepSchema = BaseStepSchema.extend({
  type: z.literal('quiz'),
  questions: z.array(QuizQuestionSchema),
  passScore: z.number().int().min(1),
});

export const DeepDiveStepSchema = BaseStepSchema.extend({
  type: z.literal('deepdive'),
  title: z.string(),
  body: z.string(),
});

export const CaseStepSchema = BaseStepSchema.extend({
  type: z.literal('case'),
  caseId: z.string(),
});

export const ExploreStepSchema = BaseStepSchema.extend({
  type: z.literal('explore'),
  cardIds: z.array(z.string()),
});

export const StepSchema = z.discriminatedUnion('type', [
  ReadStepSchema,
  TourStepDefSchema,
  SimulatorStepSchema,
  OnchainStepSchema,
  RevealStepSchema,
  QuizStepSchema,
  DeepDiveStepSchema,
  CaseStepSchema,
  ExploreStepSchema,
]);
export type Step = z.infer<typeof StepSchema>;

export const LessonSchema = z.object({
  id: z.string(),
  tier: TierSchema,
  order: z.number().int(),
  title: z.string(),
  estMinutes: z.number().positive(),
  objectives: z.array(z.string()).min(1),
  requires: z.array(z.string()).default([]),
  freePreview: z.boolean().optional(),
  glossaryTerms: z.array(z.string()).default([]),
  steps: z.array(StepSchema).min(1),
  explore: z.array(z.string()).default([]),
  disclaimer: z.literal('not-financial-advice').optional(),
  lastVerified: z.string().optional(),
});
export type Lesson = z.infer<typeof LessonSchema>;

export const GlossaryTermSchema = z.object({
  id: z.string(),
  term: z.string(),
  definition: z.string(),
  category: z.string().optional(),
  introducedInLesson: z.string().optional(),
});
export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>;

export const ExploreCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  whatItDoes: z.string(),
  watchOutFor: z.string(),
  url: z.string().url(),
  lastVerified: z.string(),
});
export type ExploreCard = z.infer<typeof ExploreCardSchema>;

export const CaseActorSchema = z.object({
  label: z.string(),
  role: z.string(),
  address: z.string().optional(),
  addressKind: z
    .enum(['wallet', 'protocol-account', 'token-mint', 'program', 'dao'])
    .optional(),
  note: z.string().optional(),
  explorerUrl: z.string().url().optional(),
  source: z.string().optional(),
});
export type CaseActor = z.infer<typeof CaseActorSchema>;

export const CaseTxSchema = z.object({
  label: z.string(),
  time: z.string().optional(),
  description: z.string(),
  signature: z.string().optional(),
  explorerUrl: z.string().url().optional(),
});
export type CaseTx = z.infer<typeof CaseTxSchema>;

export const CaseSourceSchema = z.object({
  label: z.string(),
  url: z.string().url(),
});
export type CaseSource = z.infer<typeof CaseSourceSchema>;

export const CaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  protocol: z.string(),
  chain: z.string().default('Solana'),
  date: z.string(),
  dateLabel: z.string(),
  lossUsd: z.string(),
  category: z.string(),
  status: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('advanced'),
  tldr: z.string(),
  lessonIds: z.array(z.string()).default([]),
  labLink: z.string().optional(),
  labLabel: z.string().optional(),
  mechanism: z.string(),
  timeline: z.array(
    z.object({ time: z.string(), event: z.string() }),
  ),
  actors: z.array(CaseActorSchema).default([]),
  transactions: z.array(CaseTxSchema).default([]),
  researchMethod: z.array(
    z.object({ step: z.string(), detail: z.string() }),
  ),
  redFlags: z.array(z.string()).min(1),
  sources: z.array(CaseSourceSchema).min(1),
  glossaryTerms: z.array(z.string()).default([]),
});
export type Case = z.infer<typeof CaseSchema>;
