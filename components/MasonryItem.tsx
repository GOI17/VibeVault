import { View, Text, StyleSheet } from "react-native";
import { Image, type ImageProps } from "expo-image";
import DoublePress from "./DoublePressTouchable";
import { IconSymbol } from "@/components/ui/IconSymbol";
import type { MasonryItemData } from "./Masonry";
import type { ReactElement } from "react";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

interface MasonryItemProps {
  item: MasonryItemData;
  isFavorite: boolean;
  view: "grid" | "list";
  onAddFavorite: () => void;
  onRemoveFavorite: () => void;
  onOpenDetails?: () => void;
  fallbackImage: ImageProps["placeholder"];
  index: number;
}

interface MediaTypeBadgeProps {
  mediaType?: "movie" | "series";
  backgroundColor: string;
  textColor: string;
}

/**
 * Media type badge component
 */
const MediaTypeBadge = ({ mediaType, backgroundColor, textColor }: MediaTypeBadgeProps): ReactElement | null => {
  if (!mediaType) return null;

  return (
    <View style={[styles.mediaBadge, { backgroundColor }]}> 
      <Text style={[styles.mediaBadgeText, { color: textColor }]}>
        {mediaType === "movie" ? "MOVIE" : "SERIES"}
      </Text>
    </View>
  );
};

