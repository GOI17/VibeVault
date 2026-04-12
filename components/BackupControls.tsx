import { View, Text, TouchableOpacity } from "react-native";
import type { ReactElement } from "react";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

interface BackupControlsProps {
  onBackup: () => void;
  onRestore: () => void;
  isBackingUp?: boolean;
  isRestoring?: boolean;
}

export function BackupControls({
  onBackup,
  onRestore,
  isBackingUp = false,
  isRestoring = false,
}: BackupControlsProps): ReactElement {
  const { palette } = useThemePreference();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <TouchableOpacity
        onPress={onBackup}
        disabled={isBackingUp}
        style={{
          backgroundColor: palette.shellChipActive,
          padding: 10,
          borderRadius: 5,
          flex: 1,
          marginRight: 5,
          alignItems: "center",
          opacity: isBackingUp ? 0.7 : 1,
        }}
      >
        <Text style={{ color: palette.shellChipTextActive, fontWeight: "bold" }}>
          {isBackingUp ? "Backing up..." : "Backup"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onRestore}
        disabled={isRestoring}
        style={{
          backgroundColor: palette.shellSurface,
          borderWidth: 1,
          borderColor: palette.shellBorder,
          padding: 10,
          borderRadius: 5,
          flex: 1,
          marginLeft: 5,
          alignItems: "center",
          opacity: isRestoring ? 0.7 : 1,
        }}
      >
        <Text style={{ color: palette.text, fontWeight: "bold" }}>
          {isRestoring ? "Restoring..." : "Restore"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
