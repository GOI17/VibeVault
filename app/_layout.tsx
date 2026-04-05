import {
  DefaultTheme,
  ThemeProvider,
  NavigationContainer,
} from "@react-navigation/native";
import type { LinkingOptions } from "@react-navigation/native";
import type { ReactElement } from "react";

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
import { Colors } from "@/constants/Colors";
import { client } from "@/constants/RQClient";
import { RepositoryProvider } from "@/providers/RepositoryProvider";
import NotFoundScreen from "./+not-found";
import TabNavigator from "./tabs/_layout";
import SearchScreen from "./home/search/query";
import type { RootStackParamList } from "./navigation/types";

interface ToastInfoProps {
  text1?: string;
  text2?: string;
}

const toastConfig: ToastConfig = {
  info: ({ text1, text2 }: ToastInfoProps) => (
    <View
      style={{
        backgroundColor: "#000000",
        borderLeftColor: "#E50914",
        borderLeftWidth: 5,
        padding: 15,
        marginHorizontal: 20,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5,
        alignSelf: "center",
        width: "90%",
        maxWidth: 400,
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 16,
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {text1}
      </Text>
      <Text
        style={{
          color: "#CCCCCC",
          fontSize: 14,
          marginTop: 5,
          textAlign: "center",
        }}
      >
        {text2}
      </Text>
    </View>
  ),
};

const Stack = createStackNavigator<RootStackParamList>();

const shellTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.shellBackground,
    card: Colors.light.shellSurface,
    text: Colors.light.text,
    border: Colors.light.shellBorder,
    primary: Colors.light.tint,
    notification: Colors.light.tint,
  },
};

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
      NotFound: '404',
    },
  },
};

export default function RootLayout(): ReactElement | null {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={shellTheme}>
      <QueryClientProvider client={client}>
        <RepositoryProvider>
          <NavigationContainer linking={linking}>
            <Stack.Navigator>
              <Stack.Screen
                name="Tabs"
                component={TabNavigator}
                options={{
                  header: () => <Header />,
                  headerStyle: { backgroundColor: Colors.light.shellBackground },
                }}
              />
              <Stack.Screen
                name="Search"
                component={SearchScreen}
                options={{
                  title: "Search",
                  headerStyle: { backgroundColor: Colors.light.shellBackground },
                  headerTintColor: Colors.light.text,
                  headerLeft: (props) => (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 10,
                        backgroundColor: Colors.light.shellBackground,
                      }}
                    >
                      <HeaderBackButton {...props} tintColor={Colors.light.text} />
                      <Image
                        style={{ width: 50, height: 30, resizeMode: "contain" }}
                        source={require("../assets/images/logo.png")}
                      />
                    </View>
                  ),
                }}
              />
              <Stack.Screen name="NotFound" component={NotFoundScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </RepositoryProvider>
        <Toast config={toastConfig} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
