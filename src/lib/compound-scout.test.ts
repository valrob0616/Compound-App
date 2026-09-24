import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  REQUIRED_STAGE_IDS,
  assertScoutContent,
  choiceIsCorrect,
  correctChoiceId,
  firstOpenScenario,
  pointsForAnswer,
  roundScore,
  sanitizeAnswers,
  scenarioCount,
  stageScore,
  validateScoutContent,
  withoutStageAnswers,
  type ScoutAnswers,
  type ScoutContent,
  type ScoutStage,
} from './compound-scout.ts';

const contentPath = join(dirname(fileURLToPath(import.meta.url)), '../data/compound-scout.json');
const content = assertScoutContent(JSON.parse(readFileSync(contentPath, 'utf8')));

function fixtureStage(): ScoutStage {
  return {
    id: 'fixture',
    title: 'Fixture',
    summary: 'A short stage used only to check scoring.',
    scenarios: [
      {
        id: 'one',
        title: 'First',
        prompt: 'A prompt long enough to stand in for a real scenario card in the scorer.',
        lookFor: 'A teach-back long enough to satisfy the content rule if this fixture were ever validated as shipped copy.',
        choices: [
          { id: 'no', label: 'A wrong look that still reads as a full choice.', correct: false },
          { id: 'yes', label: 'The look this fixture treats as correct.', correct: true },
        ],
      },
      {
        id: 'two',
        title: 'Second',
        prompt: 'Another prompt long enough to stand in for a real scenario card.',
        lookFor: 'Another teach-back long enough that the fixture mirrors the shipped content shape.',
        choices: [
          { id: 'a', label: 'First wrong option written as a full sentence.', correct: false },
          { id: 'b', label: 'The correct option for the second card.', correct: true },
          { id: 'c', label: 'A third option that is also wrong.', correct: false },
        ],
      },
    ],
  };
}

test('bundled Compound Scout content matches the stage curriculum', () => {
  assert.equal(validateScoutContent(content).length, 0);
  assert.equal(content.id, 'compound-scout');
  const ids = content.stages.map((stage) => stage.id);
  assert.deepEqual(ids.slice(0, REQUIRED_STAGE_IDS.length), [...REQUIRED_STAGE_IDS]);
  for (const id of REQUIRED_STAGE_IDS) {
    assert.equal(ids.includes(id), true);
  }
  const total = scenarioCount(content);
  assert.equal(total >= 12, true, `expected at least 12 scenarios, got ${total}`);
  assert.equal(content.stages.every((stage) => stage.scenarios.length >= 2), true);
});

test('each bundled scenario has one correct look and a practical teach-back', () => {
  const seen = new Set<string>();
  for (const stage of content.stages) {
    for (const scenario of stage.scenarios) {
      assert.equal(seen.has(scenario.id), false);
      seen.add(scenario.id);
      assert.equal(scenario.choices.length >= 2 && scenario.choices.length <= 4, true);
      const correct = scenario.choices.filter((choice) => choice.correct);
      assert.equal(correct.length, 1);
      assert.equal(correctChoiceId(scenario), correct[0]?.id);
      assert.equal(scenario.lookFor.length >= 80, true);
      assert.equal(choiceIsCorrect(scenario, correct[0]!.id), true);
      assert.equal(pointsForAnswer(scenario, correct[0]!.id), 1);
      const wrong = scenario.choices.find((choice) => !choice.correct);
      assert.ok(wrong);
      assert.equal(pointsForAnswer(scenario, wrong.id), 0);
      assert.equal(pointsForAnswer(scenario, undefined), 0);
    }
  }
});

test('disclaimer stays educational and is not legal or financial advice', () => {
  const disclaimer = content.disclaimer.toLowerCase();
  assert.equal(disclaimer.includes('educational'), true);
  assert.equal(disclaimer.includes('not legal'), true);
  assert.equal(disclaimer.includes('financial'), true);
});

test('bundled scenarios teach the Family Compound checklist', () => {
  const haystack = content.stages
    .flatMap((stage) =>
      stage.scenarios.flatMap((scenario) => [
        scenario.title,
        scenario.prompt,
        scenario.lookFor,
        ...scenario.choices.filter((choice) => choice.correct).map((choice) => choice.label),
      ]),
    )
    .join('\n')
    .toLowerCase();

  const required = [
    '55–80',
    '5–7 acre',
    '30–45',
    'tca 13-7-114',
    'tdec',
    'pavilion',
    'rv dump',
    'fixed-wireless',
    '20 feet',
    '13 feet 6 inches',
    '150 feet',
    '1.5–2 acres per cow-calf',
    'downwind',
    'sacrifice lot',
    'greenbelt',
    'rollback',
    'conditional use',
    'land llc',
    'buy-out',
    'separate entity',
    'owner-operator',
    '$600,000',
    'fsa guarantee',
    'golf',
    'sight line',
    'cleared',
  ];

  for (const phrase of required) {
    assert.equal(haystack.includes(phrase), true, `missing checklist phrase: ${phrase}`);
  }
});

