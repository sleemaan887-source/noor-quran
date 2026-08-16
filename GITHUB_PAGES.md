# تشغيل نور القرآن على GitHub Pages

## 1) إنشاء المستودع
أنشئ Repository عام باسم:
`noor-quran`

## 2) رفع المشروع
ارفع محتويات هذا المشروع إلى الفرع:
`main`

يجب أن يكون `package.json` و`src` و`public` في جذر المستودع.

## 3) تفعيل Pages
افتح:
Settings → Pages → Build and deployment

واختر:
`GitHub Actions`

## 4) النشر
بعد Push إلى `main` ستعمل GitHub Actions تلقائيًا.
الرابط المتوقع:
`https://YOUR-USERNAME.github.io/noor-quran/`

## 5) Offline
بعد فتح الموقع مرة واحدة، يعمل Service Worker على تخزين ملفات التطبيق.
وللاستخدام الكامل للقرآن دون إنترنت، افتح الإعدادات واضغط:
`حفظ القرآن للاستخدام دون إنترنت`
ثم انتظر حتى تصل الحالة إلى `114/114`.

## ملاحظة
إذا غيّرت اسم المستودع، غيّر قيمة `'/noor-quran/'` في `vite.config.ts` إلى اسم المستودع الجديد.
