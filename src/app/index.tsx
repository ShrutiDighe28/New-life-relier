import React, { useRef, useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  FlatList,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { onboardingData } from "@/constants/onboardingData";
import OnboardingSlide from "@/components/onboarding/OnboardingSlide";
import Pagination from "@/components/onboarding/Pagination";
import NextButton from "@/components/onboarding/NextButton";

export default function OnboardingScreen() {
  const router = useRouter();

  const flatListRef = useRef<FlatList>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 50,
  }), []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    },
    []
  );

  const handleSkip = () => {
    router.replace("/welcome");
  };

  const handleNext = () => {
    if (currentIndex === onboardingData.length - 1) {
      router.replace("/welcome");
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      {/* Skip */}

      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        activeOpacity={0.8}
      >
        <Text style={styles.skipText}>
          Skip
        </Text>
      </TouchableOpacity>

      {/* Slides */}

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={({ item }) => (
          <OnboardingSlide item={item} />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={1}
        windowSize={2}
        removeClippedSubviews
      />

      {/* Pagination */}

      <Pagination
        data={onboardingData}
        currentIndex={currentIndex}
      />

      {/* Button */}

      <View style={styles.buttonContainer}>
        <NextButton
          title={
            currentIndex === onboardingData.length - 1
              ? "Get Started"
              : "Next"
          }
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  skipButton: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 100,
  },

  skipText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },

  buttonContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
});