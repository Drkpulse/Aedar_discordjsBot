require('dotenv').config();

class EnvManager {
  constructor() {
    this.requiredVars = ['BOT_TOKEN'];
    this.optionalVars = [
      'OPENWEATHERMAP_API_KEY',
      'ACCUWEATHER_API_KEY',
      'GOOGLE_APPLICATION_CREDENTIALS',
      'GIPHY_API',
      'VIRUSTOTAL_API_KEY',
      'CLIENTID',
      'TESTING_GUILDID',
      'BOTFEEDBACK_CHANNELID',
      'REPORT_CHANNELID',
      'SUGGESTION_CHANNELID',
      'BIRTHDAY_CHANNELID',
      'WELCOME_CHANNELID',
      'ERROR_CHANNELID',
      'USER_INTERACTION_LIMIT'
    ];

    this.missingRequired = [];
    this.missingOptional = [];

    this.checkEnvironmentVariables();
  }

  checkEnvironmentVariables() {
    // Check required vars
    this.missingRequired = this.requiredVars.filter(varName => !process.env[varName]);

    // Check optional vars
    this.missingOptional = this.optionalVars.filter(varName => !process.env[varName]);
  }

  hasMissingRequired() {
    return this.missingRequired.length > 0;
  }

  isEnvVarSet(varName) {
    return !!process.env[varName] && process.env[varName] !== '';
  }

  getEnvVarOrDefault(varName, defaultValue = null) {
    return this.isEnvVarSet(varName) ? process.env[varName] : defaultValue;
  }

  displayStatus() {
    if (this.hasMissingRequired()) {
      console.error('\x1b[31m╭─────────────────────────────────────\x1b[37m');
      console.error('\x1b[31m│ ERROR: Missing required environment variables:\x1b[37m');
      this.missingRequired.forEach(varName => {
        console.error(`\x1b[31m│ - ${varName}\x1b[37m`);
      });
      console.error('\x1b[31m│ Bot cannot start without these variables\x1b[37m');
      console.error('\x1b[31m╰─────────────────────────────────────\x1b[37m');
      return false;
    }

    if (this.missingOptional.length > 0) {
      console.warn('\x1b[33m╭─────────────────────────────────────\x1b[37m');
      console.warn('\x1b[33m│ WARNING: Some optional environment variables are missing:\x1b[37m');
      this.missingOptional.forEach(varName => {
        console.warn(`\x1b[33m│ - ${varName}\x1b[37m`);
      });
      console.warn('\x1b[33m│ Some bot features may be limited or unavailable\x1b[37m');
      console.warn('\x1b[33m╰─────────────────────────────────────\x1b[37m');
    }

    return true;
  }
}

module.exports = new EnvManager();
