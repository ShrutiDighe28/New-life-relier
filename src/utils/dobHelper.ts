/**
 * Calculates a person's age from a DOB string.
 *
 * Supported formats:
 *   DD/MM/YYYY  — standard Indian format
 *   DD-MM-YYYY  — hyphenated Indian format
 *   YYYY-MM-DD  — ISO 8601 format
 *
 * @param dob - Date of birth string
 * @returns Age as a string, or empty string if DOB is invalid/unparseable
 */
export const getAgeFromDob = (dob: string): string => {
    if (!dob) return '';
    let birthDate: Date | null = null;

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
        const [day, month, year] = dob.split('/');
        birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        birthDate = new Date(dob);
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
        const [day, month, year] = dob.split('-');
        birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    if (!birthDate || isNaN(birthDate.getTime())) return '';

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age > 0 ? age.toString() : '';
};
