# 🚀 CI/CD Pipeline Documentation

## Workflows Overview

### 1. 📦 Build and Release (`build-release.yml`)
**Triggered**: عند إنشاء Git tag (مثل `v1.0.0`)

**المراحل**:
1. **Lint & Type Check** - فحص ESLint و TypeScript
2. **Build Android APK** - بناء APK موقعة
3. **Create Release** - إنشاء GitHub Release مع الملفات

**الملفات المُنتجة**:
- `spy-game-v1.0.0.apk` - APK موقعة

---

### 2. 🔨 Manual Build (`manual-build.yml`)
**تشغيل يدوي** من GitHub Actions → Manual Build

**المزايا**:
- اختيار نوع البناء (APK أو AAB)
- تحميل مباشر كـ Artifact
- معلومات مفصلة عن البناء
- 30 يوم احتفاظ بالملفات

**كيفية الاستخدام**:
```
1. اذهب إلى: GitHub Actions
2. اختر: "🔨 Manual Build & Upload Artifacts"
3. اضغط: "Run workflow"
4. اختر:
   - Build type: APK أو AAB
   - (اختياري) Custom artifact name
5. انتظر البناء
6. حمل الملفات من Artifacts
```

**الملفات المُنتجة**:
- `spy-game-[type]-[date].apk` أو `.aab`
- `BUILD_INFO.txt` - معلومات البناء

---

### 3. ✅ Test Build (`test-build.yml`)
**تشغيل تلقائي** على:
- أي push إلى `feature/*` أو `fix/*` branches
- أي PR نحو `master`

**المزايا**:
- فحص ESLint و TypeScript
- بناء debug APK
- لا يرفع artifacts (فقط اختبار)
- تقرير مفصل

---

## كيفية استخدام Workflows

### إنشاء Release جديد

```bash
# 1. تأكد أن كل شيء مرفوع
git push origin feature/improvements-and-fixes

# 2. قم بـ merge في master
git checkout master
git merge feature/improvements-and-fixes
git push origin master

# 3. أنشئ tag جديد
git tag v1.1.0
git push origin v1.1.0

# ← GitHub Actions سيبدأ build-release.yml تلقائياً
```

### Build يدوي سريع

```
1. GitHub Actions → Manual Build
2. اختر APK
3. Run workflow
4. انتظر ~15-20 دقيقة
5. حمل من Artifacts
```

---

## معلومات البناء

### App Version
- `app.json` فيه النسخة الحالية
- ارفع النسخة قبل عمل Release

### Build Configuration
- **SDK Target**: 34 (Android 14)
- **Min SDK**: 21 (Android 5.0)
- **Java Version**: 17 (Temurin)
- **Gradle**: Latest

### Minification
- ✅ R8 enabled
- ✅ ProGuard rules applied
- ✅ Resource shrinking enabled
- ✅ Debug info preserved

---

## Secrets المطلوبة

للـ Release الموقعة، أضف هذه Secrets إلى GitHub:

```
ANDROID_KEYSTORE_BASE64       - base64 encoded keystore
ANDROID_KEYSTORE_PASSWORD     - keystore password
ANDROID_KEY_ALIAS             - key alias name
ANDROID_KEY_PASSWORD          - key password
```

**بدون هذه Secrets**: سيتم بناء APK موقعة بـ default debug key

---

## Cache و Optimization

### Gradle Cache
- يتم حفظ تلقائياً
- تقليل وقت البناء من 25 إلى 15 دقيقة

### pnpm Cache
- يتم حفظ تلقائياً
- تقليل وقت التثبيت من 5 إلى 2 دقيقة

### Artifact Compression
- تم تفعيل compression level 6
- تقليل حجم upload من 50MB إلى 30MB

---

## Troubleshooting

### ❌ Build فشل مع Gradle Error
```
1. تحقق من Java version (17 مطلوب)
2. تأكد من Node modules محدثة: pnpm install
3. نظف Gradle cache: cd android && ./gradlew clean
```

### ❌ Artifact غير موجود
```
1. تحقق من build success
2. الملفات في: android/app/build/outputs/apk/release/
3. جرب manual download من logs
```

### ❌ Type check فشل
```
1. قد يكون تحذير فقط (يستمر البناء)
2. افحص الأخطاء: npx tsc --noEmit
3. أصلح و push جديد
```

---

## عرض Logs

```
GitHub → Actions → [Workflow Name] → Build job → logs tab
```

---

## Tips للأداء الأفضل

1. **استخدم feature branches** لـ PRs
2. **tag جديد لكل release** (semantic versioning)
3. **راقب Gradle cache** في الـ second run (أسرع)
4. **اختر AAB للـ Play Store** (أصغر حجم)
5. **استخدم APK للـ testing** (أسرع بناء)

---

**آخر تحديث**: $(date '+%Y-%m-%d')
