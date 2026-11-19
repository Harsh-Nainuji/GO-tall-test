import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { ShieldAlert, AlertTriangle, CheckCircle2, ChevronRight, Activity, Lock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import GlassCard from './ui/GlassCard';

interface HealthDisclaimerModalProps {
  visible: boolean;
  onAccept: () => void;
  onClose?: () => void;
}

export default function HealthDisclaimerModal({
  visible,
  onAccept,
  onClose,
}: HealthDisclaimerModalProps) {
  const [hasAgreed, setHasAgreed] = useState(false);

  const handleConfirm = () => {
    if (!hasAgreed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onAccept();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <GlassCard style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <ShieldAlert size={28} color="#D97706" />
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.title}>Medical & Legal Disclaimer</Text>
              <Text style={styles.subtitle}>
                Mandatory health disclosure before calibrating your 6-week program
              </Text>
            </View>
          </View>

          {/* Scrollable Terms */}
          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollInner}
          >
            {/* Clause 1: No Biological Bone Guarantee */}
            <View style={styles.clauseBox}>
              <View style={styles.clauseHeader}>
                <AlertTriangle size={15} color="#DC2626" />
                <Text style={styles.clauseTitle}>1. No Biological Bone Elongation Guarantee</Text>
              </View>
              <Text style={styles.clauseBody}>
                Long-bone biological growth is strictly governed by genetics, endocrinology, and the ossification of epiphyseal growth plates. Tallgrame does NOT promise, warrant, or guarantee impossible stature increases. Stature gains achieved through decompression (typically 1.0–2.5 cm) reflect the rehydration of compressed intervertebral spinal discs and pelvic-thoracic alignment, not new bone length.
              </Text>
            </View>

            {/* Clause 2: Not Medical Advice */}
            <View style={styles.clauseBox}>
              <View style={styles.clauseHeader}>
                <Activity size={15} color="#2563EB" />
                <Text style={styles.clauseTitle}>2. Educational & Wellness Tool Only</Text>
              </View>
              <Text style={styles.clauseBody}>
                The Tallgrame mobile application, auto-scheduler, and clinical AI advisor provide educational biomechanical guidelines. This application is NOT a medical device, hospital service, or licensed physical therapy clinic. Nothing within this app constitutes medical advice, clinical diagnosis, or prescriptive therapy.
              </Text>
            </View>

            {/* Clause 3: Physician Consultation Required */}
            <View style={styles.clauseBox}>
              <View style={styles.clauseHeader}>
                <Activity size={15} color="#059669" />
                <Text style={styles.clauseTitle}>3. Physician Consultation Required</Text>
              </View>
              <Text style={styles.clauseBody}>
                Always seek the guidance of a board-certified physician, orthopedist, or physical therapist before engaging in axial hanging traction or spinal extension routines, especially if you have scoliosis, disc herniation, spondylolisthesis, joint hypermobility, or cardiovascular concerns.
              </Text>
            </View>

            {/* Clause 4: Safety Stop Triggers */}
            <View style={styles.clauseBox}>
              <View style={styles.clauseHeader}>
                <AlertTriangle size={15} color="#D97706" />
                <Text style={styles.clauseTitle}>4. Immediate Safety Stop Triggers</Text>
              </View>
              <Text style={styles.clauseBody}>
                Cease any exercise immediately and seek emergency medical care if you experience:
                {'\n'}• Sharp, shooting, or electric radicular nerve pain down the legs or arms
                {'\n'}• Numbness, tingling, or sudden muscle weakness
                {'\n'}• Acute spinal spasm, dizziness, or loss of balance
              </Text>
            </View>

            {/* Clause 5: One-Time Locked Curriculum */}
            <View style={styles.clauseBox}>
              <View style={styles.clauseHeader}>
                <Lock size={15} color="#7C3AED" />
                <Text style={styles.clauseTitle}>5. Locked 6-Week Adherence Commitment</Text>
              </View>
              <Text style={styles.clauseBody}>
                Your protocol will be calibrated once based on your personal diagnostic profile. To prevent token waste and ensure clinical progressive overload, arbitrary reshuffling is restricted. Progressive week-by-week completion is required.
              </Text>
            </View>
          </ScrollView>

          {/* Interactive Checkbox */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setHasAgreed(!hasAgreed);
            }}
            style={[
              styles.checkboxRow,
              hasAgreed && styles.checkboxRowActive,
            ]}
          >
            <View
              style={[
                styles.checkboxBox,
                hasAgreed && styles.checkboxBoxChecked,
              ]}
            >
              {hasAgreed && <CheckCircle2 size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.checkboxLabel}>
              I have read, understood, and accept all medical warnings and legal terms above. I understand results vary and no height increase is guaranteed.
            </Text>
          </TouchableOpacity>

          {/* Action Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={!hasAgreed}
            onPress={handleConfirm}
            style={[
              styles.acceptBtn,
              hasAgreed ? styles.acceptBtnEnabled : styles.acceptBtnDisabled,
            ]}
          >
            <Text style={styles.acceptBtnText}>
              Acknowledge & Calibrate 6-Week Protocol
            </Text>
            <ChevronRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </GlassCard>
      </View>
    </Modal>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  modalCard: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.85,
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  scrollArea: {
    maxHeight: SCREEN_HEIGHT * 0.44,
  },
  scrollInner: {
    gap: 10,
    paddingBottom: 8,
  },
  clauseBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  clauseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clauseTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  clauseBody: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    marginBottom: 12,
  },
  checkboxRowActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxBoxChecked: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 16,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
  },
  acceptBtnEnabled: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  acceptBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
