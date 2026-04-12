import { View, Text } from 'react-native';
import type { ReactElement } from 'react';
import { useThemePreference } from '@/providers/ThemePreferenceProvider';

export default function NotFoundScreen(): ReactElement {
  const { palette } = useThemePreference();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.shellBackground }}>
      <Text style={{ color: palette.text, fontSize: 24, marginBottom: 10 }}>404 - Page Not Found</Text>
      <Text style={{ color: palette.shellMutedText, fontSize: 16, textAlign: 'center' }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </Text>
    </View>
  );
}
