import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui';
import { useAppTheme } from '@/context/ThemeContext';
import rawScout from '@/data/compound-scout.json';
import {
  assertScoutContent,
  choiceIsCorrect,
  correctChoiceId,
  firstOpenScenario,
  roundScore,
  sanitizeAnswers,
  stageScore,
  withoutStageAnswers,
  type ScoutAnswers,
  type ScoutScenario,
  type ScoutStage,
} from '@/lib/compound-scout';
import { getJson, setJson, storageKeys } from '@/lib/storage';
import { radii, spacing } from '@/theme';
import { serif } from '@/theme/typography';

const scout = assertScoutContent(rawScout);

type Phase =
  | { name: 'trail' }
  | { name: 'scenario'; stageIndex: number; scenarioIndex: number }
  | { name: 'stage-done'; stageIndex: number }
  | { name: 'round-done' };

export function CompoundScout() {
  const { colors } = useAppTheme();
  const [answers, setAnswers] = useState<ScoutAnswers | null>(null);
  const [phase, setPhase] = useState<Phase>({ name: 'trail' });
  const [confirm, setConfirm] = useState<null | 'round' | number>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    void getJson<unknown>(storageKeys.compoundScout, {}).then((saved) => {
      setAnswers(sanitizeAnswers(saved));
    });
  }, []);

  useEffect(() => {
    if (!answers) return;
    void setJson(storageKeys.compoundScout, answers);
  }, [answers]);

  const phaseKey =
    phase.name === 'scenario'
      ? `scenario-${phase.stageIndex}-${phase.scenarioIndex}`
      : phase.name === 'stage-done'
        ? `stage-${phase.stageIndex}`
        : phase.name;

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setConfirm(null);
  }, [phaseKey]);

  const score = useMemo(() => (answers ? roundScore(scout, answers) : null), [answers]);

  if (!answers || !score) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  const openStage = (stageIndex: number) => {
    const stage = scout.stages[stageIndex];
    if (!stage) return;
    if (stageScore(stage, answers).complete) {
      setPhase({ name: 'stage-done', stageIndex });
      return;
    }
    const scenarioIndex = Math.max(
      0,
      stage.scenarios.findIndex((scenario) => !answers[scenario.id]),
    );
    setPhase({ name: 'scenario', stageIndex, scenarioIndex });
  };

  const continueScout = () => {
    const next = firstOpenScenario(scout, answers);
    if (!next) {
      setPhase({ name: 'round-done' });
      return;
    }
    setPhase({ name: 'scenario', ...next });
  };

  const applyConfirm = () => {
    if (confirm === 'round') {
      setAnswers({});
      setPhase({ name: 'trail' });
      setConfirm(null);
      return;
    }
    if (typeof confirm !== 'number') return;
    const stage = scout.stages[confirm];
    if (!stage) {
      setConfirm(null);
      return;
    }
    const stageIndex = confirm;
    setAnswers((current) => withoutStageAnswers(stage, current ?? {}));
    setPhase({ name: 'scenario', stageIndex, scenarioIndex: 0 });
    setConfirm(null);
  };

  const choose = (scenarioId: string, choiceId: string) => {
    setAnswers((current) => {
      const prev = current ?? {};
      if (prev[scenarioId]) return prev;
      return { ...prev, [scenarioId]: choiceId };
    });
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}
    >
      {phase.name === 'trail' ? (
        <Trail
          answers={answers}
          correct={score.correct}
          total={score.total}
          badges={score.badges}
          onContinue={continueScout}
          onOpenStage={openStage}
          confirming={confirm === 'round'}
          onAskReplay={() => setConfirm('round')}
          onConfirmReplay={applyConfirm}
          onCancelReplay={() => setConfirm(null)}
        />
      ) : null}
      {phase.name === 'scenario' ? (
        <ScenarioPlay
          stage={scout.stages[phase.stageIndex]!}
          stageIndex={phase.stageIndex}
          scenario={scout.stages[phase.stageIndex]!.scenarios[phase.scenarioIndex]!}
          scenarioIndex={phase.scenarioIndex}
          choiceId={answers[scout.stages[phase.stageIndex]!.scenarios[phase.scenarioIndex]!.id]}
          onBack={() => setPhase({ name: 'trail' })}
          onChoose={choose}
          onNext={() => {
            const stage = scout.stages[phase.stageIndex]!;
            if (phase.scenarioIndex + 1 < stage.scenarios.length) {
              setPhase({
                name: 'scenario',
                stageIndex: phase.stageIndex,
                scenarioIndex: phase.scenarioIndex + 1,
              });
              return;
            }
            setPhase({ name: 'stage-done', stageIndex: phase.stageIndex });
          }}
        />
      ) : null}
      {phase.name === 'stage-done' ? (
        <StageDone
          stage={scout.stages[phase.stageIndex]!}
          stageIndex={phase.stageIndex}
          answers={answers}
          onTrail={() => setPhase({ name: 'trail' })}
          confirming={confirm === phase.stageIndex}
          onAskReplay={() => setConfirm(phase.stageIndex)}
          onConfirmReplay={applyConfirm}
          onCancelReplay={() => setConfirm(null)}
          onNext={() => {
            const nextIndex = phase.stageIndex + 1;
            if (nextIndex >= scout.stages.length) {
              setPhase({ name: 'round-done' });
              return;
            }
            const next = scout.stages[nextIndex]!;
            if (stageScore(next, answers).complete) {
              setPhase({ name: 'stage-done', stageIndex: nextIndex });
              return;
            }
            const scenarioIndex = Math.max(
              0,
              next.scenarios.findIndex((scenario) => !answers[scenario.id]),
            );
            setPhase({ name: 'scenario', stageIndex: nextIndex, scenarioIndex });
          }}
        />
      ) : null}
      {phase.name === 'round-done' ? (
        <RoundDone
          answers={answers}
          correct={score.correct}
          total={score.total}
          badges={score.badges}
          onTrail={() => setPhase({ name: 'trail' })}
          confirming={confirm === 'round'}
          onAskReplay={() => setConfirm('round')}
          onConfirmReplay={applyConfirm}
          onCancelReplay={() => setConfirm(null)}
          onOpenStage={openStage}
        />
      ) : null}
      <Disclaimer />
    </ScrollView>
  );
}

