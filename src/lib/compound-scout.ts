/**
 * Compound Scout — scoring and content checks for the Learn tab.
 * Scenario copy lives in src/data/compound-scout.json (bundled, offline).
 * Add a scenario there; run `npm test` to confirm the shape.
 */

export type ScoutChoice = {
  id: string;
  label: string;
  correct: boolean;
};

export type ScoutScenario = {
  id: string;
  title: string;
  prompt: string;
  choices: ScoutChoice[];
  /** Teach-back shown after the player answers. */
  lookFor: string;
};

export type ScoutStage = {
  id: string;
  title: string;
  summary: string;
  scenarios: ScoutScenario[];
};

export type ScoutContent = {
  id: string;
  title: string;
  subtitle: string;
  disclaimer: string;
  stages: ScoutStage[];
};

/** scenarioId -> chosen choice id */
export type ScoutAnswers = Record<string, string>;

export type ContentIssue = {
  path: string;
  message: string;
};

export type StageScore = {
  stageId: string;
  correct: number;
  total: number;
  /** True only when every scenario in the stage was answered correctly. */
  badge: boolean;
  /** True when every scenario has a recorded answer. */
  complete: boolean;
};

export type RoundScore = {
  correct: number;
  total: number;
  badges: number;
  stages: StageScore[];
};

export type ScenarioPointer = {
  stageIndex: number;
  scenarioIndex: number;
};

/** Stages shipped with the first Learn release. Extra stages may follow these. */
export const REQUIRED_STAGE_IDS = [
  'land-access',
  'water-septic',
  'zoning-rules',
  'layout-buildings',
  'utilities-resilience',
  'financing-ownership',
] as const;

const MIN_PROMPT = 40;
const MIN_LOOK_FOR = 80;
const MIN_CHOICE_LABEL = 8;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function push(issues: ContentIssue[], path: string, message: string) {
  issues.push({ path, message });
}

function requireText(value: unknown, path: string, issues: ContentIssue[], min: number): boolean {
  if (typeof value !== 'string' || value.trim().length < min) {
    push(issues, path, `must be text of at least ${min} characters`);
    return false;
  }
  return true;
}

export function validateScoutContent(value: unknown): ContentIssue[] {
  const issues: ContentIssue[] = [];
  if (!isRecord(value)) {
    push(issues, 'content', 'must be an object');
    return issues;
  }

  requireText(value.id, 'id', issues, 1);
  requireText(value.title, 'title', issues, 1);
  requireText(value.subtitle, 'subtitle', issues, 20);
  requireText(value.disclaimer, 'disclaimer', issues, 40);

  if (!Array.isArray(value.stages) || value.stages.length === 0) {
    push(issues, 'stages', 'must be a non-empty array');
    return issues;
  }

  const stageIds = new Set<string>();
  const scenarioIds = new Set<string>();

  value.stages.forEach((stageValue, stageIndex) => {
    const stagePath = `stages[${stageIndex}]`;
    if (!isRecord(stageValue)) {
      push(issues, stagePath, 'must be an object');
      return;
    }

    if (requireText(stageValue.id, `${stagePath}.id`, issues, 1)) {
      const id = stageValue.id as string;
      if (stageIds.has(id)) push(issues, `${stagePath}.id`, `duplicate stage id "${id}"`);
      stageIds.add(id);
    }
    requireText(stageValue.title, `${stagePath}.title`, issues, 1);
    requireText(stageValue.summary, `${stagePath}.summary`, issues, 20);

    if (!Array.isArray(stageValue.scenarios) || stageValue.scenarios.length === 0) {
      push(issues, `${stagePath}.scenarios`, 'must include at least one scenario');
      return;
    }

    stageValue.scenarios.forEach((scenarioValue, scenarioIndex) => {
      const scenarioPath = `${stagePath}.scenarios[${scenarioIndex}]`;
      if (!isRecord(scenarioValue)) {
        push(issues, scenarioPath, 'must be an object');
        return;
      }

      if (requireText(scenarioValue.id, `${scenarioPath}.id`, issues, 1)) {
        const id = scenarioValue.id as string;
        if (scenarioIds.has(id)) push(issues, `${scenarioPath}.id`, `duplicate scenario id "${id}"`);
        scenarioIds.add(id);
      }
      requireText(scenarioValue.title, `${scenarioPath}.title`, issues, 1);
      requireText(scenarioValue.prompt, `${scenarioPath}.prompt`, issues, MIN_PROMPT);
      requireText(scenarioValue.lookFor, `${scenarioPath}.lookFor`, issues, MIN_LOOK_FOR);

      if (!Array.isArray(scenarioValue.choices)) {
        push(issues, `${scenarioPath}.choices`, 'must be an array of 2 to 4 choices');
        return;
      }

      const choiceCount = scenarioValue.choices.length;
      if (choiceCount < 2 || choiceCount > 4) {
        push(issues, `${scenarioPath}.choices`, 'must include 2 to 4 choices');
      }

      const choiceIds = new Set<string>();
      let correctCount = 0;
      scenarioValue.choices.forEach((choiceValue, choiceIndex) => {
        const choicePath = `${scenarioPath}.choices[${choiceIndex}]`;
        if (!isRecord(choiceValue)) {
          push(issues, choicePath, 'must be an object');
          return;
        }
        if (requireText(choiceValue.id, `${choicePath}.id`, issues, 1)) {
          const id = choiceValue.id as string;
          if (choiceIds.has(id)) push(issues, `${choicePath}.id`, `duplicate choice id "${id}"`);
          choiceIds.add(id);
        }
        requireText(choiceValue.label, `${choicePath}.label`, issues, MIN_CHOICE_LABEL);
        if (typeof choiceValue.correct !== 'boolean') {
          push(issues, `${choicePath}.correct`, 'must be true or false');
        } else if (choiceValue.correct) {
          correctCount += 1;
        }
      });

      if (correctCount !== 1) {
        push(issues, `${scenarioPath}.choices`, 'exactly one choice must be correct');
      }
    });
  });

  return issues;
}

