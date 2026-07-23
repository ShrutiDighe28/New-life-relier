import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
} from 'react-native';

interface Props {
    title: string;
    onPress: () => void;
}

export default function NextButton({
    title,
    onPress,
}: Props) {
    return (
        <TouchableOpacity
            style={styles.button}
            activeOpacity={0.9}
            onPress={onPress}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom: 40,
        right: 24,

        width: 170,
        height: 58,

        backgroundColor: '#2563EB',

        borderRadius: 30,

        justifyContent: 'center',
        alignItems: 'center',

        elevation: 6,
    },

    text: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 18,
    },
}); 