export function MasonryItem({
  item,
  isFavorite,
  view,
  onAddFavorite,
  onRemoveFavorite,
  onOpenDetails,
  fallbackImage,
  index,
}: MasonryItemProps): ReactElement {
  const { theme, palette } = useThemePreference();
  const imageAspectRatio = [1.35, 1.0, 1.15, 0.85, 1.25][index % 5];
  const actionChipBackground = theme === "dark" ? "rgba(10, 12, 18, 0.78)" : "rgba(255,255,255,0.78)";
  const mediaBadgeBackground = theme === "dark" ? "rgba(10, 12, 18, 0.82)" : "rgba(255,255,255,0.82)";

  const overlayActions = (
      <View style={styles.actionRow}>
      <View style={[styles.actionChip, { backgroundColor: actionChipBackground }]}>
        <IconSymbol
          name={isFavorite ? "heart.fill" : "heart"}
          color={isFavorite ? palette.tint : palette.text}
          size={14}
        />
      </View>
      <View style={[styles.actionChip, { backgroundColor: actionChipBackground }]}>
        <IconSymbol name="square.and.arrow.up" color={palette.text} size={14} />
      </View>
    </View>
  );

  // List view with favorite overlay
  if (isFavorite && view === "list") {
    return (
      <DoublePress onDoublePress={onRemoveFavorite} onSinglePress={onOpenDetails} action="remove">
        <View style={[styles.listCard, { backgroundColor: palette.shellSurface }]}> 
          {overlayActions}
          <Image
            placeholder={fallbackImage}
            source={{ uri: item.imageSrc }}
            style={styles.listImage}
          />
          <View style={styles.listTextBlock}>
            <Text
              role="heading"
              style={[styles.titleText, { color: palette.text }]}
            >
              {item.title}
            </Text>
            {item.mediaType && (
              <Text style={[styles.subtitleText, { color: palette.shellMutedText }]}>
                {item.mediaType === "movie" ? "Movie" : "Series"}
              </Text>
            )}
          </View>
          <View
            style={[styles.favoriteOverlay, { backgroundColor: palette.shellOverlay }]}
          >
            <Text style={{ color: palette.shellFabForeground }}>Marked as favorite</Text>
          </View>
        </View>
      </DoublePress>
    );
  }

  // List view regular
  if (view === "list") {
    return (
      <DoublePress onDoublePress={onAddFavorite} onSinglePress={onOpenDetails} action="add">
        <View style={[styles.listCard, { backgroundColor: palette.shellSurface }]}>
          {overlayActions}
          <Image
            placeholder={fallbackImage}
            source={{ uri: item.imageSrc }}
            style={styles.listImage}
          />
          <View style={styles.listTextBlock}>
            <Text
              role="heading"
              style={[styles.titleText, { color: palette.text }]}
            >
              {item.title}
            </Text>
            {item.mediaType && (
              <Text style={[styles.subtitleText, { color: palette.shellMutedText }]}>
                {item.mediaType === "movie" ? "Movie" : "Series"}
              </Text>
            )}
          </View>
        </View>
      </DoublePress>
    );
  }

  // Grid view with favorite overlay
  if (isFavorite && view === "grid") {
    return (
      <DoublePress onDoublePress={onRemoveFavorite} onSinglePress={onOpenDetails} action="remove">
        <View style={[styles.gridCard, { backgroundColor: palette.shellSurface }]}> 
          <View style={styles.mediaWrap}>
            <Image
              placeholder={fallbackImage}
              source={{ uri: item.imageSrc }}
              style={[styles.gridImage, { aspectRatio: imageAspectRatio }]}
            />
            <MediaTypeBadge mediaType={item.mediaType} backgroundColor={mediaBadgeBackground} textColor={palette.text} />
            {overlayActions}
            <View style={[styles.favoriteOverlay, { backgroundColor: palette.shellOverlay }]}> 
              <Text style={{ color: palette.shellFabForeground }}>Marked as favorite</Text>
            </View>
          </View>
          <View style={styles.gridTextBlock}>
            <Text
              role="heading"
              style={[styles.titleText, { color: palette.text }]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            {item.mediaType && (
              <Text style={[styles.subtitleText, { color: palette.shellMutedText }]}>
                {item.mediaType === "movie" ? "Movie" : "Series"}
              </Text>
            )}
          </View>
        </View>
      </DoublePress>
    );
  }

  // Grid view regular
  return (
    <DoublePress onDoublePress={onAddFavorite} onSinglePress={onOpenDetails} action="add">
      <View style={[styles.gridCard, { backgroundColor: palette.shellSurface }]}> 
        <View style={styles.mediaWrap}>
          <Image
            placeholder={fallbackImage}
            source={{ uri: item.imageSrc }}
            style={[styles.gridImage, { aspectRatio: imageAspectRatio }]}
          />
          <MediaTypeBadge mediaType={item.mediaType} backgroundColor={mediaBadgeBackground} textColor={palette.text} />
            {overlayActions}
          </View>
        <View style={styles.gridTextBlock}>
          <Text
            role="heading"
            style={[styles.titleText, { color: palette.text }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
            {item.mediaType && (
              <Text style={[styles.subtitleText, { color: palette.shellMutedText }]}>
                {item.mediaType === "movie" ? "Movie" : "Series"}
              </Text>
            )}
          </View>
        </View>
    </DoublePress>
  );
}

const styles = StyleSheet.create({
  mediaBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    zIndex: 10,
  },
  mediaBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  actionRow: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 6,
    zIndex: 10,
  },
  actionChip: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaWrap: {
    position: "relative",
    borderRadius: 22,
    overflow: "hidden",
  },
  gridCard: {
    width: "100%",
    marginBottom: 18,
    padding: 6,
    borderRadius: 24,
  },
  gridImage: {
    width: "100%",
    borderRadius: 22,
  },
  gridTextBlock: {
    gap: 3,
    paddingTop: 10,
    paddingHorizontal: 4,
  },
  listCard: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    marginBottom: 18,
    padding: 8,
    alignItems: "center",
    borderRadius: 22,
    gap: 10,
    overflow: "hidden",
  },
  listImage: {
    aspectRatio: 1,
    height: 84,
    width: 84,
    borderRadius: 14,
  },
  listTextBlock: {
    flex: 1,
    gap: 4,
  },
  titleText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "700",
    textAlign: "left",
  },
  subtitleText: {
    fontSize: 12.5,
    lineHeight: 15,
    fontWeight: "500",
  },
  favoriteOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
});
