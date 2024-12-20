import path from 'path';

// ISO language codes and their English names
export const iso_locales = {
  'af': 'Afrikaans',
  'sq': 'Albanian',
  'am': 'Amharic',
  'ar': 'Arabic',
  'hy': 'Armenian',
  'az': 'Azerbaijani',
  'eu': 'Basque',
  'be': 'Belarusian',
  'bn': 'Bengali',
  'bs': 'Bosnian',
  'bg': 'Bulgarian',
  'ca': 'Catalan',
  'ceb': 'Cebuano',
  'ny': 'Chichewa',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  'co': 'Corsican',
  'hr': 'Croatian',
  'cs': 'Czech',
  'da': 'Danish',
  'nl': 'Dutch',
  'en': 'English',
  'eo': 'Esperanto',
  'et': 'Estonian',
  'tl': 'Filipino',
  'fi': 'Finnish',
  'fr': 'French',
  'fy': 'Frisian',
  'gl': 'Galician',
  'ka': 'Georgian',
  'de': 'German',
  'el': 'Greek',
  'gu': 'Gujarati',
  'ht': 'Haitian Creole',
  'ha': 'Hausa',
  'haw': 'Hawaiian',
  'iw': 'Hebrew',
  'hi': 'Hindi',
  'hmn': 'Hmong',
  'hu': 'Hungarian',
  'is': 'Icelandic',
  'ig': 'Igbo',
  'id': 'Indonesian',
  'ga': 'Irish',
  'it': 'Italian',
  'ja': 'Japanese',
  'jw': 'Javanese',
  'kn': 'Kannada',
  'kk': 'Kazakh',
  'km': 'Khmer',
  'ko': 'Korean',
  'ku': 'Kurdish (Kurmanji)',
  'ky': 'Kyrgyz',
  'lo': 'Lao',
  'la': 'Latin',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'lb': 'Luxembourgish',
  'mk': 'Macedonian',
  'mg': 'Malagasy',
  'ms': 'Malay',
  'ml': 'Malayalam',
  'mt': 'Maltese',
  'mi': 'Maori',
  'mr': 'Marathi',
  'mn': 'Mongolian',
  'my': 'Myanmar (Burmese)',
  'ne': 'Nepali',
  'no': 'Norwegian',
  'ps': 'Pashto',
  'fa': 'Persian',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'pa': 'Punjabi',
  'ro': 'Romanian',
  'ru': 'Russian',
  'sm': 'Samoan',
  'gd': 'Scots Gaelic',
  'sr': 'Serbian',
  'st': 'Sesotho',
  'sn': 'Shona',
  'sd': 'Sindhi',
  'si': 'Sinhala',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'so': 'Somali',
  'es': 'Spanish',
  'su': 'Sundanese',
  'sw': 'Swahili',
  'sv': 'Swedish',
  'tg': 'Tajik',
  'ta': 'Tamil',
  'te': 'Telugu',
  'th': 'Thai',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'ur': 'Urdu',
  'uz': 'Uzbek',
  'vi': 'Vietnamese',
  'cy': 'Welsh',
  'xh': 'Xhosa',
  'yi': 'Yiddish',
  'yo': 'Yoruba',
  'zu': 'Zulu'
};

