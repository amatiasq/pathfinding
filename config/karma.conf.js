const webpackConfig = require('./webpack.config');
const IS_CI = Boolean(process.env.TRAVIS);
const WATCH = !IS_CI && Boolean(process.env.WATCH);


const baseConfig = {
  basePath: '',
  frameworks: ['mocha', 'chai', 'sinon'],
  files: ['../src/**/*.spec.ts'],

  preprocessors: {
    '../src/**/*.ts': ['webpack']
  },

  webpack: {
    module: webpackConfig.module,
    resolve: webpackConfig.resolve
  },

  mime: {
    'text/x-typescript': ['ts','tsx']
  },

  /*
  client: {
    mocha: {
      timeout: 20000,
      reporter: 'html',
      ui: 'bdd'
    }
  },
  */

  // reporters: ['progress'],
  reporters: ['mocha'],
  colors: true,
  autoWatch: true,
  singleRun: false,
  concurrency: Infinity,
};


const localConfig = {
  browsers: ['Chrome'],
};

const ciConfig = {
  browsers: ['Chrome_travis_ci'],

  customLaunchers: {
    Chrome_travis_ci: {
      base: 'Chrome',
      flags: ['--no-sandbox']
    }
  },
};


const watchConfig = {
  autoWatch: true,
  singleRun: false,
};

const singleRunConfig = {
  autoWatch: false,
  singleRun: true,
};


module.exports = function (config) {
  config.set(Object.assign(
    { logLevel: config.LOG_INFO },
    baseConfig,
    IS_CI ? ciConfig : localConfig,
    WATCH ? watchConfig : singleRunConfig
  ));
}
