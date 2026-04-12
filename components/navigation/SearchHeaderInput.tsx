import { type ReactElement } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/Colors";

interface SearchHeaderInputProps {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
}

const palette = Colors.light;

export function SearchHeaderInput({ value, onChangeText, onSubmit }: SearchHeaderInputProps): ReactElement {
  return (
    <View
      style={{
        minHeight: 40,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: palette.shellBorder,
        backgroundColor: palette.shellSurface,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        gap: 8,
        width: "100%",
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={{ flex: 1, color: palette.text, fontSize: 15 }}
        placeholder="Search titles"
        placeholderTextColor={palette.shellMutedText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
      />
      <TouchableOpacity onPress={onSubmit} accessibilityRole="button" accessibilityLabel="Submit search">
        <Text style={{ color: palette.shellMutedText, fontWeight: "600" }}>Search</Text>
      </TouchableOpacity>
    </View>
  );
}
