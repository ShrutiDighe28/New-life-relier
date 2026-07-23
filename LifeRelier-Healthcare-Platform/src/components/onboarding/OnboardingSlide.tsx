import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
} from 'react-native';

import { OnboardingItem } from '@/constants/onboardingData';

const { width, height } = Dimensions.get('window');

interface Props {
    item: OnboardingItem;
}

export default function OnboardingSlide({ item }: Props) {
    return (
        <View style={styles.container}>
            <Image
                source={item.image}
                style={styles.image}
                resizeMode="cover"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width,
        height,
        backgroundColor: '#fff',
    },

    image: {
        width,
        height,
    },
});