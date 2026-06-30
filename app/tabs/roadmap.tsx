import type { ReactElement } from "react";
import { ScrollView, Text, View } from "react-native";

import { useThemePreference } from "@/providers/ThemePreferenceProvider";

const PHASES = [
  {
    name: "P0 — Analytics Foundation",
    status: "In progress",
    goal: "Know what is happening before deciding what to build.",
  },
  {
    name: "P1 — Core Tracking",
    status: "Mostly complete",
    goal: "Search, add, mark watched, update progress in < 3 taps.",
  },
  {
    name: "P2 — Shareability",
    status: "Deep links done; share cards + rewind pending",
    goal: "Every user generates shareable content without a backend.",
  },
  {
    name: "P3 — Monetization",
    status: "Gated at 100+ WAU",
    goal: "Premium deep links, notifications, unlimited export.",
  },
  {
    name: "P4 — Publishing Platform",
    status: "Deferred (needs backend)",
    goal: "Public profiles, public lists, published rewinds.",
  },
  {
    name: "P5 — Social Network",
    status: "Deferred indefinitely",
    goal: "Followers, feeds, comments, reactions.",
  },
];

export default function RoadmapScreen(): ReactElement {
  const { palette } = useThemePreference();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.shellBackground }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
    >
      <Text style={{ color: palette.text, fontSize: 24, fontWeight: "800" }}>
        12-Month Roadmap
      </Text>
      <Text style={{ color: palette.shellMutedText, fontSize: 14 }}>
        Focus: retention first, revenue later.
      </Text>

      {PHASES.map((phase) => (
        <View
          key={phase.name}
          style={{
            backgroundColor: palette.shellSurface,
            borderColor: palette.shellBorder,
            borderWidth: 1,
            borderRadius: 10,
            padding: 14,
            gap: 6,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: palette.text, fontSize: 15, fontWeight: "800", flex: 1 }}>
              {phase.name}
            </Text>
            <Text style={{ color: palette.tint, fontSize: 12, fontWeight: "700" }}>{phase.status}</Text>
          </View>
          <Text style={{ color: palette.shellMutedText, fontSize: 13 }}>{phase.goal}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
