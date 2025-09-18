import { MasonryFlashList } from "@shopify/flash-list";
import { View, Text, Button } from "react-native";
import { Image } from "expo-image";
import { useMutation, useQuery } from "@tanstack/react-query";

import { queryOptions } from "@/constants/query";
import DoublePress from "./DoublePressTouchable";
import { client } from "@/constants/RQClient";
import { useState } from "react";
import { useEffect } from "react";
import { TouchableOpacity, useWindowDimensions } from "react-native";

const DOUBLE_PRESS_DELAY = 300; // time in ms to consider a double press

export default function MasonryList({
  data,
}: {
  data: { key: any; title: string; imageSrc?: string }[];
}) {
  const [view, setView] = useState("grid");
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());
  const [showMessage, setShowMessage] = useState(false);
  const { width } = useWindowDimensions();
  const { mutate: markAsFavorite } = useMutation({
    ...queryOptions.movies.markAsFavorite,
    onSuccess: (data, variables) => {
      setRecentlyAdded(prev => new Set(prev).add(variables.id));
      client.invalidateQueries({
        queryKey: queryOptions.movies.favorites.queryKey,
      });
    },
  });
  const { mutate: removeFromFavorites } = useMutation({
    ...queryOptions.movies.removeFromFavorites,
    onSuccess: (data, variables) => {
      setRecentlyAdded(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables);
        return newSet;
      });
      client.invalidateQueries({
        queryKey: queryOptions.movies.favorites.queryKey,
      });
    },
  });
  const { data: favorites, isLoading } = useQuery(
    queryOptions.movies.favorites,
  );
  const fallbackImage = require("../assets/images/logo.png");

  // Clear recently added when favorites data is loaded
  useEffect(() => {
    if (favorites) {
      setRecentlyAdded(new Set());
    }
  }, [favorites]);

  const numColumns = view === "grid" ? (width > 1280 ? 5 : 3) : 1;

  const handleFirstPress = () => {
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), DOUBLE_PRESS_DELAY);
  };

  const dismissMessage = () => {
    setShowMessage(false);
  };

  if (!data.length && !isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#000000', padding: 20 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 18, textAlign: 'center', marginBottom: 10 }}>
          No favorites yet! 🎬
        </Text>
        <Text style={{ color: '#CCCCCC', fontSize: 14, textAlign: 'center' }}>
          Double-tap movies on the home screen to add them here, or use the add form to create custom entries.
        </Text>
      </View>
    );
  }

  return (
    <>
      {width < 768 && (
        <Button
          title={`Switch to ${view === "grid" ? "list" : "grid"}`}
          onPress={() => setView((prev) => (prev === "grid" ? "list" : "grid"))}
          color="#E50914"
        />
      )}
      <MasonryFlashList
        numColumns={numColumns}
        keyExtractor={(item) => item.key}
        data={data}
        renderItem={({ item }) => {
          const isFavorite = favorites?.find(
            (favorite) => favorite.id === item.key,
          ) || recentlyAdded.has(item.key);

          if (isFavorite && view === "list") {
            return (
              <DoublePress onDoublePress={() => removeFromFavorites(item.key)} action="remove">
                <View
                  style={{
                    display: "flex",
                    width: "100%",
                    flexDirection: "row",
                    backgroundColor: "#000000",
                    margin: 4,
                    padding: 4,
                    alignItems: "center",
                  }}
                >
                  <Image
                    placeholder={fallbackImage}
                    source={{ uri: item.imageSrc }}
                    style={{ aspectRatio: 1, height: 80, width: 80 }}
                  />
                  <Text
                    role="heading"
                    style={{
                      fontSize: 26,
                      textAlign: "center",
                      marginBottom: 4,
                      color: '#FFFFFF',
                    }}
                  >
                    {item.title}
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#333333",
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      right: 0,
                      left: 0,
                      opacity: 0.75,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: '#FFFFFF' }}>Marked as favorite</Text>
                  </View>
                </View>
              </DoublePress>
            );
          }

          if (view === "list") {
            return (
              <DoublePress
                onDoublePress={() =>
                  markAsFavorite({
                    id: item.key,
                    primaryTitle: item.title,
                    url: item.imageSrc || "",
                  })
                }
                action="add"
              >
                <View
                  style={{
                    display: "flex",
                    width: "100%",
                    flexDirection: "row",
                    backgroundColor: "#000000",
                    margin: 4,
                    padding: 4,
                    alignItems: "center",
                  }}
                >
                  <Image
                    placeholder={fallbackImage}
                    source={{ uri: item.imageSrc }}
                    style={{ aspectRatio: 1, height: 80, width: 80 }}
                  />
                  <Text
                    role="heading"
                    style={{
                      fontSize: 26,
                      textAlign: "center",
                      marginBottom: 4,
                      color: '#FFFFFF',
                    }}
                  >
                    {item.title}
                  </Text>
                </View>
              </DoublePress>
            );
          }

          if (isFavorite && view === "grid") {
            return (
              <DoublePress onDoublePress={() => removeFromFavorites(item.key)} action="remove">
                <View
                  style={{
                    width: "100%",
                    backgroundColor: "#000000",
                    margin: 4,
                    padding: 4,
                  }}
                >
                  <Text
                    role="heading"
                    style={{
                      fontSize: 26,
                      textAlign: "center",
                      marginBottom: 4,
                      color: '#FFFFFF',
                    }}
                  >
                    {item.title}
                  </Text>
                  <Image
                    placeholder={fallbackImage}
                    source={{ uri: item.imageSrc }}
                    style={{ flex: 1, aspectRatio: 1 }}
                  />
                  <View
                    style={{
                      backgroundColor: "#333333",
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      right: 0,
                      left: 0,
                      opacity: 0.75,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: '#FFFFFF' }}>Marked as favorite</Text>
                  </View>
                </View>
              </DoublePress>
            );
          }

          return (
            <DoublePress
              onDoublePress={() =>
                markAsFavorite({
                  id: item.key,
                  primaryTitle: item.title,
                  url: item.imageSrc || "",
                })
              }
              action="add"
            >
              <View
                style={{
                  width: "100%",
                  backgroundColor: "#000000",
                  margin: 4,
                  padding: 4,
                }}
              >
                <Text
                  role="heading"
                  style={{ fontSize: 26, textAlign: "center", marginBottom: 4, color: '#FFFFFF' }}
                >
                  {item.title}
                </Text>
                <Image
                  placeholder={fallbackImage}
                  source={{ uri: item.imageSrc }}
                  style={{ flex: 1, aspectRatio: 1 }}
                />
              </View>
            </DoublePress>
          );
        }}
      />
      {showMessage && (
        <View
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            backgroundColor: '#E50914',
            padding: 12,
            borderRadius: 8,
            zIndex: 1000,
            maxWidth: 250,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 14, flex: 1, textAlign: 'center' }}>
            Press one more time to add as favorite
          </Text>
          <TouchableOpacity onPress={dismissMessage} style={{ marginLeft: 8 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>×</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}
