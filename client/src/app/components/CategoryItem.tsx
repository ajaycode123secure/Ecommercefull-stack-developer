import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { CategoryItemProps } from "@/constants/types";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  all: "grid-outline",
  grid: "grid-outline",
  men: "man-outline",
  women: "woman-outline",
  kids: "happy-outline",
  shoes: "footsteps-outline",
  bag: "briefcase-outline",
  bags: "briefcase-outline",
};

export default function CategoryItem({ item, isSelected, onPress }: CategoryItemProps) {
  const iconName = ICON_MAP[item.id?.toLowerCase()] || ICON_MAP[item.Icon?.toLowerCase() ?? ""] || "grid-outline";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ alignItems: "center", marginRight: 20, paddingVertical: 4 }}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: isSelected ? COLORS.black : COLORS.lightGray,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: isSelected ? 0 : 1,
          borderColor: COLORS.border,
        }}
      >
        <Ionicons
          name={iconName}
          size={26}
          color={isSelected ? "#fff" : COLORS.darkGray}
        />
      </View>
      <Text
        style={{
          marginTop: 6,
          fontSize: 12,
          fontWeight: isSelected ? "700" : "500",
          color: isSelected ? COLORS.black : COLORS.darkGray,
        }}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}