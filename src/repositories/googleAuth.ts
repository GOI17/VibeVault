import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { z } from "zod";

WebBrowser.maybeCompleteAuthSession();

const GoogleAuthEnvSchema = z.object({
  EXPO_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),
  EXPO_PUBLIC_ANDROID_CLIENT_ID: z.string().min(1),
  EXPO_PUBLIC_IOS_CLIENT_ID: z.string().min(1),
});

type GoogleAuthEnv = z.infer<typeof GoogleAuthEnvSchema>;

function getGoogleAuthEnv(): GoogleAuthEnv {
  const parsedEnv = GoogleAuthEnvSchema.safeParse({
    EXPO_PUBLIC_GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    EXPO_PUBLIC_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    EXPO_PUBLIC_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
  });

  if (!parsedEnv.success) {
    throw new Error("Invalid Google auth environment configuration");
  }

  return parsedEnv.data;
}

export async function signInWithGoogle(): Promise<AuthSession.AuthSessionResult | null> {
  try {
    const {
      EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      EXPO_PUBLIC_ANDROID_CLIENT_ID,
      EXPO_PUBLIC_IOS_CLIENT_ID,
    } = getGoogleAuthEnv();

    const redirectUri =
      Platform.OS === "web"
        ? "https://auth.expo.io/olivasgilberto/VibeVault"
        : AuthSession.makeRedirectUri();

    const clientId =
      Platform.OS === "web"
        ? EXPO_PUBLIC_GOOGLE_CLIENT_ID
        : Platform.OS === "android"
          ? EXPO_PUBLIC_ANDROID_CLIENT_ID
          : EXPO_PUBLIC_IOS_CLIENT_ID;

    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/drive.file",
      ],
      responseType: AuthSession.ResponseType.Token,
      redirectUri,
      prompt: AuthSession.Prompt.SelectAccount,
    });

    const result = await request.promptAsync({
      authorizationEndpoint: "https://accounts.google.com/oauth/v2/auth",
    });

    if (result.type === "success") {
      await SecureStore.setItemAsync("google_access_token", result.params.access_token);
      await SecureStore.setItemAsync("google_refresh_token", result.params.refresh_token || "");
      return result;
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync("google_access_token");
}

export async function refreshToken(): Promise<string | null> {
  const refreshTokenValue = await SecureStore.getItemAsync("google_refresh_token");
  if (!refreshTokenValue) return null;
  return refreshTokenValue;
}
