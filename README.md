# 🕵️ لعبة الجاسوس — Spy Game

<div align="center" dir="rtl">

![Expo](https://img.shields.io/badge/Expo_54-black?style=for-the-badge&logo=expo)
![React Native](https://img.shields.io/badge/RN_0.81.5-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TS_6.0-blue?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**لعبة حفلات جماعية بالعربية المصرية — اكتشف الجاسوس قبل ما يكتشف الكلمة!**

</div>

---

## عن اللعبة

لعبة الكشف عن الجاسوس — كل لاعب ياخد دور (بريء أو جاسوس).  
الأبرياء يعرفون الكلمة السرية، الجاسوس لأ.  
الأبرياء يكشفوه بالتصويت، والجاسوس يفوز لو عرف يخمن الكلمة.

**10 تصنيفات مصرية** — أماكن، أكلات شعبية، مواقف مستفزة، شخصيات مشهورة، كراكيب البيت، وأكتر.

---

## المميزات

- **3 سمات** — فاتح، داكن، نيون (مع حفظ الاختيار)
- **بحث ذكي** — إضافة اللاعبين باقتراحات تلقائية من قاعدة البيانات
- **فرصة للجاسوس** — لو نجا من التصويت، يخمن الكلمة قبل الفتح
- **نظام نقاط** — نقاط حسب الفريق وعدد المصوتين صح
- **سجل أبطال** — لوحة صدارة و تاريخ مباريات
- **أنميشن** — رسوم متحركة سبرنج في كل التفاعلات

---

## الشاشات

| شاشة | الوظيفة |
|------|---------|
| الريسية | 3 كروت: لعب جديد، سجل الأبطال، تاريخ المباريات + الإعدادات |
| إعداد المباراة | اختيار التصنيف + إضافة اللاعبين (AutoComplete) + بدء |
| كشف الأدوار | ضغط مطول لكل لاعب ليكشف دوره (جاسوس/بريء) + الكلمة |
| الأسئلة | مرحلة الأسئلة المفتوحة بين اللاعبين |
| التصويت | كل لاعب يصوت على المشتبه به أو يتخطى |
| تخمين الجاسوس | الجاسوس يختار الكلمة من 6 خيارات خلال 60 ثانية |
| النتيجة | إعلان الفائز + نقاط كل لاعب + حفظ في DB |
| سجل الأبطال | poduim (ذهبي/فضي/برونزي) + ترتيب اللاعبين |
| تاريخ المباريات | كروت قابلة للتوسيع بتفاصيل كل مباراة |
| الإعدادات | اختيار الثيم + مسح البيانات + الإصدار |

---

## التثبيت

```
# المتطلبات: Node 20+, pnpm 9+
git clone https://github.com/Yussefgafer/spy-game.git
cd spy-game
pnpm install
pnpm start                # expo start
pnpm android              # expo run:android
```

## الفحص

```
pnpm lint                 # ESLint
pnpm lint:fix             # + --fix
pnpm typecheck            # tsc --noEmit
```


---

## التقنيات

| التقنية | الاستخدام |
|---------|-----------|
| React Native 0.81.5 | الإطار الأساسي |
| Expo SDK 54 | المنصة |
| TypeScript 6.0 | الكتابة الآمنة |
| React Navigation 7 | التنقل (Native Stack) |
| expo-sqlite (sync) | قاعدة البيانات |
| expo-haptics | اللمسيات |
| lucide-react-native | الأيقونات |
| AsyncStorage | حفظ الثيم والتفضيلات |

---

## هيكل المشروع

```
src/
├── screens/        # 10 شاشات
├── components/     # BouncyButton, PopInView, SafePressable, ...
├── hooks/          # useBouncyPress, useAnimatedNumber
├── constants/      # words.ts (10 تصنيفات), animations.ts
├── context/        # ThemeContext (3 سمات)
├── database/       # SQLite (players, matches, match_details)
├── utils/          # haptics, shuffle, preferences
└── types/          # RootStackParamList
```

## إضافة تصنيف

`src/constants/words.ts`:

```ts
{
  id: 'your_category',
  name: 'اسم التصنيف',
  words: ['كلمة1', 'كلمة2', ...],
}
```