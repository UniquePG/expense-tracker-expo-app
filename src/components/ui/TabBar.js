import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Text, useTheme} from 'react-native-paper';

export const TabBar = ({tabs, activeTab, onChange, style}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[
              styles.tab,
              isActive && {borderBottomColor: theme.colors.primary},
            ]}>
            <Text
              style={[
                styles.tabText,
                {
                  color: isActive ? theme.colors.primary : theme.colors.textSecondary,
                  fontWeight: isActive ? '600' : '400',
                },
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
  },
});