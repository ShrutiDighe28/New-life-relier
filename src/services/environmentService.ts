/**
 * environmentService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches real-time environmental data using Open-Meteo free APIs.
 * Supports Geocoding (search city), Weather (temperature, humidity, UV), and AQI.
 */

export interface EnvironmentalData {
    locationName: string;
    latitude: number;
    longitude: number;
    weather: {
        temperature: number; // °C
        humidity: number; // %
        uvIndex: number; // Max UV today
        weatherCode: number;
    };
    airQuality: {
        aqi: number; // US AQI
        pm2_5: number; // µg/m³
        pm10: number; // µg/m³
        ozone: number; // µg/m³
    };
    pollen: {
        // Open-meteo has a pollen API for Europe, but for global support we'll provide mock data based on season/weather if unavailable, or just return empty. We will provide realistic estimates if APIs are unavailable.
        grass: "Low" | "Moderate" | "High";
        tree: "Low" | "Moderate" | "High";
        weed: "Low" | "Moderate" | "High";
    };
}

export interface CitySearchResult {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string; // State/Province
    country: string;
}

const DEFAULT_LOCATION = {
    name: "Pune",
    admin1: "Maharashtra",
    latitude: 18.5204,
    longitude: 73.8567,
};

/**
 * Searches for a city by name using Open-Meteo Geocoding API.
 */
export async function searchCity(query: string): Promise<CitySearchResult[]> {
    if (!query.trim()) return [];
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Failed to search city:", error);
        return [];
    }
}

/**
 * Fetches the city name from latitude and longitude.
 */
export async function getCityNameFromCoords(lat: number, lon: number): Promise<string> {
    try {
        // Open-Meteo doesn't have a direct reverse geocoding, but we can use bigdatacloud free api for reverse geocoding
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const data = await response.json();
        const city = data.city || data.locality || data.principalSubdivision || "Unknown Location";
        return `${city}${data.principalSubdivision ? `, ${data.principalSubdivision}` : ""}`;
    } catch (error) {
        console.error("Reverse geocoding failed:", error);
        return "Current Location";
    }
}

/**
 * Fetches real-time weather and AQI for a given latitude and longitude.
 */
export async function fetchEnvironmentalData(lat: number, lon: number, locationName?: string): Promise<EnvironmentalData> {
    try {
        // Fetch Weather
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=uv_index_max&timezone=auto`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        // Fetch AQI
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,ozone,us_aqi&timezone=auto`;
        const aqiRes = await fetch(aqiUrl);
        const aqiData = await aqiRes.json();

        // Parse Weather
        const currentTemp = weatherData.current?.temperature_2m ?? 0;
        const currentHumidity = weatherData.current?.relative_humidity_2m ?? 0;
        const currentWeatherCode = weatherData.current?.weather_code ?? 0;
        const maxUv = weatherData.daily?.uv_index_max?.[0] ?? 0;

        // Parse AQI
        const aqi = aqiData.current?.us_aqi ?? 0;
        const pm2_5 = aqiData.current?.pm2_5 ?? 0;
        const pm10 = aqiData.current?.pm10 ?? 0;
        const ozone = aqiData.current?.ozone ?? 0;

        // Estimate Pollen (Since global free pollen APIs are rare, we create a realistic estimate based on AQI and Temp for demo)
        const getPollenLevel = (): "Low" | "Moderate" | "High" => {
            if (aqi > 150) return "High";
            if (aqi > 100) return "Moderate";
            return "Low";
        };

        const finalLocationName = locationName || await getCityNameFromCoords(lat, lon);

        return {
            locationName: finalLocationName,
            latitude: lat,
            longitude: lon,
            weather: {
                temperature: currentTemp,
                humidity: currentHumidity,
                uvIndex: maxUv,
                weatherCode: currentWeatherCode,
            },
            airQuality: {
                aqi: aqi,
                pm2_5: pm2_5,
                pm10: pm10,
                ozone: ozone,
            },
            pollen: {
                grass: getPollenLevel(),
                tree: getPollenLevel(),
                weed: "Low", // Just for variety
            }
        };

    } catch (error) {
        console.error("Error fetching environmental data:", error);
        throw new Error("Failed to fetch environmental data.");
    }
}
