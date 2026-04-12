import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Formik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import type { ReactElement } from "react";

import { ManualSeriesSeasonsSchema } from "@/domain/entities/ManualFavorite";
import { useThemePreference } from "@/providers/ThemePreferenceProvider";

const RequiredText = (label: string) => z.string().trim().min(1, `${label} is required`);
const RequiredCsvText = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine(
      (value) =>
        value
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean).length > 0,
      `${label} must include at least one item`
    );

/**
 * Zod schema for form validation
 * Validates favorite input data
 */
export const AddFavoriteFormSchema = z
  .object({
    title: RequiredText("Title"),
    mediaType: z.enum(["movie", "series"]),
    url: z
      .string()
      .refine(
        (val) => {
          if (!val) return true; // Optional field per product decision
          try {
            new URL(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Invalid URL format" }
      )
      .optional(),
    platform: z
      .enum(["Spotify", "Deezer", "Tidal", "Netflix", "Hulu", "Disney+"])
      .optional(), // Optional per product decision
    description: RequiredText("Description"),
    cast: RequiredCsvText("Cast"),
    releaseDate: RequiredText("Release date"),
    whereToWatch: RequiredCsvText("Where to watch"),
    seasonsPayload: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.mediaType !== "series") {
      return;
    }

    if (!value.seasonsPayload || value.seasonsPayload.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["seasonsPayload"],
        message: "Seasons and episodes JSON is required for series",
      });
      return;
    }

    try {
      const parsed: unknown = JSON.parse(value.seasonsPayload);
      const result = ManualSeriesSeasonsSchema.safeParse(parsed);

      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["seasonsPayload"],
          message: "Invalid seasons JSON format",
        });
      }
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["seasonsPayload"],
        message: "Invalid JSON syntax for seasons",
      });
    }
  });

/**
 * Type for form values
 */
export type AddFavoriteFormValues = z.infer<typeof AddFavoriteFormSchema>;

interface AddFavoriteFormProps {
  onSubmit: (values: AddFavoriteFormValues) => void;
}

/**
 * Form component for adding favorites
 * Uses Zod validation via Formik adapter
 */
