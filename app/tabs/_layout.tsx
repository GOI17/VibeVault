import { createStackNavigator } from "@react-navigation/stack";
import type { ReactElement } from "react";
import { View } from "react-native";

import type { TabParamList } from "@/app/navigation/types";

import HomeScreen from "./home";
import FavoritesScreen from "./favorites";

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
      </Stack.Navigator>
    </View>
  );
}
