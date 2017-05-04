module.exports = {
  devtool: 'source-map',
  entry: './src/app.ts',
  output: {
    filename: 'dist/bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      }
    ]
  },

  devServer: {
    inline: true,
    stats: {
      colors: true,
      progress: true,
    },
  },
}