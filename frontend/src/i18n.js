import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation strings
const resources = {
  en: {
    translation: {
      "nav": {
        "dashboard": "Dashboard",
        "appointments": "Appointments",
        "doctors": "Doctors",
        "reports": "Reports",
        "profile": "Profile",
        "logout": "Logout"
      },
      "common": {
        "welcome": "Welcome back",
        "search": "Search",
        "cancel": "Cancel",
        "confirm": "Confirm",
        "save": "Save",
        "loading": "Loading..."
      }
    }
  },
  si: {
    translation: {
      "nav": {
        "dashboard": "පුවරුව",
        "appointments": "හමුවීම්",
        "doctors": "වෛද්‍යවරු",
        "reports": "වාර්තා",
        "profile": "ගිණුම",
        "logout": "පිටවෙන්න"
      },
      "common": {
        "welcome": "නැවත සාදරයෙන් පිළිගනිමු",
        "search": "සොයන්න",
        "cancel": "අවලංගු කරන්න",
        "confirm": "තහවුරු කරන්න",
        "save": "සුරකින්න",
        "loading": "පූරණය වෙමින් පවතී..."
      }
    }
  },
  ta: {
    translation: {
      "nav": {
        "dashboard": "டாஷ்போர்டு",
        "appointments": "நியமனங்கள்",
        "doctors": "மருத்துவர்கள்",
        "reports": "அறிக்கைகள்",
        "profile": "சுயவிவரம்",
        "logout": "வெளியேறு"
      },
      "common": {
        "welcome": "மீண்டும் வருக",
        "search": "தேடு",
        "cancel": "ரத்துசெய்",
        "confirm": "உறுதிப்படுத்து",
        "save": "சேமி",
        "loading": "ஏற்றப்படுகிறது..."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
