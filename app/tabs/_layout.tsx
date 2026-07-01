import { createStackNavigator } from "@react-navigation/stack";
import type { ReactElement } from "react";
import { View } from "react-native";

import type { TabParamList } from "@/app/navigation/types";

import HomeScreen from "./home";
import FavoritesScreen from "./favorites";
import AnalyticsScreen from "./analytics";
import RoadmapScreen from "./roadmap";
import RewindScreen from "./rewind";
import PublishScreen from "./publish";
import SocialScreen from "./social";

const Stack = createStackNavigator<TabParamList>();

export default function TabNavigator(): ReactElement {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Home" }}
        />
        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{ title: "Favorites" }}
        />
        <Stack.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{ title: "Analytics" }}
        />
        <Stack.Screen
          name="Roadmap"
          component={RoadmapScreen}
          options={{ title: "Roadmap" }}
        />
        <Stack.Screen
          name="Rewind"
          component={RewindScreen}
          options={{ title: "Rewind" }}
        />
        <Stack.Screen
          name="Publish"
          component={PublishScreen}
          options={{ title: "Publish" }}
        />
        <Stack.Screen
          name="Social"
          component={SocialScreen}
          options={{ title: "Social" }}
        />
      </Stack.Navigator>
    </View>
  );
}
