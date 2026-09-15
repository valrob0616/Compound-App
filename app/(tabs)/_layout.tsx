import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAppTheme } from '@/context/ThemeContext';
import { APP_NAME } from '@/theme';

export default function TabLayout() {
  const { colors } = useAppTheme();
  const headerShown = useClientOnlyValue(false, true);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
        headerShown,
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: colors.headerText,
        headerTitleStyle: { fontWeight: '700' },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          headerTitle: APP_NAME,
          tabBarAccessibilityLabel: 'News and videos feed',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={Platform.OS === 'ios' ? 'newspaper' : 'newspaper-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: 'Store',
          headerTitle: 'Store',
          tabBarAccessibilityLabel: 'Amazon affiliate store',
          tabBarIcon: ({ color, size }) => <Ionicons name="bag-handle-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          headerTitle: 'Account',
          tabBarAccessibilityLabel: 'Account and profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
