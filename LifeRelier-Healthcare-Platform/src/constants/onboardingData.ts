export interface OnboardingItem {
    id: string;
    title: string;
    description: string;
    image: any;
}

export const onboardingData: OnboardingItem[] = [
    {
        id: '1',
        title: 'All Your Health,\nAll in One Place',
        description:
            'Manage your health, track insights, and stay connected with your healthcare.',
        image: require('../../assets/onboarding/page1.png'),
    },
    {
        id: '2',
        title: 'Book Appointments\nwith Ease',
        description:
            'Find doctors, book appointments, and get timely reminders.',
        image: require('../../assets/onboarding/page2.png'),
    },
    {
        id: '3',
        title: 'Track Your Health\nEvery Step of the Way',
        description:
            'Monitor activity, sleep, and vital signs. Get insights that help you live better.',
        image: require('../../assets/onboarding/page3.png'),
    },
    {
        id: '4',
        title: 'Care for Your Family,\nAll in One App',
        description:
            'Add family members, manage their health, and stay connected.',
        image: require('../../assets/onboarding/page4.png'),
    },
];