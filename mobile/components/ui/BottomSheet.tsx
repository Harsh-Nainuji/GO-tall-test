import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import GlassCard from './GlassCard';
import { colors } from '../../lib/theme';
import { haptics } from '../../lib/animations';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  scrollable?: boolean;
  footer?: React.ReactNode;
  testID?: string;
}

export default function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  showCloseButton = true,
  scrollable = true,
  footer,
  testID,
}: BottomSheetProps) {
  if (!visible) return null;

  const handleClose = () => {
    haptics.selection();
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
      testID={testID}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        {/* Fullscreen Dim Overlay */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(200)}
            style={styles.backdrop}
          />
        </TouchableWithoutFeedback>

        {/* Animated Sheet Container */}
        <Animated.View
          entering={SlideInDown.duration(350)}
          exiting={SlideOutDown.duration(280)}
          style={styles.sheetWrapper}
        >
          <GlassCard style={styles.sheetCard}>
            {/* Header */}
            {(title || showCloseButton) && (
              <View style={styles.header}>
                <View style={styles.headerTextWrapper}>
                  {title ? <Text style={styles.title}>{title}</Text> : null}
                  {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                </View>

                {showCloseButton && (
                  <TouchableOpacity
                    onPress={handleClose}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    style={styles.closeButton}
                    accessibilityLabel="Close dialog"
                    accessibilityRole="button"
                  >
                    <X size={20} color={colors.slate600} strokeWidth={2.4} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Body */}
            {scrollable ? (
              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            ) : (
              <View style={styles.staticContent}>{children}</View>
            )}

            {/* Optional Persistent Footer */}
            {footer && <View style={styles.footer}>{footer}</View>}
          </GlassCard>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheetWrapper: {
    width: '100%',
    maxHeight: MAX_SHEET_HEIGHT,
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  sheetCard: {
    maxHeight: MAX_SHEET_HEIGHT,
    borderRadius: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.slate200,
  },
  headerTextWrapper: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.slate900,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: colors.slate400,
    marginTop: 2,
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flexShrink: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 28,
  },
  staticContent: {
    padding: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.slate200,
    backgroundColor: 'rgba(255, 255, 255, 0.60)',
  },
});
