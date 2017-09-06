# sage-fontello

Heavily based on [fontello-cli](https://github.com/paulyoung/fontello-cli).

## Usage

Open/edit the fontello configuration file.

    sage-fontello --config resources/assets/fonts/fontello.json open

Fetch the font files and build the SCSS file.

    sage-fontello build \
      --config resources/assets/fonts/fontello.json \
      --output resources/assets/fonts/fontello \
      --scss resources/assets/fonts/fontello/fontello.scss
