const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Expo web inside Docker can exceed Node's default heap when Metro spawns
// many transform workers. Keep concurrency bounded for stable dev startup.
config.maxWorkers = 2;

module.exports = config;
