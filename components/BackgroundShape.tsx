// components/BackgroundShape.tsx
import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { View, StyleSheet } from "react-native";

export default function BackgroundShape() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 323 720"
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          <LinearGradient
            id="grad"
            x1="97.5"
            y1="0.5"
            x2="301.499"
            y2="720.5"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#65ADD4" />
            <Stop offset="1" stopColor="#073260" />
          </LinearGradient>
        </Defs>
        <Path
          d="M171.5 167.5L251 0L322.5 59.5V720.5L-91 705L171.5 167.5Z"
          fill="url(#grad)"
        />
      </Svg>
    </View>
  );
}
