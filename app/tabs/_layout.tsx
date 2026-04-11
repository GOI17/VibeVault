import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import type { ReactElement } from "react";
import { Modal, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

import { Colors } from "@/constants/Colors";
import type { TabParamList } from "@/app/navigation/types";
import { AddFavoriteForm, type AddFavoriteFormValues } from "@/components/forms/AddFavoriteForm";
import { parseManualSeriesSeasonsPayload } from "@/domain/entities/ManualFavorite";
import { useFavoriteMutations } from "@/hooks/useFavoriteMutations";

import HomeScreen from "./home";
import FavoritesScreen from "./favorites";

const Stack = createStackNavigator<TabParamList>();

export default function TabNavigator(): ReactElement {
  const palette = Colors.light;
  const { addFavorite } = useFavoriteMutations();
  const [showFormModal, setShowFormModal] = React.useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 720;

  const handleAddFavorite = React.useCallback((values: AddFavoriteFormValues) => {
    const cast = values.cast
      .split(",")
      .map((member) => member.trim())
      .filter(Boolean);

    const whereToWatch = values.whereToWatch
      .split(",")
      .map((platform) => platform.trim())
      .filter(Boolean);

    const seasons =
      values.mediaType === "series" && values.seasonsPayload
        ? parseManualSeriesSeasonsPayload(values.seasonsPayload)
        : undefined;

    addFavorite({
      id: `custom-${Date.now()}`,
      title: values.title,
      mediaType: values.mediaType,
      url: values.url,
      platform: values.platform,
      description: values.description,
      cast,
      releaseDate: values.releaseDate,
      whereToWatch,
      seasons,
      source: "manual",
    });
    setShowFormModal(false);
  }, [addFavorite]);

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

      <TouchableOpacity
        onPress={() => setShowFormModal(true)}
        style={{
          position: "absolute",
          bottom: 88,
          right: 20,
          backgroundColor: palette.shellFabBackground,
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: "center",
          alignItems: "center",
          elevation: 5,
        }}
        accessibilityRole="button"
        accessibilityLabel="Add favorite"
      >
        <Text style={{ color: palette.shellFabForeground, fontSize: 24 }}>+</Text>
      </TouchableOpacity>

      <Modal visible={showFormModal} transparent animationType="fade" onRequestClose={() => setShowFormModal(false)}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(23,16,28,0.32)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              width: isDesktop ? 560 : "100%",
              maxWidth: 560,
              backgroundColor: palette.shellSurface,
              padding: 20,
              borderRadius: 24,
              borderColor: palette.shellBorder,
              borderWidth: 1,
              shadowColor: "#000000",
              shadowOpacity: 0.1,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 12 },
              elevation: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowFormModal(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: palette.shellSurfaceAlt,
                padding: 5,
                borderRadius: 5,
                zIndex: 1,
              }}
              accessibilityRole="button"
              accessibilityLabel="Close add favorite modal"
            >
              <Text style={{ color: palette.text, fontSize: 16 }}>×</Text>
            </TouchableOpacity>

            <Text style={{ color: palette.text, fontSize: 18, marginBottom: 10 }}>Add Custom Movie</Text>
            <AddFavoriteForm onSubmit={handleAddFavorite} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
