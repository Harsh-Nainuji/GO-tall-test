import React, { useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

interface BiometricRulerProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  unit?: string;
  subValue?: string;
  fineStep?: number;
}

const TICK_WIDTH = 14; // pixels per step

export default function BiometricRuler({
  min,
  max,
  step = 0.5,
  value,
  onChange,
  unit = 'cm',
  subValue,
  fineStep = 0.5,
}: BiometricRulerProps) {
  const scrollRef = useRef<any>(null);
  const isDraggingWeb = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScrollX = useRef(0);
  const [viewportWidth, setViewportWidth] = useState(320);

  const totalSteps = Math.round((max - min) / step);

  const scrollToValue = (val: number, animated = true) => {
    const clamped = Math.max(min, Math.min(max, val));
    const stepIndex = (clamped - min) / step;
    const offset = stepIndex * TICK_WIDTH;
    const scrollNode = (scrollRef.current as any)?.getScrollableNode?.() || scrollRef.current;
    if (scrollNode && 'scrollLeft' in scrollNode && !animated) {
      scrollNode.scrollLeft = offset;
    } else {
      scrollRef.current?.scrollTo({ x: offset, animated });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToValue(value, false);
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const stepIndex = Math.round(offsetX / TICK_WIDTH);
    const clamped = Math.max(0, Math.min(totalSteps, stepIndex));
    const newVal = Math.round((min + clamped * step) * 10) / 10;
    if (newVal !== value && newVal >= min && newVal <= max) {
      onChange(newVal);
    }
  };

  const handleFineAdjust = (delta: number) => {
    const next = Math.max(min, Math.min(max, Math.round((value + delta) * 10) / 10));
    onChange(next);
    scrollToValue(next, true);
  };

  // Web mouse drag handlers
  const handleWebMouseDown = (e: any) => {
    if (Platform.OS !== 'web') return;
    isDraggingWeb.current = true;
    dragStartX.current = e.clientX;
    const currentStepIndex = (value - min) / step;
    dragStartScrollX.current = currentStepIndex * TICK_WIDTH;

    const onMouseMove = (moveEvt: MouseEvent) => {
      if (!isDraggingWeb.current) return;
      const deltaX = dragStartX.current - moveEvt.clientX;
      const nextScrollX = Math.max(0, Math.min(totalSteps * TICK_WIDTH, dragStartScrollX.current + deltaX));
      
      const scrollNode = (scrollRef.current as any)?.getScrollableNode?.() || scrollRef.current;
      if (scrollNode && 'scrollLeft' in scrollNode) {
        scrollNode.scrollLeft = nextScrollX;
      } else {
        scrollRef.current?.scrollTo({ x: nextScrollX, animated: false });
      }

      const stepIndex = Math.round(nextScrollX / TICK_WIDTH);
      const newVal = Math.round((min + stepIndex * step) * 10) / 10;
      if (newVal >= min && newVal <= max) {
        onChange(newVal);
      }
    };

    const onMouseUp = () => {
      isDraggingWeb.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const halfSpacer = Math.max(120, viewportWidth / 2 - TICK_WIDTH / 2);

  return (
    <View
      className="w-full items-center my-3 select-none p-5 rounded-3xl bg-white/70 border border-white/80 shadow-md shadow-blue-900/5 backdrop-blur-2xl"
      onLayout={(e) => {
        const w = e.nativeEvent?.layout?.width;
        if (w > 0) setViewportWidth(w);
      }}
    >
      {/* Big Number Readout */}
      <View className="items-center my-2">
        <View className="flex-row items-baseline gap-1.5">
          <Text className="text-5xl font-black text-slate-900 tracking-tight">
            {step < 1 ? value.toFixed(1) : value}
          </Text>
          <Text className="text-xl font-black text-blue-600 uppercase">{unit}</Text>
        </View>
        {subValue && (
          <View className="mt-1 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-100/60">
            <Text className="text-xs font-bold text-blue-700">
              {subValue}
            </Text>
          </View>
        )}
      </View>

      {/* Center Needle & Scrollable Scale Viewport */}
      <View
        className="w-full relative h-28 items-center justify-center my-3 bg-blue-50/30 rounded-2xl border border-white/60 overflow-hidden cursor-ew-resize"
        {...(Platform.OS === 'web' ? { onMouseDown: handleWebMouseDown } : {})}
      >
        {/* Subtle Edge Fade Masks */}
        <View
          pointerEvents="none"
          className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-white/90 to-transparent"
        />
        <View
          pointerEvents="none"
          className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-white/90 to-transparent"
        />

        {/* Fixed Center Indicator Needle */}
        <View
          pointerEvents="none"
          className="absolute z-20 items-center top-0 bottom-0 justify-between py-1.5"
        >
          <View className="w-2.5 h-2.5 rounded-full bg-blue-600 mb-0.5 shadow-sm shadow-blue-500/50" />
          <View className="w-0.5 h-16 bg-blue-600 rounded-full" />
          <View className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-0.5 shadow-sm shadow-blue-500/50" />
        </View>

        {/* Horizontal Moving Ticks ScrollView */}
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          contentContainerStyle={{
            paddingHorizontal: halfSpacer,
            alignItems: 'center',
          }}
        >
          {[...Array(totalSteps + 1)].map((_, i) => {
            const tickVal = min + i * step;
            const isMajor = i % 10 === 0;
            const isMedium = i % 2 === 0;

            return (
              <View
                key={i}
                style={{ width: TICK_WIDTH }}
                className="items-center justify-end h-20 pb-2"
              >
                <View
                  className={`rounded-full ${
                    isMajor
                      ? 'w-1 h-10 bg-slate-600'
                      : isMedium
                      ? 'w-0.5 h-6 bg-slate-400'
                      : 'w-0.5 h-4 bg-slate-300'
                  }`}
                />
                {isMajor && (
                  <Text className="text-[10px] font-bold text-slate-500 mt-1 select-none">
                    {Math.round(tickVal)}
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Fine-Tuning Stepper Buttons */}
      <View className="flex-row items-center justify-center gap-3 mt-3">
        <TouchableOpacity
          className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 active:bg-blue-100 shadow-sm"
          onPress={() => handleFineAdjust(-fineStep)}
        >
          <Minus size={15} color="#0066FF" strokeWidth={2.5} />
          <Text className="text-xs font-bold text-blue-700">
            − {fineStep} {unit}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 active:bg-blue-100 shadow-sm"
          onPress={() => handleFineAdjust(fineStep)}
        >
          <Plus size={15} color="#0066FF" strokeWidth={2.5} />
          <Text className="text-xs font-bold text-blue-700">
            + {fineStep} {unit}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
