import { Pressable, Share, View, Text, StyleSheet } from "react-native";
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

interface StatusPillProps {
  status: NonNullable<MasonryItemData["watchStatus"]>;
  tintColor: string;
  successColor: string;
  watchingColor: string;
  mutedTextColor: string;
  surfaceColor: string;
  borderColor: string;
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

function getStatusLabel(status: NonNullable<MasonryItemData["watchStatus"]>): string {
  switch (status) {
    case "favorite":
      return "Favorite";
    case "watched":
      return "Watched";
    case "watching":
      return "Watching";
    case "not-started":
      return "Not Started";
  }
}

function getStatusIcon(status: NonNullable<MasonryItemData["watchStatus"]>): "heart.fill" | "checkmark" | "arrow.up.right" | "circle" {
  switch (status) {
    case "favorite":
      return "heart.fill";
    case "watched":
      return "checkmark";
    case "watching":
      return "arrow.up.right";
    case "not-started":
      return "circle";
  }
}

function getStatusColor({
  status,
  tintColor,
  successColor,
  watchingColor,
  mutedTextColor,
}: Pick<StatusPillProps, "status" | "tintColor" | "successColor" | "watchingColor" | "mutedTextColor">): string {
  switch (status) {
    case "favorite":
      return tintColor;
    case "watched":
      return successColor;
    case "watching":
      return watchingColor;
    case "not-started":
      return mutedTextColor;
  }
}

function StatusPill({
  status,
  tintColor,
  successColor,
  watchingColor,
  mutedTextColor,
  surfaceColor,
  borderColor,
}: StatusPillProps): ReactElement {
  const statusColor = getStatusColor({ status, tintColor, successColor, watchingColor, mutedTextColor });

  return (
    <View
      style={[
        styles.statusPill,
        {
          backgroundColor: status === "not-started" ? surfaceColor : `${statusColor}22`,
          borderColor: status === "not-started" ? borderColor : `${statusColor}55`,
        },
      ]}
    >
      <IconSymbol name={getStatusIcon(status)} color={statusColor} size={14} />
      <Text style={[styles.statusPillText, { color: statusColor }]}>{getStatusLabel(status)}</Text>
    </View>
  );
}

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

  const handleFavoritePress = (): void => {
    if (isFavorite) {
      onRemoveFavorite();
      return;
    }

    onAddFavorite();
  };

  const handleSharePress = (): void => {
    void Share.share({
      title: item.title,
      message: item.title,
    });
  };

  const overlayActions = (
      <View style={styles.actionRow}>
      <Pressable
        onPress={handleFavoritePress}
        accessibilityRole="button"
        accessibilityLabel={isFavorite ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
        hitSlop={8}
        style={[styles.actionChip, { backgroundColor: actionChipBackground }]}
      >
        <IconSymbol
          name={isFavorite ? "heart.fill" : "heart"}
          color={isFavorite ? palette.tint : palette.text}
          size={14}
        />
      </Pressable>
      <Pressable
        onPress={handleSharePress}
        accessibilityRole="button"
        accessibilityLabel={`Share ${item.title}`}
        hitSlop={8}
        style={[styles.actionChip, { backgroundColor: actionChipBackground }]}
      >
        <IconSymbol name="square.and.arrow.up" color={palette.text} size={14} />
      </Pressable>
    </View>
  );

  const listActions = (
    <View style={styles.listActionRow}>
      <Pressable
        onPress={handleFavoritePress}
        accessibilityRole="button"
        accessibilityLabel={isFavorite ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
        hitSlop={8}
        style={styles.listActionButton}
      >
        <IconSymbol
          name={isFavorite ? "heart.fill" : "heart"}
          color={isFavorite ? palette.tint : palette.text}
          size={22}
        />
      </Pressable>
      <Pressable
        onPress={handleSharePress}
        accessibilityRole="button"
        accessibilityLabel={`Share ${item.title}`}
        hitSlop={8}
        style={styles.listActionButton}
      >
        <IconSymbol name="square.and.arrow.up" color={palette.text} size={21} />
      </Pressable>
    </View>
  );

  const listCard = (
    <View style={[styles.listCard, { backgroundColor: palette.shellSurface }]}> 
      <Image
        placeholder={fallbackImage}
        source={{ uri: item.imageSrc }}
        style={styles.listImage}
      />
      <View style={styles.listTextBlock}>
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
        {item.watchStatus ? (
          <StatusPill
            status={item.watchStatus}
            tintColor={palette.tint}
            successColor="#7CFF4E"
            watchingColor="#3B82F6"
            mutedTextColor={palette.shellMutedText}
            surfaceColor={palette.shellBackground}
            borderColor={palette.shellBorder}
          />
        ) : null}
        {typeof item.progressPercent === "number" ? (
          <View style={styles.progressBlock}>
            <View style={[styles.progressTrack, { backgroundColor: palette.shellBorder }]}> 
              <View style={[styles.progressFill, { width: `${item.progressPercent}%`, backgroundColor: "#3B82F6" }]} />
            </View>
            {item.progressLabel ? (
              <Text style={[styles.progressText, { color: palette.shellMutedText }]}>{item.progressLabel}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
      {listActions}
    </View>
  );

  // List view with favorite overlay
  if (isFavorite && view === "list") {
    return (
      <DoublePress onDoublePress={onRemoveFavorite} onSinglePress={onOpenDetails} action="remove">
        {listCard}
      </DoublePress>
    );
  }

  // List view regular
  if (view === "list") {
    return (
      <DoublePress onDoublePress={onAddFavorite} onSinglePress={onOpenDetails} action="add">
        {listCard}
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
    marginBottom: 10,
    padding: 10,
    alignItems: "flex-start",
    borderRadius: 18,
    gap: 12,
    overflow: "hidden",
  },
  listImage: {
    height: 96,
    width: 76,
    borderRadius: 12,
  },
  listTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 5,
    paddingRight: 8,
    paddingTop: 4,
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
  listActionRow: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 4,
  },
  listActionButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 3,
  },
  statusPillText: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "600",
  },
  progressBlock: {
    width: "100%",
    gap: 4,
    paddingTop: 2,
  },
  progressTrack: {
    height: 5,
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  progressText: {
    fontSize: 11,
    lineHeight: 13,
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
