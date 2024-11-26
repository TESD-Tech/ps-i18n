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

## CLI Usage

You can run the tool using the following commands:

### Translation Process
To run the translation process, use:
```bash
npx ps-i18n translate
```
This command will start translating your MessageKeys into the specified languages.

### i18n Process
To run the i18n process, use:
```bash
npx ps-i18n <file_to_convert_to_MessageKeys> <locale>
```
- `<sourceFile>`: The path to the source file to be processed.
- `<locale>`: The locale for which the file should be processed.

This command will execute the i18n process as defined in the `i18n-ize.js` script, using the specified source file and locale.

### create-keys
This command processes a source file to create or update corresponding message keys in a `.properties` file for the specified locale.

#### Usage

```bash
create-keys <sourceFile> <locale> [options]
```

#### Arguments

- `<sourceFile>`: Path to the source file to be processed.
- `<locale>`: Locale for which the file should be processed.

#### Options

- `-Y`: Skip the confirmation prompt and proceed with file changes.

#### Example

```bash
create-keys src/powerschool/test.html US_en -Y
```

This will process the `test.html` file for the `US_en` locale, creating backups and updating the necessary files without requiring user confirmation.

## Usage 
1. **Run the Translation Tool**: To start translating your MessageKeys, use the following command:
   ```bash
   node index.js
   ```
   This will process the files and translate them into the specified languages. 
2. **Package Translated Files**: After translation, package the files into a PowerSchool plugin zip archive using:
   ```bash
   npx ps-package
   ```
   Your translations are now neatly packaged and ready to go! 

## Configuration
- **Testing Mode**: Only translates one line per language to test.
- **Debug Mode**: Gives more detailed logs to help fix issues.

## Support
For help, please enter an issue here: https://github.com/TESD-Tech/ps-i18n/issues
