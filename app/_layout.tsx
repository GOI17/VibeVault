import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { HeaderBackButton } from "@react-navigation/elements";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  Appearance,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { View as ToastView, Text as ToastText } from "react-native";
import { Formik } from "formik";
import Toast from 'react-native-toast-message';
import "react-native-reanimated";

const toastConfig = {
  info: ({ text1, text2 }: any) => (
    <View style={{
      backgroundColor: '#000000',
      borderLeftColor: '#E50914',
      borderLeftWidth: 5,
      padding: 15,
      marginHorizontal: 20,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      elevation: 5,
      alignSelf: 'center',
      width: '90%',
      maxWidth: 400,
    }}>
      <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>{text1}</Text>
      <Text style={{ color: '#CCCCCC', fontSize: 14, marginTop: 5, textAlign: 'center' }}>{text2}</Text>
    </View>
  ),
};

import { useColorScheme } from "@/hooks/useColorScheme";
import { client } from "@/constants/RQClient";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const router = useRouter();

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={client}>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              header: () => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                    backgroundColor: '#000000',
                    height: 60,
                  }}
                >
                  <Image
                    style={{ width: 80, height: 40, resizeMode: 'contain' }}
                    source={require("../assets/images/logo.png")}
                  />
                  <View style={{ flex: 1, marginHorizontal: 10 }}>
                    <Formik
                      initialValues={{ query: "" }}
                      validate={(values) => {
                        const errors: Record<string, string> = {};
                        if (!values.query) {
                          errors.query = "Required";
                        }

                        return errors;
                      }}
                      onSubmit={(values, { setSubmitting }) => {
                        setSubmitting(false);
                        router.navigate(`/search/${values.query}`);
                      }}
                    >
                      {({ handleChange, handleSubmit, values, isSubmitting }) => (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <TextInput
                            style={{
                              flex: 1,
                              height: 35,
                              borderColor: '#E50914',
                              borderWidth: 1,
                              borderRadius: 5,
                              paddingHorizontal: 10,
                              color: '#FFFFFF',
                              backgroundColor: '#333333',
                            }}
                            placeholder="Search movies..."
                            placeholderTextColor="#CCCCCC"
                            value={values.query}
                            onChangeText={handleChange('query')}
                          />
                          <TouchableOpacity
                            onPress={() => handleSubmit()}
                            disabled={isSubmitting || !values.query}
                            style={{
                              marginLeft: 10,
                              backgroundColor: '#E50914',
                              paddingHorizontal: 15,
                              paddingVertical: 8,
                              borderRadius: 5,
                            }}
                          >
                            <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Search</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </Formik>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      Appearance?.setColorScheme?.(
                        colorScheme === "light" ? "dark" : "light",
                      )
                    }
                    style={{ padding: 5 }}
                  >
                    <IconSymbol name="wineglass.fill" color="#E50914" />
                  </TouchableOpacity>
                </View>
              ),
            }}
          />
          <Stack.Screen
            name="(home)/search/[query]"
            options={{
              title: "Search",
              headerStyle: { backgroundColor: '#000000' },
              headerTintColor: '#FFFFFF',
              header: (props) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                    backgroundColor: '#000000',
                  }}
                >
                  <HeaderBackButton onPress={props.navigation.goBack} tintColor="#FFFFFF" />
                  <Image
                    style={{ width: 50, height: 30, resizeMode: 'contain' }}
                    source={require("../assets/images/logo.png")}
                  />
                </View>
              ),
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <Toast config={toastConfig} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
