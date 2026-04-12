import {
  DefaultTheme,
  ThemeProvider,
  NavigationContainer,
} from "@react-navigation/native";
import type { LinkingOptions } from "@react-navigation/native";
import { useMemo, type ReactElement } from "react";

import { createStackNavigator } from "@react-navigation/stack";
import { QueryClientProvider } from "@tanstack/react-query";
import { HeaderBackButton } from "@react-navigation/elements";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import { View, Text } from "react-native";
import Toast from "react-native-toast-message";
import type { ToastConfig } from "react-native-toast-message";
import "react-native-reanimated";

import Header from "@/components/Header";
import { client } from "@/constants/RQClient";
import { SeasonSchema } from "@/domain/entities/Movie";
import { RepositoryProvider } from "@/providers/RepositoryProvider";
import { ThemePreferenceProvider, useThemePreference } from "@/providers/ThemePreferenceProvider";
import NotFoundScreen from "./+not-found";
import TabNavigator from "./tabs/_layout";
import SearchScreen from "./home/search/query";
import DetailsScreen from "./home/details/[id]";
import type { RootStackParamList } from "./navigation/types";

interface ToastInfoProps {
  text1?: string;
  text2?: string;
}

function ThemedToast(): ReactElement {
  const { palette } = useThemePreference();

  const toastConfig = useMemo<ToastConfig>(
    () => ({
      info: ({ text1, text2 }: ToastInfoProps) => (
        <View
          style={{
            backgroundColor: palette.shellSurface,
            borderLeftColor: palette.tint,
            borderLeftWidth: 5,
            borderWidth: 1,
            borderColor: palette.shellBorder,
            padding: 15,
            marginHorizontal: 20,
            borderRadius: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.35,
            shadowRadius: 4,
            elevation: 5,
            alignSelf: "center",
            width: "90%",
            maxWidth: 400,
          }}
        >
          <Text
            style={{
              color: palette.text,
              fontSize: 16,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {text1}
          </Text>
          <Text
            style={{
              color: palette.shellMutedText,
              fontSize: 14,
              marginTop: 5,
              textAlign: "center",
            }}
          >
            {text2}
          </Text>
        </View>
      ),
    }),
    [palette]
  );

  return <Toast config={toastConfig} />;
}

const Stack = createStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['http://localhost:8081', 'exp://localhost:8081'],
  config: {
    screens: {
      Tabs: {
        screens: {
          Home: 'home',
          Favorites: 'favorites',
        },
      },
      Search: 'search',
      Details: {
        path: 'details/:id',
        parse: {
          cast: (value: string) =>
            value
              .split(',')
              .map((entry) => entry.trim())
              .filter(Boolean),
          whereToWatch: (value: string) =>
            value
              .split(',')
              .map((entry) => entry.trim())
              .filter(Boolean),
          seasons: (value: string) => {
            try {
              const parsed: unknown = JSON.parse(value);
              const seasonsResult = SeasonSchema.array().safeParse(parsed);
              return seasonsResult.success ? seasonsResult.data : undefined;
            } catch {
              return undefined;
            }
          },
        },
        stringify: {
          cast: (value: unknown) =>
            Array.isArray(value)
              ? value.map((entry) => String(entry ?? '').trim()).filter(Boolean).join(', ')
              : String(value ?? ''),
          whereToWatch: (value: unknown) =>
            Array.isArray(value)
              ? value.map((entry) => String(entry ?? '').trim()).filter(Boolean).join(', ')
              : String(value ?? ''),
          seasons: (value: unknown) => {
            try {
              return JSON.stringify(value);
            } catch {
              return '';
            }
          },
        },
      },
      NotFound: '404',
    },
  },
};

function RootNavigator(): ReactElement {
  const { theme, palette } = useThemePreference();

  const shellTheme = useMemo(
    () => ({
      ...DefaultTheme,
      dark: theme === "dark",
      colors: {
        ...DefaultTheme.colors,
        background: palette.shellBackground,
        card: palette.shellSurface,
        text: palette.text,
        border: palette.shellBorder,
        primary: palette.tint,
        notification: palette.tint,
      },
    }),
    [theme, palette]
  );

  return (
    <ThemeProvider value={shellTheme}>
      <NavigationContainer linking={linking}>
        <Stack.Navigator>
          <Stack.Screen
            name="Tabs"
            component={TabNavigator}
            options={{
              header: () => <Header />,
              headerStyle: { backgroundColor: palette.shellBackground },
            }}
          />
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{
              title: "Search",
              headerStyle: { backgroundColor: palette.shellBackground },
              headerTintColor: palette.text,
              headerLeft: (props) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                    backgroundColor: palette.shellBackground,
                  }}
                >
                  <HeaderBackButton {...props} tintColor={palette.text} />
                  <Image
                    style={{ width: 50, height: 30, resizeMode: "contain" }}
                    source={require("../assets/images/logo.png")}
                  />
                </View>
              ),
            }}
          />
          <Stack.Screen
            name="Details"
            component={DetailsScreen}
            options={({ navigation }) => ({
              title: "Details",
              headerStyle: { backgroundColor: palette.shellBackground },
              headerTintColor: palette.text,
              headerLeft: (props) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                    backgroundColor: palette.shellBackground,
                  }}
                >
                  <HeaderBackButton
                    {...props}
                    tintColor={palette.text}
                    onPress={() => {
                      if (navigation.canGoBack()) {
                        navigation.goBack();
                        return;
                      }

                      navigation.replace("Tabs", { screen: "Home" });
                    }}
                  />
                  <Image
                    style={{ width: 50, height: 30, resizeMode: "contain" }}
                    source={require("../assets/images/logo.png")}
                  />
                </View>
              ),
            })}
          />
          <Stack.Screen name="NotFound" component={NotFoundScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

export default function RootLayout(): ReactElement | null {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={client}>
      <RepositoryProvider>
        <ThemePreferenceProvider>
          <RootNavigator />
          <ThemedToast />
        </ThemePreferenceProvider>
      </RepositoryProvider>
    </QueryClientProvider>
  );
}
