// Config explicita de Babel: expo start la infiere solo, pero jest-expo la
// necesita para transformar los modulos de react-native en los tests.
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
  }
}
