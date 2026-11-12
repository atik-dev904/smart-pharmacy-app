SMART PHARMACY প্রাথমিক Web Starter

ফাইল আপলোড: index.html, css/style.css, js/firebase.js, js/app.js — সবগুলো GitHub repository-র একই কাঠামোয় রাখবেন।

এই সংস্করণে আছে:
- মালিকের ইমেইল/পাসওয়ার্ড দিয়ে দোকান নিবন্ধন
- লগইন ও লগআউট
- Firebase Password Reset Email
- Firestore-এ প্রাথমিক দোকান ও মালিকের রেকর্ড

এখনো তৈরি হয়নি: কর্মচারী অ্যাকাউন্ট, Developer Panel, Support Center, বিক্রি, স্টক, রিপোর্ট, পূর্ণ bilingual UI, production Security Rules।

সতর্কতা:
- Firestore Security Rules সঠিকভাবে তৈরি না করে বাস্তব দোকানের তথ্য ব্যবহার করবেন না।
- কর্মচারী অ্যাকাউন্ট নিরাপদে তৈরি/বন্ধ করতে trusted backend বা Cloud Functions প্রয়োজন।
- Firebase Admin private key বা service account JSON কখনো ওয়েব ফাইলে রাখবেন না।
- GitHub Pages-এ চালানোর জন্য সব ফাইল commit করুন; index.html root-এ থাকতে হবে।
