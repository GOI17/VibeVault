import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Formik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import type { ReactElement } from "react";

/**
 * Zod schema for form validation
 * Validates favorite input data
 */
export const AddFavoriteFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
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
  return (
    <Formik<AddFavoriteFormValues>
      initialValues={{ title: "", mediaType: "movie", url: "", platform: undefined }}
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
              borderColor: "#E50914",
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: 10,
              color: "#FFFFFF",
              backgroundColor: "#333333",
              marginBottom: 5,
            }}
            placeholder="Title"
            placeholderTextColor="#CCCCCC"
            value={values.title}
            onChangeText={handleChange("title")}
          />
          {errors.title && (
            <Text
              style={{
                color: "#FF0000",
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
              borderColor: "#E50914",
              borderWidth: 1,
              borderRadius: 5,
              backgroundColor: "#333333",
              color: "#FFFFFF",
              marginBottom: 5,
            }}
          >
            <Picker.Item label="Movie" value="movie" />
            <Picker.Item label="Series" value="series" />
          </Picker>
          {errors.mediaType && (
            <Text
              style={{
                color: "#FF0000",
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
              borderColor: "#E50914",
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: 10,
              color: "#FFFFFF",
              backgroundColor: "#333333",
              marginBottom: 5,
            }}
            placeholder="Image URL (optional)"
            placeholderTextColor="#CCCCCC"
            value={values.url}
            onChangeText={handleChange("url")}
          />
          {errors.url && (
            <Text
              style={{
                color: "#FF0000",
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
              borderColor: "#E50914",
              borderWidth: 1,
              borderRadius: 5,
              backgroundColor: "#333333",
              color: "#FFFFFF",
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
                color: "#FF0000",
                fontSize: 12,
                marginBottom: 10,
              }}
            >
              {errors.platform}
            </Text>
          )}
          <TouchableOpacity
            onPress={() => handleSubmit()}
            disabled={isSubmitting || !values.title}
            style={{
              backgroundColor: "#E50914",
              padding: 10,
              borderRadius: 5,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
              Add to Favorites
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Formik>
  );
}
