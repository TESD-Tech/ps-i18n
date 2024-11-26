// Configuration object for translation settings
const config = {
    /**
     * Enable or disable testing mode. In testing mode, translations are limited to one line per language.
     * Useful for testing the translation process without processing entire files.
     */
    testingModeEnabled: false, 
    
    /**
     * Enable or disable debug mode. When enabled, additional debug information is logged to the console.
     * Useful for troubleshooting and understanding the translation process flow.
     */
    debugModeEnabled: false, 
    
    /**
     * Base delay in milliseconds between translation requests to mimic human-like interaction.
     * This helps in avoiding hitting rate limits on translation services.
     */
    requestDelayBase: 100, 
    
    /**
     * Variance in milliseconds added to the base delay for a more natural request timing.
     */
    requestDelayVariance: 50, 
    
    /**
     * Maximum number of concurrent translations allowed to optimize performance while avoiding overload.
     */
    maxConcurrentTranslations: 5, 
    
    /**
     * Default source locale for translations, can be configured as needed.
     */
    sourceLocale: 'US_en', 
    
};

export default config;
