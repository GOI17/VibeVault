import FontAwesome from "@expo/vector-icons/FontAwesome";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { ReactElement } from "react";
import { Colors } from "@/constants/Colors";
import type { TabParamList } from "@/app/navigation/types";

import HomeScreen from "./home";
import FavoritesScreen from "./favorites";

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator(): ReactElement {
  const palette = Colors.light;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: palette.tint,
        tabBarInactiveTintColor: palette.shellMutedText,
        tabBarStyle: {
          backgroundColor: palette.shellSurface,
          borderTopColor: palette.shellBorder,
          borderTopWidth: 1,
          height: 72,
          paddingTop: 10,
          paddingBottom: 12,
          shadowColor: "#000000",
          shadowOpacity: 0.06,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          elevation: 10,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.2,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="home" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: "Favorites",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="heart" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
