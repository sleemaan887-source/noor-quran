import { Accessibility, Eye, Type, Keyboard, Zap, ZoomIn } from 'lucide-react';
import { PageHeader, Card } from '@/core/widgets/ui';
import { useTheme } from '@/core/theme/ThemeContext';

export function AccessibilityPage() {
  const { quranFontSize, setQuranFontSize } = useTheme();

  return (
    <div className="animate-fade-in">
      <PageHeader title="الإتاحة" subtitle="خيارات الوصول وسهولة الاستخدام" icon={<Accessibility className="h-6 w-6" />} />

      <Card className="mb-4">
        <div className="flex items-center gap-2 text-primary-600 dark:text-sand-100">
          <Type className="h-5 w-5" />
          <h2 className="font-display text-lg font-bold">حجم النص</h2>
        </div>
        <p className="mt-2 text-sm text-primary-500 dark:text-sand-200">تحكّم في حجم خط القرآن عبر التطبيق</p>
        <div className="mt-3 flex items-center gap-3">
          <button onClick={() => setQuranFontSize(20)} className="rounded-lg bg-sand-100 px-3 py-2 text-xs text-primary-600 dark:bg-white/5 dark:text-sand-200">صغير</button>
          <button onClick={() => setQuranFontSize(28)} className="rounded-lg bg-sand-100 px-3 py-2 text-sm text-primary-600 dark:bg-white/5 dark:text-sand-200">متوسط</button>
          <button onClick={() => setQuranFontSize(38)} className="rounded-lg bg-sand-100 px-3 py-2 text-base text-primary-600 dark:bg-white/5 dark:text-sand-200">كبير</button>
          <button onClick={() => setQuranFontSize(44)} className="rounded-lg bg-sand-100 px-3 py-2 text-lg text-primary-600 dark:bg-white/5 dark:text-sand-200">ضخم</button>
        </div>
        <div className="mt-4 rounded-xl bg-sand-50 p-4 text-center dark:bg-white/5">
          <span className="font-quran text-primary-700 dark:text-sand-100" style={{ fontSize: `${quranFontSize}px` }}>
            نَصٌّ تَجْرِيبِيٌّ لِلْقُرْآنِ الْكَرِيمِ
          </span>
        </div>
      </Card>

      <Card className="mb-4">
        <div className="flex items-center gap-2 text-primary-600 dark:text-sand-100">
          <Eye className="h-5 w-5" />
          <h2 className="font-display text-lg font-bold">التباين والألوان</h2>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-primary-500 dark:text-sand-200">
          <li>• يدعم التطبيق الوضع الداكن لتقليل إجهاد العين.</li>
          <li>• ألوان التطبيق مختارة بنسب تباين كافية للقراءة المريحة.</li>
          <li>• يمكنك تفعيل الوضع الداكن من الإعدادات أو تلقائيًا حسب النظام.</li>
        </ul>
      </Card>

      <Card className="mb-4">
        <div className="flex items-center gap-2 text-primary-600 dark:text-sand-100">
          <Keyboard className="h-5 w-5" />
          <h2 className="font-display text-lg font-bold">تنقّل لوحة المفاتيح</h2>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-primary-500 dark:text-sand-200">
          <li>• يمكن التنقّل بين العناصر بمفتاح Tab.</li>
          <li>• تظهر مؤشرات تركيز واضحة على العناصر القابلة للنقر.</li>
          <li>• جميع الأزرار لها مساحة لمس مناسبة (44px فأكثر).</li>
        </ul>
      </Card>

      <Card className="mb-4">
        <div className="flex items-center gap-2 text-primary-600 dark:text-sand-100">
          <Zap className="h-5 w-5" />
          <h2 className="font-display text-lg font-bold">قلة الحركة</h2>
        </div>
        <p className="mt-2 text-sm text-primary-500 dark:text-sand-200">
          الحركات في التطبيق لطيفة وقصيرة. إذا فعّلت قلة الحركة في نظامك، تحترمها معظم الانتقالات.
        </p>
      </Card>

      <Card>
        <div className="flex items-center gap-2 text-primary-600 dark:text-sand-100">
          <ZoomIn className="h-5 w-5" />
          <h2 className="font-display text-lg font-bold">قارئ الشاشة</h2>
        </div>
        <p className="mt-2 text-sm text-primary-500 dark:text-sand-200">
          العناصر المهمة تحمل وصفًا صوتيًا (aria-label) ليعمل قارئ الشاشة بكفاءة. استخدم النظام لمزيد من التفاصيل الصوتية.
        </p>
      </Card>
    </div>
  );
}
