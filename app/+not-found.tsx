import { View, Text } from 'react-native';
import type { ReactElement } from 'react';

export default function NotFoundScreen(): ReactElement {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
      <Text style={{ color: '#FFFFFF', fontSize: 24, marginBottom: 10 }}>404 - Page Not Found</Text>
      <Text style={{ color: '#CCCCCC', fontSize: 16, textAlign: 'center' }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </Text>
    </View>
  );
}
