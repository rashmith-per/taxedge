import React from "react";
import { View, Image } from "react-native";
import { landingStyles } from "./landing.styles";

export function HeroSection() {
  return (
    <View style={landingStyles.heroContainer}>
      <Image
        source={require("../../../assets/images/finsolz-hero.png")}
        style={landingStyles.heroImage}
        resizeMode="cover"
      />
    </View>
  );
}

export default HeroSection;
