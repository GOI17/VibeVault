module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '^@/domain/(.+)': './src/domain/\\1',
            '^@/repositories/(.+)': './src/repositories/\\1',
            '^@/providers/(.+)': './src/providers/\\1',
            '^@/(.+)': './\\1',
          },
        },
      ],
    ],
  };
};
