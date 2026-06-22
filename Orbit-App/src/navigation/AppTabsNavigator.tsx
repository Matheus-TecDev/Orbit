import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

import BottomTabIcon from "../components/layout/BottomTabIcon";
import ChatListScreen from "../screens/app/ChatListScreen";
import FeedScreen from "../screens/app/FeedScreen";
import MatchesScreen from "../screens/app/MatchesScreen";
import MyProfileScreen from "../screens/app/MyProfileScreen";
import { theme } from "../styles/theme";
import type { AppTabParamList } from "./types";

type IconName = ComponentProps<typeof Ionicons>["name"];

const Tab = createBottomTabNavigator<AppTabParamList>();

const tabIcons: Record<AppTabParamListKeys, { active: IconName; inactive: IconName }> = {
  Feed: { active: "planet", inactive: "planet-outline" },
  Matches: { active: "heart", inactive: "heart-outline" },
  ChatList: { active: "chatbubbles", inactive: "chatbubbles-outline" },
  MyProfile: { active: "person", inactive: "person-outline" },
};

type AppTabParamListKeys = keyof AppTabParamList;

export default function AppTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          minHeight: 78,
          paddingTop: 9,
          paddingBottom: 12,
          paddingHorizontal: 8,
          borderTopWidth: 1,
          borderTopColor: theme.colors.borderDefault,
          backgroundColor: theme.colors.surface1,
        },
        tabBarItemStyle: {
          borderRadius: 10,
          marginHorizontal: 2,
        },
        tabBarActiveTintColor: theme.colors.purpleLight,
        tabBarInactiveTintColor: theme.colors.textMutedToken,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
          marginTop: 2,
        },
        tabBarIcon: ({ focused, size }) => {
          const iconSet = tabIcons[route.name];

          return (
            <BottomTabIcon
              name={focused ? iconSet.active : iconSet.inactive}
              focused={focused}
              size={size}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ title: "Descobrir" }} />
      <Tab.Screen name="Matches" component={MatchesScreen} options={{ title: "Matches" }} />
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: "Conversas" }}
      />
      <Tab.Screen
        name="MyProfile"
        component={MyProfileScreen}
        options={{ title: "Perfil" }}
      />
    </Tab.Navigator>
  );
}
