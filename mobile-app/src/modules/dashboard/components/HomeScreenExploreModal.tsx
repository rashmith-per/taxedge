import React from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import type { EdgeInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "../../../styles/app/(main)/home.styles";
import type { CatalogueItem, ServiceCategoryId } from "../../../shared/types/domain";

interface HomeScreenExploreModalProps {
  visible: boolean;
  onClose: () => void;
  moreQuery: string;
  setMoreQuery: (query: string) => void;
  filteredCatalogue: Array<{
    id: ServiceCategoryId;
    title: string;
    icon: any;
    items: CatalogueItem[];
  }>;
  openCatalogueItem: (item: CatalogueItem, categoryId: ServiceCategoryId) => void;
  isDark: boolean;
  colors: any;
  insets: EdgeInsets;
}

export function HomeScreenExploreModal({
  visible,
  onClose,
  moreQuery,
  setMoreQuery,
  filteredCatalogue,
  openCatalogueItem,
  isDark,
  colors,
  insets,
}: HomeScreenExploreModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 12,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              Explore Services
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Text style={[styles.sheetDone, { color: colors.orange }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.sheetSearch,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="search"
              size={17}
              color={colors.textSecondary}
            />
            <TextInput
              value={moreQuery}
              onChangeText={setMoreQuery}
              placeholder="Search services..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.sheetSearchInput, { color: colors.text }]}
              autoCorrect={false}
              returnKeyType="search"
            />
            {moreQuery.length > 0 && (
              <TouchableOpacity onPress={() => setMoreQuery("")} hitSlop={8}>
                <Ionicons
                  name="close-circle"
                  size={17}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.sheetScrollContent}
          >
            {filteredCatalogue.map((group, groupIndex) => (
              <View key={`${group.id}-${groupIndex}`}>
                <View style={styles.catHeader}>
                  <View
                    style={[
                      styles.catIcon,
                      {
                        backgroundColor: isDark
                          ? colors.backgroundSelected
                          : "#E8EFF7",
                      },
                    ]}
                  >
                    <Ionicons
                      name={group.icon}
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={[styles.catTitle, { color: colors.text }]}>
                    {group.title}
                  </Text>
                </View>

                {group.items.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    activeOpacity={0.75}
                    onPress={() => openCatalogueItem(item, group.id)}
                    style={[
                      styles.serviceRow,
                      {
                        backgroundColor: colors.backgroundElement,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.serviceRowText,
                        { color: colors.text },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={17}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            {filteredCatalogue.length === 0 && (
              <View style={styles.sheetEmpty}>
                <Ionicons
                  name="search-outline"
                  size={34}
                  color={colors.textSecondary}
                />
                <Text style={[styles.sheetEmptyText, { color: colors.text }]}>
                  No services match "{moreQuery.trim()}"
                </Text>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
