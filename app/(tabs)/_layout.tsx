import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#E50914",
          tabBarStyle: { backgroundColor: '#000000' },
          headerShown: false
        }}
      >
        <Tabs.Screen
          name="(home)/index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="home" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites/index"
          options={{
            title: "Favorites",
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name="heart" color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