export const states = [
  {
    name: 'Alabama',
    abbreviation: 'AL',
    disabled: true,
  },
  {
    name: 'Alaska',
    abbreviation: 'AK',
    disabled: true,
  },
  {
    name: 'American Samoa',
    abbreviation: 'AS',
    disabled: true,
  },
  {
    name: 'Arizona',
    abbreviation: 'AZ',
    disabled: true,
  },
  {
    name: 'Arkansas',
    abbreviation: 'AR',
    disabled: true,
  },
  {
    name: 'California',
    abbreviation: 'CA',
    disabled: true,
  },
  {
    name: 'Colorado',
    abbreviation: 'CO',
    disabled: true,
  },
  {
    name: 'Connecticut',
    abbreviation: 'CT',
    disabled: true,
  },
  {
    name: 'Delaware',
    abbreviation: 'DE',
    disabled: true,
  },
  {
    name: 'District Of Columbia',
    abbreviation: 'DC',
    disabled: true,
  },
  {
    name: 'Federated States Of Micronesia',
    abbreviation: 'FM',
    disabled: true,
  },
  {
    name: 'Florida',
    abbreviation: 'FL',
    disabled: true,
  },
  {
    name: 'Georgia',
    abbreviation: 'GA',
    disabled: true,
  },
  {
    name: 'Guam',
    abbreviation: 'GU',
    disabled: true,
  },
  {
    name: 'Hawaii',
    abbreviation: 'HI',
    disabled: true,
  },
  {
    name: 'Idaho',
    abbreviation: 'ID',
    disabled: true,
  },
  {
    name: 'Illinois',
    abbreviation: 'IL',
    disabled: true,
  },
  {
    name: 'Indiana',
    abbreviation: 'IN',
    disabled: true,
  },
  {
    name: 'Iowa',
    abbreviation: 'IA',
    disabled: true,
  },
  {
    name: 'Kansas',
    abbreviation: 'KS',
    disabled: true,
  },
  {
    name: 'Kentucky',
    abbreviation: 'KY',
    disabled: true,
  },
  {
    name: 'Louisiana',
    abbreviation: 'LA',
    disabled: true,
  },
  {
    name: 'Maine',
    abbreviation: 'ME',
    disabled: true,
  },
  {
    name: 'Marshall Islands',
    abbreviation: 'MH',
    disabled: true,
  },
  {
    name: 'Maryland',
    abbreviation: 'MD',
    disabled: true,
  },
  {
    name: 'Massachusetts',
    abbreviation: 'MA',
    disabled: true,
  },
  {
    name: 'Michigan',
    abbreviation: 'MI',
    disabled: true,
  },
  {
    name: 'Minnesota',
    abbreviation: 'MN',
    disabled: true,
  },
  {
    name: 'Mississippi',
    abbreviation: 'MS',
    disabled: true,
  },
  {
    name: 'Missouri',
    abbreviation: 'MO',
    disabled: true,
  },
  {
    name: 'Montana',
    abbreviation: 'MT',
    disabled: true,
  },
  {
    name: 'Nebraska',
    abbreviation: 'NE',
    disabled: true,
  },
  {
    name: 'Nevada',
    abbreviation: 'NV',
    disabled: true,
  },
  {
    name: 'New Hampshire',
    abbreviation: 'NH',
    disabled: true,
  },
  {
    name: 'New Jersey',
    abbreviation: 'NJ',
    disabled: true,
  },
  {
    name: 'New Mexico',
    abbreviation: 'NM',
    disabled: true,
  },
  {
    name: 'New York',
    abbreviation: 'NY',
    disabled: true,
  },
  {
    name: 'North Carolina',
    abbreviation: 'NC',
    disabled: true,
  },
  {
    name: 'North Dakota',
    abbreviation: 'ND',
    disabled: true,
  },
  {
    name: 'Northern Mariana Islands',
    abbreviation: 'MP',
    disabled: true,
  },
  {
    name: 'Ohio',
    abbreviation: 'OH',
    disabled: true,
  },
  {
    name: 'Oklahoma',
    abbreviation: 'OK',
    disabled: true,
  },
  {
    name: 'Oregon',
    abbreviation: 'OR',
    disabled: true,
  },
  {
    name: 'Palau',
    abbreviation: 'PW',
    disabled: true,
  },
  {
    name: 'Pennsylvania',
    abbreviation: 'PA',
    disabled: false,
  },
  {
    name: 'Puerto Rico',
    abbreviation: 'PR',
    disabled: true,
  },
  {
    name: 'Rhode Island',
    abbreviation: 'RI',
    disabled: true,
  },
  {
    name: 'South Carolina',
    abbreviation: 'SC',
    disabled: true,
  },
  {
    name: 'South Dakota',
    abbreviation: 'SD',
    disabled: true,
  },
  {
    name: 'Tennessee',
    abbreviation: 'TN',
    disabled: true,
  },
  {
    name: 'Texas',
    abbreviation: 'TX',
    disabled: true,
  },
  {
    name: 'Utah',
    abbreviation: 'UT',
    disabled: true,
  },
  {
    name: 'Vermont',
    abbreviation: 'VT',
    disabled: true,
  },
  {
    name: 'Virgin Islands',
    abbreviation: 'VI',
    disabled: true,
  },
  {
    name: 'Virginia',
    abbreviation: 'VA',
    disabled: true,
  },
  {
    name: 'Washington',
    abbreviation: 'WA',
    disabled: true,
  },
  {
    name: 'West Virginia',
    abbreviation: 'WV',
    disabled: true,
  },
  {
    name: 'Wisconsin',
    abbreviation: 'WI',
    disabled: true,
  },
  {
    name: 'Wyoming',
    abbreviation: 'WY',
    disabled: true,
  },
]

export const grades = [
  {
    value: '0',
    display: 'KG',
    disabled: false,
  },
  {
    value: '1',
    display: '1',
    disabled: false,
  },
  {
    value: '2',
    display: '2',
    disabled: false,
  },
  {
    value: '3',
    display: '3',
    disabled: false,
  },
  {
    value: '4',
    display: '4',
    disabled: false,
  },
  {
    value: '5',
    display: '5',
    disabled: false,
  },
  {
    value: '6',
    display: '6',
    disabled: false,
  },
  {
    value: '7',
    display: '7',
    disabled: false,
  },
  {
    value: '8',
    display: '8',
    disabled: false,
  },
  {
    value: '9',
    display: '9',
    disabled: false,
  },
  {
    value: '10',
    display: '10',
    disabled: false,
  },
  {
    value: '11',
    display: '11',
    disabled: false,
  },
  {
    value: '12',
    display: '12',
    disabled: false,
  },
]

export default { states, grades, iso_locales }
