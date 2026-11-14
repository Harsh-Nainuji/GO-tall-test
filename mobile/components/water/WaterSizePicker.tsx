// ✓ Modal rules applied — GlassCard, ScrollView, 85% maxHeight, SlideInDown
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Droplet, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import BottomSheet from '../ui/BottomSheet';
import { WATER_QUICK_CHIPS_ML } from '../../lib/constants';
import { colors } from '../../lib/theme';

interface WaterSizePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectAmount: (amount_ml: number, label?: string) => void;
}

interface QuickOption {
  amount: number;
  label: string;
  iconText: string;
}

const QUICK_OPTIONS: QuickOption[] = [
  { amount: 150, label: 'Small Cup', iconText: '☕' },
  { amount: 250, label: 'Glass', iconText: '🥛' },
  { amount: 500, label: 'Bottle', iconText: '🍶' },
];

export default function WaterSizePicker({
  visible,
  onClose,
  onSelectAmount,
}: WaterSizePickerProps) {
  const [selectedPreset, setSelectedPreset] = useState<number>(250);
  const [customMl, setCustomMl] = useState('');

  const handleSelectQuick = (option: QuickOption) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedPreset(option.amount);
    setCustomMl('');
  };

  const handleConfirm = () => {
    const finalAmount = customMl ? Number(customMl) : selectedPreset;
    if (!finalAmount || finalAmount <= 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onSelectAmount(finalAmount, customMl ? `${finalAmount}ml` : undefined);
    setCustomMl('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Add Water">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.subtitle}>Hydrate your spine discs to support growth.</Text>

        {/* Quick Chips */}
        <View style={styles.quickGrid}>
          {QUICK_OPTIONS.map((opt) => {
            const isSelected = selectedPreset === opt.amount && !customMl;
            return (
              <TouchableOpacity
                key={opt.amount}
                onPress={() => handleSelectQuick(opt)}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardActive,
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.optionEmoji}>{opt.iconText}</Text>
                <Text style={[styles.optionAmount, isSelected && styles.optionTextActive]}>
                  {opt.amount} ml
                </Text>
                <Text style={[styles.optionLabel, isSelected && styles.optionTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Input */}
        <View style={styles.customSection}>
          <Text style={styles.customLabel}>Or enter custom amount</Text>
          <View style={styles.inputWrap}>
            <Droplet size={18} color={colors.blue600} />
            <TextInput
              value={customMl}
              onChangeText={(val) => {
                setCustomMl(val);
                if (val) setSelectedPreset(0);
              }}
              placeholder="e.g. 350"
              placeholderTextColor={colors.slate400}
              keyboardType="numeric"
              style={styles.input}
            />
            <Text style={styles.unitText}>ml</Text>
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!customMl && !selectedPreset}
          style={[
            styles.confirmBtn,
            (!customMl && !selectedPreset) && styles.confirmBtnDisabled,
          ]}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.confirmBtnText}>
            Add {customMl ? `${customMl} ml` : `${selectedPreset} ml`}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  subtitle: {
    fontSize: 13,
    color: colors.slate600,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  optionCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: colors.blue600,
  },
  optionEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  optionAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate900,
  },
  optionLabel: {
    fontSize: 11,
    color: colors.slate600,
  },
  optionTextActive: {
    color: colors.blue600,
  },
  customSection: {
    gap: 6,
  },
  customLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate600,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.slate900,
    padding: 0,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate400,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.blue600,
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 4,
  },
  confirmBtnDisabled: {
    backgroundColor: colors.slate400,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
