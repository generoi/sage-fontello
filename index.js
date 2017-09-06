/* eslint-disable no-console */
'use strict'; // eslint-disable-line

const fs = require('fs');
const readline = require('readline');
const path = require('path');
const os = require('os');
const open = require('open');
const unzip = require('unzip');
const needle = require('needle');
const hash = require('object-hash');

class Fontello {
  constructor(options = {}) {
    this.config(Object.assign({
      host: 'http://fontello.com',
    }, options));
  }

  config(options) {
    this.options = Object.assign(this.options || {}, options);
  }

  build() {
    this.fetchFonts(this.writeFile.bind(this));
  }

  open(config = null) {
    if (config) {
      this.options({config: config});
    }

    return this.getSessionUrl((sessionUrl) => {
      console.info('opening url: %s', sessionUrl);
      open(sessionUrl);
    });
  }

  getCharCodes(callback) {
    const charCodes = {};
    const codesCssPath = path.join(this.options.output, 'fontawesome-codes.css');
    const lineReader = readline.createInterface({
      input: fs.createReadStream(codesCssPath),
    });

    lineReader.on('line', (line) => {
      const vars = line.match(/^\.fa-([^:]+):before { content: '([^']+)'; }/);
      if (vars) {
        const cssClass = vars[1];
        const charCode = vars[2];
        charCodes[`fa-var-${cssClass}`] = charCode;
      }
    });

    lineReader.on('close', () => {
      callback(charCodes);
    });
  }

  writeFile() {
    this.getCharCodes((charCodes) => {
      charCodes['fontello-build-version'] = hash(charCodes).substring(0, 10);
      const scss = this.getSCSS(charCodes);
      fs.writeFileSync(this.options.scss, scss + os.EOL);
      console.info('generated scss file with font variables in %s', this.options.scss);
    });
  }

  fetchFonts(callback) {
    this.getSessionUrl((sessionUrl) => {
      const zipFile = needle.get(`${sessionUrl}/get`, function(error) {
        if (error) throw error;
      });

      return zipFile.pipe(unzip.Parse())
        .on('entry', (entry) => {
          let _ref, dirName, fileName, fontPath;
          let pathName = entry.path;

          if (entry.type === 'File') {
            dirName = (_ref = path.dirname(pathName).match(/\/([^\/]*)$/)) != null ? _ref[1] : void 0;
            fileName = path.basename(pathName);
            switch (dirName) {
              case 'css':
              case 'font':
                fontPath = path.join(this.options.output, fileName);
                return entry.pipe(fs.createWriteStream(fontPath));
              default:
                return entry.autodrain();
            }
          }
        })
        .on('finish', () => {
          console.info('extracted fontello archive in %s', this.options.output);
          callback();
        });
    });
  }

  getSessionUrl(callback) {
    const data = {
      config: {
        file: this.options.config,
        content_type: 'application/json',
      },
    };
    return needle('post', this.options.host, data, { multipart: true })
      .then((response) => {
        if (response.statusCode !== 200) {
          throw new Error();
        }
        callback(`${this.options.host}/${response.body}`);
      })
      .catch((error) => {
        throw error;
      });
  }

  getSCSS(charCodes) {
    const output = Object.keys(charCodes).map((className) => {
      const charCode = charCodes[className];
      return `$${className}: "${charCode}";`;
    });
    return output.join('\n');
  }

}

exports = module.exports = new Fontello();
