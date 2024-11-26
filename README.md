# TE Tech - i18n

## Introduction
TE Tech - i18n is an open-source tool for translating PowerSchool MessageKeys into multiple languages using Google Translate. It automates the translation process to support multilingual environments in K-12 educational settings.

## Key Features
- **Translate into Multiple Languages**: Automatically translates MessageKeys into various languages using Google Translate.
- **Track Progress**: Shows you how the translation is going in real-time.
- **Custom Settings**: You can change how the tool works, like testing translations.
- **Easy Packaging**: Use the `ps-package` tool to package the translated files into a PowerSchool plugin zip archive.

## How It Works
1. **Translation**: The tool reads your MessageKeys and translates them into the languages you choose using Google Translate.
2. **Packaging**: After translating, use the `ps-package` tool to package the files.
3. **Configuration**: You can change settings in the `translation.config.js` file to test translations.

## Installation
1. **System Requirements**: Ensure you have Node.js installed. This tool requires Node.js version 14 or higher.
2. **Install Node.js**: If you haven't already, download and install Node.js from the [official website](https://nodejs.org/).
3. **Clone the Repository**: Use Git to clone the project repository:
   ```bash
   git clone https://github.com/TESD-Tech/ps-i18n.git
   ```
4. **Navigate to the Project Directory**: 
   ```bash
   cd TE-Tech-i18n
   ```
5. **Install Dependencies**: Run the following command to install necessary packages:
   ```bash
   npm install
   ```

## Getting Started
1. **Run the Tool**: Start the translation process by running:
   ```
   node index.js
   ```
   This will translate your files.
2. **Package Translated Files**: Use the following command to package the translated files:
   ```
   npx ps-package
   ```

## Usage 🚀
1. **Run the Translation Tool**: To start translating your MessageKeys, use the following command:
   ```bash
   node index.js
   ```
   This will process the files and translate them into the specified languages. 🌐

2. **Package Translated Files**: After translation, package the files into a PowerSchool plugin zip archive using:
   ```bash
   npx ps-package
   ```
   Your translations are now neatly packaged and ready to go! 📦

## Configuration
- **Testing Mode**: Only translates one line per language to test.
- **Debug Mode**: Gives more detailed logs to help fix issues.

## Support
For help, contact Benjamin Kemp at kempb@tesd.net or check the tool's documentation.
