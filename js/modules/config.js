/**
 * TypifyPro 3.0 - Configuration Module
 * Centralized constants and settings
 */

export const CONFIG = {
    SURVEY_BASE_URL: "https://docs.google.com/forms/d/e/1FAIpQLScOnqtEkPZTISXN4o3vrsi_vjMF3GcPuBlb0dIqJOuZVmeklQ/viewform?usp=pp_url",
    SURVEY_PERSISTE_BASE_URL: "https://docs.google.com/forms/d/e/1FAIpQLScBARUWj5MxH9pp9ax1QWFa-2voO9cx75yEE0q3qq_ZiD593Q/viewform?usp=pp_url"
};

// Expose to window for legacy compatibility or direct access in modules
window.SURVEY_BASE_URL = CONFIG.SURVEY_BASE_URL;
window.SURVEY_PERSISTE_BASE_URL = CONFIG.SURVEY_PERSISTE_BASE_URL;