function Trail({
  answers,
  correct,
  total,
  badges,
  onContinue,
  onOpenStage,
  confirming,
  onAskReplay,
  onConfirmReplay,
  onCancelReplay,
}: {
  answers: ScoutAnswers;
  correct: number;
  total: number;
  badges: number;
  onContinue: () => void;
  onOpenStage: (stageIndex: number) => void;
  confirming: boolean;
  onAskReplay: () => void;
  onConfirmReplay: () => void;
  onCancelReplay: () => void;
}) {
  const { colors } = useAppTheme();
  const started = Object.keys(answers).length > 0;
  const done = firstOpenScenario(scout, answers) === null;
  const cta = !started ? 'Start the scout' : done ? 'View your scout' : 'Continue the scout';

  return (
    <View>
      <Text style={[styles.kicker, { color: colors.accent }]}>Learn</Text>
      <Text style={[styles.title, { color: colors.text }]}>{scout.title}</Text>
      <Text style={[styles.lede, { color: colors.textMuted }]}>{scout.subtitle}</Text>
      <ScoreMeter correct={correct} total={total} badges={badges} />
      <PrimaryButton label={cta} onPress={onContinue} accessibilityHint="Walk the buy and build stages" />
      {started ? (
        <View style={styles.actionGap}>
          {confirming ? (
            <ConfirmCard
              title="Replay the round?"
              body="This clears every stage and starts Compound Scout over."
              confirmLabel="Replay the round"
              onConfirm={onConfirmReplay}
              onCancel={onCancelReplay}
            />
          ) : (
            <PrimaryButton variant="secondary" label="Replay the round" onPress={onAskReplay} />
          )}
        </View>
      ) : null}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>The trail</Text>
      <View>
        {scout.stages.map((stage, index) => {
          const stageResult = stageScore(stage, answers);
          return (
            <View key={stage.id} style={styles.trailRow}>
              <View style={styles.rail}>
                <View
                  style={[
                    styles.railDot,
                    {
                      backgroundColor: stageResult.badge ? colors.wheat : colors.card,
                      borderColor: stageResult.badge ? colors.wheat : colors.tint,
                    },
                  ]}
                >
                  {stageResult.badge ? (
                    <Ionicons name="ribbon" size={14} color={colors.header} />
                  ) : (
                    <Text style={[styles.railIndex, { color: colors.tint }]}>{index + 1}</Text>
                  )}
                </View>
                {index < scout.stages.length - 1 ? (
                  <View style={[styles.railLine, { backgroundColor: colors.border }]} />
                ) : null}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${stage.title}. ${stageResult.correct} of ${stageResult.total} correct. ${
                  stageResult.badge ? 'Badge earned.' : stageResult.complete ? 'Replay to earn the badge.' : 'Open this stage.'
                }`}
                onPress={() => onOpenStage(index)}
                style={({ pressed }) => [
                  styles.stageCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <View style={styles.stageTop}>
                  <Text style={[styles.stageTitle, { color: colors.text }]}>{stage.title}</Text>
                  {stageResult.badge ? (
                    <View style={[styles.badge, { backgroundColor: colors.wheat }]}>
                      <Text style={[styles.badgeText, { color: colors.header }]}>Badge</Text>
                    </View>
                  ) : (
                    <Text style={[styles.stageCount, { color: colors.textMuted }]}>
                      {stageResult.correct}/{stageResult.total}
                    </Text>
                  )}
                </View>
                <Text style={[styles.stageSummary, { color: colors.textMuted }]}>{stage.summary}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function ScenarioPlay({
  stage,
  stageIndex,
  scenario,
  scenarioIndex,
  choiceId,
  onBack,
  onChoose,
  onNext,
}: {
  stage: ScoutStage;
  stageIndex: number;
  scenario: ScoutScenario;
  scenarioIndex: number;
  choiceId: string | undefined;
  onBack: () => void;
  onChoose: (scenarioId: string, choiceId: string) => void;
  onNext: () => void;
}) {
  const { colors } = useAppTheme();
  const answered = Boolean(choiceId);
  const correctId = correctChoiceId(scenario);
  const pickedCorrect = choiceId ? choiceIsCorrect(scenario, choiceId) : false;
  const last = scenarioIndex + 1 === stage.scenarios.length;

  return (
    <View>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to the trail" onPress={onBack} style={styles.backRow}>
        <Ionicons name="chevron-back" size={18} color={colors.tint} />
        <Text style={[styles.backLabel, { color: colors.tint }]}>Trail</Text>
      </Pressable>
      <Text style={[styles.kicker, { color: colors.accent }]}>
        Stage {stageIndex + 1} of {scout.stages.length}
      </Text>
      <Text style={[styles.stageHeading, { color: colors.text }]}>{stage.title}</Text>
      <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
        Look {scenarioIndex + 1} of {stage.scenarios.length}
      </Text>
      <View style={[styles.promptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.promptTitle, { color: colors.text }]}>{scenario.title}</Text>
        <Text style={[styles.prompt, { color: colors.text }]}>{scenario.prompt}</Text>
      </View>
      <View style={styles.choiceList}>
        {scenario.choices.map((choice, index) => {
          const selected = choice.id === choiceId;
          const reveal = answered && choice.id === correctId;
          const wrongPick = answered && selected && !choice.correct;
          const borderColor = reveal ? colors.success : wrongPick ? colors.danger : colors.border;
          return (
            <Pressable
              key={choice.id}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: answered }}
              accessibilityLabel={`Choice ${index + 1}. ${choice.label}`}
              disabled={answered}
              onPress={() => onChoose(scenario.id, choice.id)}
              style={({ pressed }) => [
                styles.choice,
                {
                  backgroundColor: colors.card,
                  borderColor,
                  opacity: answered && !selected && !reveal ? 0.72 : pressed ? 0.9 : 1,
                },
              ]}
            >
              <View style={[styles.choiceMark, { backgroundColor: reveal ? colors.success : wrongPick ? colors.danger : colors.cardMuted }]}>
                {reveal ? (
                  <Ionicons name="checkmark" size={16} color={colors.card} />
                ) : wrongPick ? (
                  <Ionicons name="close" size={16} color={colors.card} />
                ) : (
                  <Text style={[styles.choiceLetter, { color: colors.text }]}>{String.fromCharCode(65 + index)}</Text>
                )}
              </View>
              <Text style={[styles.choiceLabel, { color: colors.text }]}>{choice.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {answered ? (
        <View
          accessibilityLiveRegion="polite"
          style={[styles.teachBack, { backgroundColor: colors.cardMuted, borderColor: pickedCorrect ? colors.success : colors.accent }]}
        >
          <Text style={[styles.teachKicker, { color: pickedCorrect ? colors.success : colors.accent }]}>
            {pickedCorrect ? "That's the one to look for" : 'A common miss'}
          </Text>
          <Text style={[styles.teachTitle, { color: colors.text }]}>What to look for</Text>
          <Text style={[styles.teachBody, { color: colors.text }]}>{scenario.lookFor}</Text>
        </View>
      ) : (
        <Text style={[styles.hint, { color: colors.textMuted }]}>Pick the look you would make before you write an offer.</Text>
      )}
      {answered ? (
        <View style={styles.actionGap}>
          <PrimaryButton label={last ? 'Finish stage' : 'Next look'} onPress={onNext} />
        </View>
      ) : null}
    </View>
  );
}

function StageDone({
  stage,
  stageIndex,
  answers,
  onTrail,
  confirming,
  onAskReplay,
  onConfirmReplay,
  onCancelReplay,
  onNext,
}: {
  stage: ScoutStage;
  stageIndex: number;
  answers: ScoutAnswers;
  onTrail: () => void;
  confirming: boolean;
  onAskReplay: () => void;
  onConfirmReplay: () => void;
  onCancelReplay: () => void;
  onNext: () => void;
}) {
  const { colors } = useAppTheme();
  const result = stageScore(stage, answers);
  const last = stageIndex === scout.stages.length - 1;
  const nextTitle = scout.stages[stageIndex + 1]?.title;

  return (
    <View>
      <Text style={[styles.kicker, { color: colors.accent }]}>Stage {stageIndex + 1}</Text>
      <Text style={[styles.title, { color: colors.text }]}>{stage.title}</Text>
      <Text style={[styles.lede, { color: colors.textMuted }]}>
        {result.correct} of {result.total} correct.
        {result.badge ? ' Badge earned for this stage.' : ' Replay the stage to earn the badge.'}
      </Text>
      {result.badge ? (
        <View style={[styles.badgeBanner, { backgroundColor: colors.card, borderColor: colors.wheat }]}>
          <Ionicons name="ribbon" size={28} color={colors.wheat} />
          <View style={styles.badgeCopy}>
            <Text style={[styles.teachTitle, { color: colors.text }]}>{stage.title}</Text>
            <Text style={[styles.stageSummary, { color: colors.textMuted }]}>Every look in this stage was the one to make.</Text>
          </View>
        </View>
      ) : null}
      <View style={styles.resultList}>
        {stage.scenarios.map((scenario) => {
          const ok = choiceIsCorrect(scenario, answers[scenario.id] ?? '');
          return (
            <View key={scenario.id} style={[styles.resultRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Ionicons name={ok ? 'checkmark-circle' : 'refresh-circle'} size={20} color={ok ? colors.success : colors.accent} />
              <View style={styles.resultCopy}>
                <Text style={[styles.resultTitle, { color: colors.text }]}>{scenario.title}</Text>
                {ok ? null : <Text style={[styles.teachBody, { color: colors.textMuted }]}>{scenario.lookFor}</Text>}
              </View>
            </View>
          );
        })}
      </View>
      <PrimaryButton label={last ? 'Finish the scout' : 'Next stage'} onPress={onNext} />
      {!last && nextTitle ? (
        <Text style={[styles.upNext, { color: colors.textMuted }]}>Up next: {nextTitle}</Text>
      ) : null}
      <View style={styles.actionGap}>
        {confirming ? (
          <ConfirmCard
            title={`Replay ${stage.title}?`}
            body="This clears the looks in this stage so you can earn the badge."
            confirmLabel="Replay this stage"
            onConfirm={onConfirmReplay}
            onCancel={onCancelReplay}
          />
        ) : (
          <PrimaryButton variant="secondary" label="Replay this stage" onPress={onAskReplay} />
        )}
      </View>
      <View style={styles.actionGap}>
        <PrimaryButton variant="ghost" label="Back to the trail" onPress={onTrail} />
      </View>
    </View>
  );
}

function RoundDone({
  answers,
  correct,
  total,
  badges,
  onTrail,
  confirming,
  onAskReplay,
  onConfirmReplay,
  onCancelReplay,
  onOpenStage,
}: {
  answers: ScoutAnswers;
  correct: number;
  total: number;
  badges: number;
  onTrail: () => void;
  confirming: boolean;
  onAskReplay: () => void;
  onConfirmReplay: () => void;
  onCancelReplay: () => void;
  onOpenStage: (stageIndex: number) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View>
      <Text style={[styles.kicker, { color: colors.accent }]}>Round complete</Text>
      <Text style={[styles.title, { color: colors.text }]}>Scout's notes</Text>
      <Text style={[styles.lede, { color: colors.textMuted }]}>
        {correct} of {total} looks, and {badges} of {scout.stages.length} stage badges. Replay any stage you want to sharpen.
      </Text>
      <ScoreMeter correct={correct} total={total} badges={badges} />
      {scout.stages.map((stage, index) => {
        const result = stageScore(stage, answers);
        return (
          <Pressable
            key={stage.id}
            accessibilityRole="button"
            accessibilityLabel={`${stage.title}, ${result.correct} of ${result.total}`}
            onPress={() => onOpenStage(index)}
            style={[styles.resultRow, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <Ionicons
              name={result.badge ? 'ribbon' : 'ellipse-outline'}
              size={20}
              color={result.badge ? colors.wheat : colors.textMuted}
            />
            <View style={styles.resultCopy}>
              <Text style={[styles.resultTitle, { color: colors.text }]}>{stage.title}</Text>
              <Text style={[styles.stageSummary, { color: colors.textMuted }]}>
                {result.correct} of {result.total}
                {result.badge ? ' · badge earned' : ' · replay to earn the badge'}
              </Text>
            </View>
          </Pressable>
        );
      })}
      <View style={styles.actionGap}>
        {confirming ? (
          <ConfirmCard
            title="Replay the round?"
            body="This clears every stage and starts Compound Scout over."
            confirmLabel="Replay the round"
            onConfirm={onConfirmReplay}
            onCancel={onCancelReplay}
          />
        ) : (
          <PrimaryButton label="Replay the round" onPress={onAskReplay} />
        )}
      </View>
      <View style={styles.actionGap}>
        <PrimaryButton variant="secondary" label="Back to the trail" onPress={onTrail} />
      </View>
    </View>
  );
}

function ConfirmCard({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.teachTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.stageSummary, { color: colors.textMuted }]}>{body}</Text>
      <View style={styles.actionGap}>
        <PrimaryButton label={confirmLabel} onPress={onConfirm} />
      </View>
      <View style={styles.actionGap}>
        <PrimaryButton variant="secondary" label="Keep my progress" onPress={onCancel} />
      </View>
    </View>
  );
}

function ScoreMeter({ correct, total, badges }: { correct: number; total: number; badges: number }) {
  const { colors } = useAppTheme();
  const ratio = total === 0 ? 0 : correct / total;
  return (
    <View
      style={styles.meterBlock}
      accessibilityRole="summary"
      accessibilityLabel={`${correct} of ${total} correct. ${badges} of ${scout.stages.length} badges.`}
    >
      <View style={[styles.meterTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.meterFill, { backgroundColor: colors.tint, width: `${Math.round(ratio * 100)}%` }]} />
      </View>
      <Text style={[styles.meterLabel, { color: colors.textMuted }]}>
        {correct} of {total} correct · {badges} of {scout.stages.length} badges
      </Text>
    </View>
  );
}

function Disclaimer() {
  const { colors } = useAppTheme();
  return (
    <Text
      style={[styles.disclaimer, { color: colors.textMuted }]}
      accessibilityRole="summary"
      accessibilityLabel={scout.disclaimer}
    >
      {scout.disclaimer}
    </Text>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.md, paddingBottom: 48 },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontFamily: serif,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  lede: { fontSize: 15, lineHeight: 22, marginBottom: spacing.md },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  meterBlock: { marginBottom: spacing.md },
  meterTrack: { height: 8, borderRadius: radii.pill, overflow: 'hidden' },
  meterFill: { height: 8, borderRadius: radii.pill },
  meterLabel: { marginTop: 8, fontSize: 13, fontWeight: '600' },
  actionGap: { marginTop: spacing.sm },
  trailRow: { flexDirection: 'row', gap: spacing.sm },
  rail: { width: 28, alignItems: 'center' },
  railDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railIndex: { fontSize: 12, fontWeight: '700' },
  railLine: { width: 2, flex: 1, marginVertical: 4 },
  stageCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  stageTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  stageTitle: { fontFamily: serif, fontSize: 18, fontWeight: '700', flex: 1 },
  stageCount: { fontSize: 13, fontWeight: '700', marginTop: 4 },
  stageSummary: { marginTop: 6, fontSize: 14, lineHeight: 20 },
  badge: { borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, minHeight: 44 },
  backLabel: { fontSize: 15, fontWeight: '700' },
  stageHeading: { fontFamily: serif, fontSize: 26, fontWeight: '700' },
  progressLabel: { marginTop: 4, marginBottom: spacing.md, fontSize: 13, fontWeight: '600' },
  promptCard: { borderWidth: 1, borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.md },
  promptTitle: { fontFamily: serif, fontSize: 22, fontWeight: '700', marginBottom: 8 },
  prompt: { fontSize: 16, lineHeight: 24 },
  choiceList: { gap: spacing.sm },
  choice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderWidth: 2,
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 48,
  },
  choiceMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceLetter: { fontSize: 13, fontWeight: '700' },
  choiceLabel: { flex: 1, fontSize: 15, lineHeight: 21 },
  hint: { marginTop: spacing.md, fontSize: 14, lineHeight: 20 },
  teachBack: {
    marginTop: spacing.md,
    borderWidth: 2,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  teachKicker: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 },
  teachTitle: { fontFamily: serif, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  teachBody: { fontSize: 15, lineHeight: 22 },
  badgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  badgeCopy: { flex: 1 },
  resultList: { gap: spacing.sm, marginBottom: spacing.md },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  resultCopy: { flex: 1 },
  resultTitle: { fontSize: 16, fontWeight: '700' },
  upNext: { marginTop: spacing.sm, fontSize: 14, fontWeight: '600' },
  confirmCard: { borderWidth: 1, borderRadius: radii.lg, padding: spacing.md },
  disclaimer: { marginTop: spacing.lg, fontSize: 12, lineHeight: 18 },
});
