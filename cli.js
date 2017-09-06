#!/usr/bin/env node
'use strict';

const lib = require('.');
const program = require('commander');

program
  .version('0.1.0')

program
  .command('build')
  .description('Build SCSS file')
  .option('-c, --config <path>', 'Path to fontello export file')
  .option('-o, --output <path>', 'Path where fontello resources exist')
  .option('-s, --scss <path>', 'Location of scaffolded SCSS file')
  .action((options) => {
    lib.config({
      config: options.config,
      output: options.output,
      scss: options.scss,
    });
    lib.build();
  });

program
  .command('edit')
  .alias('open')
  .description('Edit the fontello icon set in the browser')
  .option('-c, --config <path>', 'Path to fontello export file')
  .action((options) => {
    return lib.open(options.config);
  });

program.parse(process.argv);