export function AddFavoriteForm({ onSubmit }: AddFavoriteFormProps): ReactElement {
  const { palette } = useThemePreference();

  return (
    <Formik<AddFavoriteFormValues>
      initialValues={{
        title: "",
        mediaType: "movie",
        url: "",
        platform: undefined,
        description: "",
        cast: "",
        releaseDate: "",
        whereToWatch: "",
        seasonsPayload: "",
      }}
      validateOnBlur={false}
      validateOnChange={false}
      validationSchema={toFormikValidationSchema(AddFavoriteFormSchema)}
      onSubmit={(values, { setSubmitting, resetForm }) => {
        setSubmitting(false);
        onSubmit(values);
        resetForm();
      }}
    >
      {({
        handleChange,
        handleSubmit,
        values,
        isSubmitting,
        setFieldValue,
        errors,
      }) => (
        <View>
          <TextInput
            style={{
              height: 40,
              borderColor: palette.tint,
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: 10,
              color: palette.text,
              backgroundColor: palette.shellSurfaceAlt,
              marginBottom: 5,
            }}
            placeholder="Title"
            placeholderTextColor={palette.shellMutedText}
            value={values.title}
            onChangeText={handleChange("title")}
          />
          {errors.title && (
            <Text
              style={{
                color: palette.tint,
                fontSize: 12,
                marginBottom: 10,
              }}
            >
              {errors.title}
            </Text>
          )}
          <Picker
            selectedValue={values.mediaType}
            onValueChange={(itemValue) =>
              setFieldValue("mediaType", itemValue)
            }
            style={{
              height: 40,
              borderColor: palette.tint,
              borderWidth: 1,
              borderRadius: 5,
              backgroundColor: palette.shellSurfaceAlt,
              color: palette.text,
              marginBottom: 5,
            }}
          >
            <Picker.Item label="Movie" value="movie" />
            <Picker.Item label="Series" value="series" />
          </Picker>
          {errors.mediaType && (
            <Text
              style={{
                color: palette.tint,
                fontSize: 12,
                marginBottom: 10,
              }}
            >
              {errors.mediaType}
            </Text>
          )}
          <TextInput
            style={{
              height: 40,
              borderColor: palette.tint,
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: 10,
              color: palette.text,
              backgroundColor: palette.shellSurfaceAlt,
              marginBottom: 5,
            }}
            placeholder="Image URL (optional)"
            placeholderTextColor={palette.shellMutedText}
            value={values.url}
            onChangeText={handleChange("url")}
          />
          {errors.url && (
            <Text
              style={{
                color: palette.tint,
                fontSize: 12,
                marginBottom: 10,
              }}
            >
              {errors.url}
            </Text>
          )}
          <Picker
            selectedValue={values.platform}
            onValueChange={(itemValue) =>
              setFieldValue("platform", itemValue || undefined)
            }
            style={{
              height: 40,
              borderColor: palette.tint,
              borderWidth: 1,
              borderRadius: 5,
              backgroundColor: palette.shellSurfaceAlt,
              color: palette.text,
              paddingHorizontal: 10,
              marginBottom: 5,
            }}
          >
            <Picker.Item label="Select Platform (optional)" value="" />
            <Picker.Item label="Spotify" value="Spotify" />
            <Picker.Item label="Deezer" value="Deezer" />
            <Picker.Item label="Tidal" value="Tidal" />
            <Picker.Item label="Netflix" value="Netflix" />
            <Picker.Item label="Hulu" value="Hulu" />
            <Picker.Item label="Disney+" value="Disney+" />
          </Picker>
          {errors.platform && (
            <Text
              style={{
                color: palette.tint,
                fontSize: 12,
                marginBottom: 10,
              }}
            >
              {errors.platform}
            </Text>
          )}
          <TextInput
            style={{
              minHeight: 72,
              borderColor: palette.tint,
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: 10,
              paddingVertical: 8,
              color: palette.text,
              backgroundColor: palette.shellSurfaceAlt,
              marginBottom: 5,
              textAlignVertical: "top",
            }}
            multiline
            placeholder="Description / Synopsis"
            placeholderTextColor={palette.shellMutedText}
            value={values.description}
            onChangeText={handleChange("description")}
          />
          {errors.description && (
            <Text style={{ color: palette.tint, fontSize: 12, marginBottom: 10 }}>
              {errors.description}
            </Text>
          )}
          <TextInput
            style={{
              height: 40,
              borderColor: palette.tint,
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: 10,
              color: palette.text,
              backgroundColor: palette.shellSurfaceAlt,
              marginBottom: 5,
            }}
            placeholder="Cast (comma-separated)"
            placeholderTextColor={palette.shellMutedText}
            value={values.cast}
            onChangeText={handleChange("cast")}
          />
          {errors.cast && (
            <Text style={{ color: palette.tint, fontSize: 12, marginBottom: 10 }}>
              {errors.cast}
            </Text>
          )}
          <TextInput
            style={{
              height: 40,
              borderColor: palette.tint,
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: 10,
              color: palette.text,
              backgroundColor: palette.shellSurfaceAlt,
              marginBottom: 5,
            }}
            placeholder="Release date (e.g. 2024-09-10)"
            placeholderTextColor={palette.shellMutedText}
            value={values.releaseDate}
            onChangeText={handleChange("releaseDate")}
          />
          {errors.releaseDate && (
            <Text style={{ color: palette.tint, fontSize: 12, marginBottom: 10 }}>
              {errors.releaseDate}
            </Text>
          )}
          <TextInput
            style={{
              height: 40,
              borderColor: palette.tint,
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: 10,
              color: palette.text,
              backgroundColor: palette.shellSurfaceAlt,
              marginBottom: 5,
            }}
            placeholder="Where to watch (comma-separated)"
            placeholderTextColor={palette.shellMutedText}
            value={values.whereToWatch}
            onChangeText={handleChange("whereToWatch")}
          />
          {errors.whereToWatch && (
            <Text style={{ color: palette.tint, fontSize: 12, marginBottom: 10 }}>
              {errors.whereToWatch}
            </Text>
          )}
          {values.mediaType === "series" && (
            <>
              <TextInput
                style={{
                  minHeight: 96,
                  borderColor: palette.tint,
                  borderWidth: 1,
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  color: palette.text,
                  backgroundColor: palette.shellSurfaceAlt,
                  marginBottom: 5,
                  textAlignVertical: "top",
                }}
                multiline
                placeholder='Seasons JSON (e.g. [{"seasonNumber":1,"episodes":[{"episodeNumber":1,"title":"Pilot","releaseDate":"2024-01-01"}]}])'
                placeholderTextColor={palette.shellMutedText}
                value={values.seasonsPayload}
                onChangeText={handleChange("seasonsPayload")}
              />
              {errors.seasonsPayload && (
                <Text style={{ color: palette.tint, fontSize: 12, marginBottom: 10 }}>
                  {errors.seasonsPayload}
                </Text>
              )}
            </>
          )}
          <TouchableOpacity
            onPress={() => handleSubmit()}
            disabled={isSubmitting || !values.title}
            style={{
              backgroundColor: palette.shellChipActive,
              padding: 10,
              borderRadius: 5,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: palette.shellChipTextActive, fontWeight: "bold" }}>
              Add to Favorites
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Formik>
  );
}