test('stage badge requires every scenario correct', () => {
  const stage = fixtureStage();
  const none = stageScore(stage, {});
  assert.deepEqual(
    { correct: none.correct, badge: none.badge, complete: none.complete },
    { correct: 0, badge: false, complete: false },
  );

  const partial: ScoutAnswers = { one: 'yes' };
  const mid = stageScore(stage, partial);
  assert.equal(mid.correct, 1);
  assert.equal(mid.badge, false);
  assert.equal(mid.complete, false);

  const wrong: ScoutAnswers = { one: 'yes', two: 'a' };
  const missed = stageScore(stage, wrong);
  assert.equal(missed.correct, 1);
  assert.equal(missed.complete, true);
  assert.equal(missed.badge, false);

  const perfect: ScoutAnswers = { one: 'yes', two: 'b' };
  const earned = stageScore(stage, perfect);
  assert.equal(earned.correct, 2);
  assert.equal(earned.badge, true);
  assert.equal(earned.complete, true);

  const unknownChoice: ScoutAnswers = { one: 'missing', two: 'b' };
  assert.equal(stageScore(stage, unknownChoice).badge, false);
  assert.equal(stageScore(stage, unknownChoice).correct, 1);
});

test('round score sums stages and ignores unknown scenario ids', () => {
  const wrapped: ScoutContent = {
    id: 'fixture-round',
    title: 'Fixture',
    subtitle: 'A subtitle long enough for the content type in this scoring test.',
    disclaimer: 'Educational only — not legal, financial, engineering, or land-use advice for this fixture.',
    stages: [fixtureStage(), { ...fixtureStage(), id: 'fixture-b', scenarios: fixtureStage().scenarios.map((scenario) => ({ ...scenario, id: `${scenario.id}-b` })) }],
  };
  const answers: ScoutAnswers = {
    one: 'yes',
    two: 'b',
    'one-b': 'no',
    'two-b': 'b',
    'not-a-scenario': 'yes',
  };
  const score = roundScore(wrapped, answers);
  assert.equal(score.total, 4);
  assert.equal(score.correct, 3);
  assert.equal(score.badges, 1);
  assert.equal(score.stages[0]?.badge, true);
  assert.equal(score.stages[1]?.badge, false);
});

test('continue pointer and stage replay only touch that stage', () => {
  const stage = fixtureStage();
  const answers: ScoutAnswers = { one: 'yes', two: 'a', keep: 'elsewhere' };
  assert.deepEqual(firstOpenScenario({ ...content, stages: [stage] }, {}), { stageIndex: 0, scenarioIndex: 0 });
  assert.deepEqual(firstOpenScenario({ ...content, stages: [stage] }, { one: 'yes' }), {
    stageIndex: 0,
    scenarioIndex: 1,
  });
  assert.equal(firstOpenScenario({ ...content, stages: [stage] }, { one: 'yes', two: 'b' }), null);

  const cleared = withoutStageAnswers(stage, answers);
  assert.deepEqual(cleared, { keep: 'elsewhere' });
});

test('sanitizeAnswers drops junk and keeps recorded choices', () => {
  assert.deepEqual(sanitizeAnswers(null), {});
  assert.deepEqual(sanitizeAnswers(['one']), {});
  assert.deepEqual(sanitizeAnswers({ one: 'yes', two: '', three: 4, four: 'b' }), { one: 'yes', four: 'b' });
});

test('validator flags a second correct choice and a short choice list', () => {
  const broken = structuredClone(content) as ScoutContent;
  const first = broken.stages[0]?.scenarios[0];
  assert.ok(first);
  for (const choice of first.choices) choice.correct = true;
  const twoCorrect = validateScoutContent(broken);
  assert.equal(
    twoCorrect.some((issue) => issue.message === 'exactly one choice must be correct'),
    true,
  );

  const thin = structuredClone(content) as ScoutContent;
  const second = thin.stages[0]?.scenarios[1];
  assert.ok(second);
  second.choices = second.choices.slice(0, 1);
  const tooFew = validateScoutContent(thin);
  assert.equal(
    tooFew.some((issue) => issue.path.endsWith('.choices') && issue.message.includes('2 to 4')),
    true,
  );
});
