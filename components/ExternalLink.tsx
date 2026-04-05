 import { openBrowserAsync } from "expo-web-browser";
 import { type ComponentProps, type ReactElement } from "react";
 import { Platform, TouchableOpacity } from "react-native";

 type Props = ComponentProps<typeof TouchableOpacity> & { href: string };

 export function ExternalLink({ href, ...rest }: Props): ReactElement {
   const handlePress = async (): Promise<void> => {
     if (Platform.OS === "web") {
       if (typeof window !== "undefined") {
         window.open(href, "_blank", "noopener,noreferrer");
       }
       return;
     }

     await openBrowserAsync(href);
   };

   return (
     <TouchableOpacity
       {...rest}
       onPress={handlePress}
     />
   );
 }
