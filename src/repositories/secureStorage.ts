import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const IS_WEB = Platform.OS === "web";

/**
 * Cross-platform secure-ish token storage.
 *
 * Uses expo-secure-store on iOS/Android. Falls back to AsyncStorage on web
 * because SecureStore is not implemented there.
 */
export async function setSecureItem(key: string, value: string): Promise<void> {
  if (IS_WEB) {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function getSecureItem(key: string): Promise<string | null> {
  if (IS_WEB) {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

export async function deleteSecureItem(key: string): Promise<void> {
  if (IS_WEB) {
    await AsyncStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
