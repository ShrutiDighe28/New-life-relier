import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
    data: any[];
    currentIndex: number;
}

export default function Pagination({
    data,
    currentIndex,
}: Props) {
    return (
        <View style={styles.container}>
            {data.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.dot,
                        currentIndex === index && styles.activeDot,
                    ]}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 120,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
    },

    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#D1D5DB',
        marginHorizontal: 5,
    },

    activeDot: {
        width: 24,
        backgroundColor: '#2563EB',
    },
});