export function assertScoutContent(value: unknown): ScoutContent {
  const issues = validateScoutContent(value);
  if (issues.length > 0) {
    const detail = issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ');
    throw new Error(`Compound Scout content is invalid: ${detail}`);
  }
  return value as ScoutContent;
}

export function scenarioCount(content: ScoutContent): number {
  return content.stages.reduce((sum, stage) => sum + stage.scenarios.length, 0);
}

export function findScenario(content: ScoutContent, scenarioId: string): ScoutScenario | undefined {
  for (const stage of content.stages) {
    const scenario = stage.scenarios.find((item) => item.id === scenarioId);
    if (scenario) return scenario;
  }
  return undefined;
}

export function choiceIsCorrect(scenario: ScoutScenario, choiceId: string): boolean {
  return scenario.choices.some((choice) => choice.id === choiceId && choice.correct);
}

export function correctChoiceId(scenario: ScoutScenario): string | undefined {
  const correct = scenario.choices.filter((choice) => choice.correct);
  if (correct.length !== 1) return undefined;
  return correct[0]?.id;
}

/** One point for a correct recorded choice, otherwise zero. */
export function pointsForAnswer(scenario: ScoutScenario, choiceId: string | undefined): number {
  if (!choiceId) return 0;
  return choiceIsCorrect(scenario, choiceId) ? 1 : 0;
}

export function stageScore(stage: ScoutStage, answers: ScoutAnswers): StageScore {
  let correct = 0;
  let answered = 0;
  for (const scenario of stage.scenarios) {
    const choiceId = answers[scenario.id];
    if (typeof choiceId !== 'string' || choiceId.length === 0) continue;
    answered += 1;
    correct += pointsForAnswer(scenario, choiceId);
  }
  const total = stage.scenarios.length;
  return {
    stageId: stage.id,
    correct,
    total,
    badge: total > 0 && correct === total,
    complete: total > 0 && answered === total,
  };
}

export function roundScore(content: ScoutContent, answers: ScoutAnswers): RoundScore {
  const stages = content.stages.map((stage) => stageScore(stage, answers));
  return {
    correct: stages.reduce((sum, stage) => sum + stage.correct, 0),
    total: stages.reduce((sum, stage) => sum + stage.total, 0),
    badges: stages.filter((stage) => stage.badge).length,
    stages,
  };
}

export function firstOpenScenario(content: ScoutContent, answers: ScoutAnswers): ScenarioPointer | null {
  for (let stageIndex = 0; stageIndex < content.stages.length; stageIndex += 1) {
    const stage = content.stages[stageIndex];
    if (!stage) continue;
    for (let scenarioIndex = 0; scenarioIndex < stage.scenarios.length; scenarioIndex += 1) {
      const scenario = stage.scenarios[scenarioIndex];
      if (!scenario) continue;
      const choiceId = answers[scenario.id];
      if (typeof choiceId !== 'string' || choiceId.length === 0) {
        return { stageIndex, scenarioIndex };
      }
    }
  }
  return null;
}

export function withoutStageAnswers(stage: ScoutStage, answers: ScoutAnswers): ScoutAnswers {
  const drop = new Set(stage.scenarios.map((scenario) => scenario.id));
  return Object.fromEntries(Object.entries(answers).filter(([id]) => !drop.has(id)));
}

export function sanitizeAnswers(value: unknown): ScoutAnswers {
  if (!isRecord(value)) return {};
  const answers: ScoutAnswers = {};
  for (const [scenarioId, choiceId] of Object.entries(value)) {
    if (typeof choiceId === 'string' && choiceId.length > 0) answers[scenarioId] = choiceId;
  }
  return answers;
}
