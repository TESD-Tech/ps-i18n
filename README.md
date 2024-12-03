# 🌐 PS-i18n: PowerSchool Internationalization Toolkit

## 🚀 Overview

PS-i18n is a powerful, open-source internationalization (i18n) toolkit designed specifically for PowerSchool administrators and developers. This tool automates the translation of MessageKeys into multiple languages, streamlining the process of creating multilingual educational software.

## ✨ Key Features

### 🔄 Automated Translation
- Seamless translation of PowerSchool MessageKeys using Google Translate
- Support for multiple language targets
- Intelligent message key extraction and consolidation

### 📊 Progress Tracking
- Real-time translation progress visualization
- Detailed console output with color-coded status indicators
- Comprehensive progress table showing translation status for each file

### 🛠 Flexible Configuration
- Customizable translation settings
- Testing mode for validation
- Easy language configuration via `languages.json`

### 🔒 Robust Error Handling
- Graceful error management
- Backup mechanisms for source files
- Detailed logging and debugging options

## 🏗 Architecture

### Core Components
- `index.js`: CLI entry point and command management
- `src/translator.js`: Core translation logic
- `src/i18n-ize.js`: Message key extraction and processing
- `src/utils/`: Utility modules for progress tracking, messaging, and table rendering

### Translation Workflow
1. **Message Key Extraction**: Identifies and processes message keys from source files
2. **Language Detection**: Reads target languages from `languages.json`
3. **Translation**: Utilizes Google Translate API for accurate translations
4. **File Generation**: Creates translated `.properties` files
5. **Progress Tracking**: Provides real-time translation status updates

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Git

## 🚀 Quick Start

### Installation
```bash
# Clone the repository
git clone https://github.com/TESD-Tech/ps-i18n.git

# Navigate to project directory
cd ps-i18n

# Install dependencies
npm install
```

### Basic Usage

#### Translate MessageKeys
```bash
# Translate all files to configured languages
npx ps-i18n translate

# Translate to a specific language
npx ps-i18n translate --locale US_es
```

#### Create Message Keys
```bash
# Process a source file and generate message keys
npx ps-i18n create-keys src/path/to/file.html US_en

# Skip confirmation prompt
npx ps-i18n create-keys src/path/to/file.html US_en -Y
```

#### Package Translated Files
```bash
# Create a PowerSchool plugin zip archive
npx ps-package
```

## 📝 Message Key Syntax

### `[msg:*][/msg]` Syntax Guide

The `create-keys` function uses a special syntax to extract and generate message keys from source files. This syntax allows you to explicitly define translatable messages.

#### Basic Syntax
```html
[msg:unique_key]Your translatable message text[/msg]
```

#### Examples

1. **Simple Message Key**
   ```html
   <button>[msg:login_button]Log In[/msg]</button>
   ```
   - Key: `login_button`
   - Value: `Log In`

2. **Nested Elements**
   ```html
   <div>
     <h1>[msg:welcome_title]Welcome to PowerSchool[/msg]</h1>
     <p>[msg:welcome_description]Access your school information securely.[/msg]</p>
   </div>
   ```
   - Key 1: `welcome_title`
   - Value 1: `Welcome to PowerSchool`
   - Key 2: `welcome_description`
   - Value 2: `Access your school information securely.`

3. **Attributes with Message Keys**
   ```html
   <input 
     type="text" 
     placeholder="[msg:username_placeholder]Enter your username[/msg]"
   >
   ```
   - Key: `username_placeholder`
   - Value: `Enter your username`

#### Best Practices
- Use unique, descriptive keys
- Keep message text concise
- Avoid HTML tags within the message key
- Use snake_case for key names

#### Handling Duplicates
If duplicate keys are detected, the tool will prompt you to re-index or consolidate the keys.

## 🔧 Configuration

### `languages.json`
Define target languages for translation:
```json
[
  { "Language Code": "en", "Language": "English" },
  { "Language Code": "es", "Language": "Spanish" },
  { "Language Code": "hi", "Language": "Hindi" }
]
```

### `translation.config.js`
Customize translation behavior:
- Enable/disable testing mode
- Configure API settings
- Set debug options

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License

Copyright (c) 2023 TE Tech

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🙌 Acknowledgements

- PowerSchool for their innovative educational platform
- Google Translate API
- Open-source community

## 📞 Support

For issues, questions, or suggestions, please [open an issue](https://github.com/TESD-Tech/ps-i18n/issues) on GitHub.
