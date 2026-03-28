import { Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { LandingScreen } from "./src/screen/auth/landing.screen";
import { RegisterScreen } from "./src/screen/auth/register.screen";
import { LoginScreen } from "./src/screen/auth/login.screen";
import { ActivityScreen } from "./src/screen/app/activity.screen";
import { ScanScreen } from "./src/screen/app/scan.screen";
import { MapScreen } from "./src/screen/app/map.screen";
import { SettingsScreen } from "./src/screen/app/settings.screen";
import { Provider } from "jotai";
import { tokenAtom, store } from "./src/store";
import { useAuth } from "./src/hooks/use-auth.hook";
import axios from "axios";

// 🔗 AXIOS CONFIG
axios.defaults.baseURL = "https://ana-unfakable-shenita.ngrok-free.dev";
axios.interceptors.request.use((cfg) => {
  const jwt = store.get(tokenAtom);
  if (jwt) cfg.headers.Authorization = jwt;
  return cfg;
});

// 🔧 NAVIGATORS
const Main = createNativeStackNavigator();
const Auth = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

// 🔐 AUTH STACK
const AuthStack = () => {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="LandingScreen" component={LandingScreen} />
      <Auth.Screen name="RegisterScreen" component={RegisterScreen} />
      <Auth.Screen name="LoginScreen" component={LoginScreen} />
    </Auth.Navigator>
  );
};

// 📱 APP TABS (CU ICONIȚE)
const AppTabs = () => {
  const { userDetails } = useAuth();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        // 🎨 STYLING CYBER
        tabBarStyle: {
          backgroundColor: "#050505",
          borderTopColor: "#1586ff",
          height: 70,
        },
        tabBarActiveTintColor: "#00e1ff",
        tabBarInactiveTintColor: "gray",
        tabBarShowLabel: false,

        // 🔥 ICONIȚE
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === "ScanScreen") {
            iconName = "scan-outline";
          } else if (route.name === "MapScreen") {
            iconName = "map-outline";
          } else if (route.name === "ActivityScreen") {
            iconName = "pulse-outline";
          } else if (route.name === "SettingsScreen") {
            iconName = "settings-outline";
          }

          return <Ionicons name={iconName} size={26} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="ScanScreen" component={ScanScreen} />
      <Tabs.Screen name="MapScreen" component={MapScreen} />
      <Tabs.Screen name="ActivityScreen" component={ActivityScreen} />
      <Tabs.Screen name="SettingsScreen" component={SettingsScreen} />
    </Tabs.Navigator>
  );
};

// 🔁 NAVIGATION ROOT
const Navigation = () => {
  const { token } = useAuth();

  return (
    <NavigationContainer>
      <Main.Navigator screenOptions={{ headerShown: false }}>
        {token === null ? (
          <Main.Screen name="AuthStack" component={AuthStack} />
        ) : (
          <Main.Screen name="AppTabs" component={AppTabs} />
        )}
      </Main.Navigator>
    </NavigationContainer>
  );
};

// 🚀 APP ROOT
export default function App() {
  return (
    <Provider>
      <Navigation />
    </Provider>
  );
}
