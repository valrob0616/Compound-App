import { useLocalSearchParams } from 'expo-router';

import { CompoundScout } from '@/components/CompoundScout';

export default function LearnScreen() {
  const params = useLocalSearchParams<{ scenario?: string | string[] }>();
  const scenario = Array.isArray(params.scenario) ? params.scenario[0] : params.scenario;
  return <CompoundScout focusScenarioId={scenario} />;
}
