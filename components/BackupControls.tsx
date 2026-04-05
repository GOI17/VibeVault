import { View, Text, TouchableOpacity } from "react-native";
import type { ReactElement } from "react";

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
          backgroundColor: "#4285F4",
          padding: 10,
          borderRadius: 5,
          flex: 1,
          marginRight: 5,
          alignItems: "center",
          opacity: isBackingUp ? 0.7 : 1,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
          {isBackingUp ? "Backing up..." : "Backup"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onRestore}
        disabled={isRestoring}
        style={{
          backgroundColor: "#34A853",
          padding: 10,
          borderRadius: 5,
          flex: 1,
          marginLeft: 5,
          alignItems: "center",
          opacity: isRestoring ? 0.7 : 1,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
          {isRestoring ? "Restoring..." : "Restore"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
