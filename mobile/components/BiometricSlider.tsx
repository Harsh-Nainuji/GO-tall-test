import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

interface BiometricSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  unit?: string;
  subValue?: string;
  activeColor?: string;
  midLabel?: string;
}

export default function BiometricSlider({
  min,
  max,
  step = 0.5,
  value,
  onChange,
  unit = 'cm',
  subValue,
  activeColor = '#0066FF',
  midLabel,
}: BiometricSliderProps) {
  const [trackWidth, setTrackWidth] = useState(280);
  const isDraggingRef = useRef(false);

  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const updateFromLocalX = (localX: number) => {
    if (trackWidth <= 0) return;
    const ratio = Math.max(0, Math.min(1, localX / trackWidth));
    const rawVal = min + ratio * (max - min);
    const stepped = Math.round(rawVal / step) * step;
    const finalVal = Math.max(min, Math.min(max, Math.round(stepped * 10) / 10));
    onChange(finalVal);
  };

  const handleStep = (delta: number) => {
    const next = Math.max(min, Math.min(max, Math.round((value + delta) * 10) / 10));
    onChange(next);
  };

  // Safe layout measurement without calling e.target.measure (fixes react-native-web crash)
  const handleTrackLayout = (e: any) => {
    const width = e.nativeEvent?.layout?.width;
    if (width && width > 0) {
      setTrackWidth(width);
    }
  };

  // Web desktop mouse drag support
  const handleWebMouseDown = (e: any) => {
    if (Platform.OS !== 'web') return;
    isDraggingRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    updateFromLocalX(localX);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const moveX = moveEvent.clientX - rect.left;
      updateFromLocalX(moveX);
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <View className="w-full my-2">
      {/* Top Value Display */}
      <View className="flex-row items-baseline justify-between mb-3">
        <View className="flex-row items-baseline gap-1">
          <Text className="text-3xl font-black text-slate-900 tracking-tight">
            {step < 1 ? value.toFixed(1) : value}
          </Text>
          <Text className="text-base font-bold text-slate-500">{unit}</Text>
        </View>
        {subValue && (
          <Text className="text-sm font-semibold text-slate-400">{subValue}</Text>
        )}
      </View>

      {/* Interactive Slider Track */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center border border-slate-200 active:bg-slate-200 shadow-sm"
          onPress={() => handleStep(-step)}
        >
          <Minus size={16} color="#334155" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Draggable Rail Container */}
        <View
          className="flex-1 py-4 justify-center cursor-pointer"
          onLayout={handleTrackLayout}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={(evt) => updateFromLocalX(evt.nativeEvent.locationX)}
          onResponderMove={(evt) => updateFromLocalX(evt.nativeEvent.locationX)}
          {...(Platform.OS === 'web' ? { onMouseDown: handleWebMouseDown } : {})}
        >
          {/* Background Rail */}
          <View className="h-3 bg-slate-100 rounded-full relative overflow-visible border border-slate-200">
            {/* Filled Active Rail */}
            <View
              className="h-full rounded-full"
              style={{
                width: `${percentage}%`,
                backgroundColor: activeColor,
              }}
            />

            {/* Draggable Thumb Indicator */}
            <View
              className="absolute -top-2.5 w-8 h-8 rounded-full bg-white border-2 items-center justify-center shadow-lg shadow-blue-500/30"
              style={{
                left: `${percentage}%`,
                marginLeft: -16,
                borderColor: activeColor,
              }}
            >
              <View
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: activeColor }}
              />
            </View>
          </View>

          {/* Min, Mid, Max Labels Below Rail */}
          <View className="flex-row justify-between items-center mt-2.5 px-0.5">
            <Text className="text-[11px] font-bold text-slate-400">
              {min} {unit}
            </Text>
            {midLabel ? (
              <Text className="text-[11px] font-bold text-slate-400">{midLabel}</Text>
            ) : (
              <Text className="text-[11px] font-bold text-slate-400">
                {Math.round((min + max) / 2)} {unit}
              </Text>
            )}
            <Text className="text-[11px] font-bold text-slate-400">
              {max} {unit}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center border border-slate-200 active:bg-slate-200 shadow-sm"
          onPress={() => handleStep(step)}
        >
          <Plus size={16} color="#334155" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
