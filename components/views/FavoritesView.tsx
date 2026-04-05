import type { ReactElement } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";

import MasonryList from "@/components/Masonry";
import { AddFavoriteForm, type AddFavoriteFormValues } from "@/components/forms/AddFavoriteForm";
import { BackupControls } from "@/components/BackupControls";
import { LoadingState, ErrorState } from "@/components/FeedbackStates";
import { Colors } from "@/constants/Colors";
import type { MediaType } from "@/constants/query";

type FilterOption = MediaType | undefined;

const FILTER_OPTIONS: { label: string; value: FilterOption }[] = [
  { label: "All", value: undefined },
  { label: "Movies", value: "movie" },
  { label: "Series", value: "series" },
];

interface FavoritesViewProps {
  filter: FilterOption;
  onFilterChange: (value: FilterOption) => void;
  isLoading: boolean;
  errorMessage?: string;
  masonryData: { key: string; imageSrc?: string; title: string; mediaType?: "movie" | "series" }[];
  favoriteIds: ReadonlySet<string>;
  onAddFavorite: (item: { key: string; imageSrc?: string; title: string; mediaType?: "movie" | "series" }) => void;
  onRemoveFavorite: (item: { key: string; imageSrc?: string; title: string; mediaType?: "movie" | "series" }) => void;
  onSubmitFavorite: (values: AddFavoriteFormValues) => void;
  onBackup: () => void;
  onRestore: () => void;
  isBackingUp: boolean;
  isRestoring: boolean;
  showFormModal: boolean;
  setShowFormModal: (value: boolean) => void;
  isDesktop: boolean;
}

export function FavoritesView({
  filter,
  onFilterChange,
  isLoading,
  errorMessage,
  masonryData,
  favoriteIds,
  onAddFavorite,
  onRemoveFavorite,
  onSubmitFavorite,
  onBackup,
  onRestore,
  isBackingUp,
  isRestoring,
  showFormModal,
  setShowFormModal,
  isDesktop,
}: FavoritesViewProps): ReactElement {
  const palette = Colors.light;

  if (isLoading) return <LoadingState message="Loading favorites..." />;
  if (errorMessage) return <ErrorState message="Error loading favorites" error={new Error(errorMessage)} />;

  const formContent = (
    <View>
      <Text style={{ color: palette.text, fontSize: 18, marginBottom: 10 }}>Add Custom Movie</Text>
      <AddFavoriteForm onSubmit={onSubmitFavorite} />
      <BackupControls
        onBackup={onBackup}
        onRestore={onRestore}
        isBackingUp={isBackingUp}
        isRestoring={isRestoring}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.shellBackground }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, gap: 10 }}>
        <Text
          style={{
            color: palette.shellMutedText,
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          Curator
        </Text>
        <Text style={{ color: palette.text, fontSize: 30, lineHeight: 34, fontWeight: "800", letterSpacing: -0.6 }}>
          My Favorites
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {FILTER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.label}
              onPress={() => onFilterChange(option.value)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: filter === option.value ? palette.shellChipActive : palette.shellSurface,
                borderWidth: 1,
                borderColor: filter === option.value ? palette.shellChipActive : palette.shellBorder,
              }}
            >
              <Text
                style={{
                  color: filter === option.value ? palette.shellChipTextActive : palette.shellChipTextIdle,
                  fontWeight: filter === option.value ? "bold" : "normal",
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <MasonryList
          data={masonryData}
          isFavorites
          isFavoritesLoading={isLoading}
          showLayoutToggle={false}
          topInset={0}
          favoriteIds={favoriteIds}
          onAddFavorite={onAddFavorite}
          onRemoveFavorite={onRemoveFavorite}
        />
      </View>

      <TouchableOpacity
        onPress={() => setShowFormModal(true)}
        style={{
          position: "absolute",
          bottom: 28,
          right: 20,
          backgroundColor: palette.shellFabBackground,
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: "center",
          alignItems: "center",
          elevation: 5,
        }}
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
              }}
            >
              <Text style={{ color: palette.text, fontSize: 16 }}>×</Text>
            </TouchableOpacity>
            {formContent}
          </View>
        </View>
      </Modal>
    </View>
  );
}
