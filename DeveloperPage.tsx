import { User, Code2, Heart, FileText, Shield, Moon, MessageCircle, Phone } from 'lucide-react';
import { PageHeader, Card, OrnamentalDivider } from '@/core/widgets/ui';

export function DeveloperPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="عن المطور" subtitle="معلومات عن التطبيق والمطور" icon={<User className="h-6 w-6" />} />

      {/* Developer card */}
      <Card className="mb-5 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-gold-500 shadow-glow">
          <Moon className="h-10 w-10" />
        </div>
        <h2 className="font-display text-xl font-bold text-primary-600 dark:text-sand-100">محمد نايف فرحان</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-primary-500 dark:text-sand-200">
          مبرمج ومهتم بتطوير التطبيقات والأنظمة الرقمية، أسعى من خلال هذا العمل إلى توظيف التقنية في تقديم محتوى نافع وسهل الاستخدام.
        </p>
        <OrnamentalDivider />
        <p className="font-quran text-lg text-gold-600 dark:text-gold-400">رسالة التطبيق</p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-primary-500 dark:text-sand-200">
          هذا التطبيق محاولة متواضعة لجمع القرآن والذكر والتعلم في مكان واحد.
        </p>
      </Card>

      {/* App info */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 text-primary-600 dark:text-sand-100">
          <Code2 className="h-5 w-5" />
          <h2 className="font-display text-lg font-bold">معلومات التطبيق</h2>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <InfoRow label="الاسم" value="نور القرآن" />
          <InfoRow label="الإصدار" value="1.0.0" />
          <InfoRow label="رقم البنية" value="1" />
          <InfoRow label="الشعار" value="اقرأ • تعلّم • اذكر • تدبّر" />
        </div>
      </Card>

      {/* Licenses */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 text-primary-600 dark:text-sand-100">
          <FileText className="h-5 w-5" />
          <h2 className="font-display text-lg font-bold">التراخيص والمصادر</h2>
        </div>
        <div className="mt-3 space-y-2 text-sm text-primary-500 dark:text-sand-200">
          <p>• نص القرآن الكريم (الرسم العثماني): Al-Quran Cloud (alquran.cloud)</p>
          <p>• التلاوات الصوتية: islamic.network</p>
          <p>• حسابات مواقيت الصلاة: خوارزمية PrayTimes (مفتوحة المصدر)</p>
          <p>• الأذكار والأدعية: من مصادرها الأصلية المذكورة بجانب كل ذكر ودعاء</p>
        </div>
      </Card>

      {/* Privacy */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 text-primary-600 dark:text-sand-100">
          <Shield className="h-5 w-5" />
          <h2 className="font-display text-lg font-bold">سياسة الخصوصية</h2>
        </div>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-primary-500 dark:text-sand-200">
          <PrivacyItem title="البيانات المحلية">
            جميع بياناتك (تقدّم القراءة، العلامات، المفضلة، الملاحظات، خطط الحفظ، الإعدادات) تُحفظ محليًا على جهازك فقط ولا تُرسل إلى أي خادم.
          </PrivacyItem>
          <PrivacyItem title="الموقع">
            يُستخدم الموقع لحساب مواقيت الصلاة واتجاه القبلة فقط. لا يُشارك مع أي طرف خارجي.
          </PrivacyItem>
          <PrivacyItem title="الصوت">
            التسجيلات الصوتية للتسميع تُحفظ محليًا على جهازك فقط ولا تُرفع إلى أي خادم.
          </PrivacyItem>
          <PrivacyItem title="الإشعارات">
            تُستخدم فقط للتذكير بالقرآن والأذكار والصلاة وفق إعداداتك. لا تُرسل بيانات إشعار إلى أي خادم.
          </PrivacyItem>
          <PrivacyItem title="عدم بيع البيانات">
            لا نبيع بياناتك ولا نشاركها مع أي طرف ثالث لأي سبب.
          </PrivacyItem>
          <PrivacyItem title="القفل">
            رمز PIN (إن فعّلته) يُخزّن بصيغة مشفّرة (SHA-256) ولا يُحفظ كنص صريح.
          </PrivacyItem>
        </div>
      </Card>

      {/* Contact */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 text-primary-600 dark:text-sand-100">
          <MessageCircle className="h-5 w-5" />
          <h2 className="font-display text-lg font-bold">تواصل معنا</h2>
        </div>
        <div className="mt-4 flex flex-col items-center gap-3">
          <a
            href="https://wa.me/967773562476"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-4 text-white shadow-soft transition hover:bg-[#1ebe5d] active:scale-95"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="font-display text-lg font-bold">تواصل عبر واتساب</span>
          </a>
          <a
            href="https://wa.me/967773562476"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary-500 dark:text-sand-300"
          >
            <Phone className="h-4 w-4" />
            <span dir="ltr">+967 773 562 476</span>
          </a>
          <p className="mt-1 text-center text-xs text-primary-400 dark:text-sand-400">
            للاقتراحات والملاحظات والمشاكل التقنية، تواصل معنا عبر واتساب.
          </p>
        </div>
      </Card>

      <p className="mt-6 flex items-center justify-center gap-1 text-xs text-primary-400 dark:text-sand-400">
        صُنع بـ <Heart className="h-3 w-3 fill-red-500 text-red-500" /> لخدمة كتاب الله
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-sand-100 py-1.5 dark:border-white/5">
      <span className="text-primary-400 dark:text-sand-400">{label}</span>
      <span className="font-medium text-primary-600 dark:text-sand-100">{value}</span>
    </div>
  );
}

function PrivacyItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-sand-50 p-3 dark:bg-white/5">
      <p className="mb-1 font-semibold text-primary-600 dark:text-sand-100">{title}</p>
      <p className="text-xs text-primary-500 dark:text-sand-300">{children}</p>
    </div>
  );
}
