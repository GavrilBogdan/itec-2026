import { Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LandingScreen } from "./src/screen/auth/landing.screen";
import { RegisterScreen } from "./src/screen/auth/register.screen";
import { LoginScreen } from "./src/screen/auth/login.screen";
import { ActivityScreen } from "./src/screen/app/activity.screen";
import { ScanScreen } from "./src/screen/app/scan.screen";
import { MapScreen } from "./src/screen/app/map.screen";
import { SettingsScreen } from "./src/screen/app/settings.screen";
import { Provider, useAtom, useAtomValue } from "jotai";
import { tokenAtom, store } from "./src/store";
import { useAuth } from "./src/hooks/use-auth.hook";
import axios from "axios";


axios.defaults.baseURL = "https://ana-unfakable-shenita.ngrok-free.dev";
axios.interceptors.request.use((cfg) => {
  const jwt = store.get(tokenAtom);
  if (jwt) cfg.headers.Authorization = jwt;
  return cfg;
});

const Main = createNativeStackNavigator();

const Auth = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const AuthStack = () => {
  return (
    <Auth.Navigator screenOptions={{ headerShown: false }}>
      <Auth.Screen name="LandingScreen" component={LandingScreen} />
      <Auth.Screen name="RegisterScreen" component={RegisterScreen} />
      <Auth.Screen name="LoginScreen" component={LoginScreen} />
    </Auth.Navigator>
  );
};

const AppTabs = () => {
  const { userDetails } = useAuth();

  return (
    <Tabs.Navigator>
      <Tabs.Screen name="ScanScreen" component={ScanScreen} />
      <Tabs.Screen name="MapScreen" component={MapScreen} />
	<Tabs.Screen name="ActivityScreen" component={ActivityScreen}/>
        <Tabs.Screen name="SettingsScreen" component={SettingsScreen} />
    </Tabs.Navigator>
  );
};

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

export default function App() {
  return (
    <Provider>
      <Navigation />
    </Provider>
  );
}