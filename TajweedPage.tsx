import { useState } from 'react';
import { Type, ChevronLeft, ChevronRight, BookOpen, GraduationCap } from 'lucide-react';
import { PageHeader, Card, toArabicDigits, OrnamentalDivider } from '@/core/widgets/ui';

interface TajweedLesson {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  note: string; // verified-source note, no AI-generated quranic examples
}

const LESSONS: TajweedLesson[] = [
  {
    id: 'makharij',
    title: 'مخارج الحروف',
    summary: 'مواقع خروج الحروف العربية من الفم والحلق',
    explanation:
      'مخارج الحروف هي المواضع التي تخرج منها الحروف عند النطق بها. يقسّمها علماء التجويد إلى مخارج رئيسية: الجوف، الحلق، اللسان، الشفتان، والخيشوم. معرفة المخرج أساس لنطق الحروف نطقًا صحيحًا.',
    note: 'تعلّم المخارج يُكتسب بالتلقي والمشافهة من معلم مُجاز. هذا العرض تقديمي ولا يغني عن التلقي المباشر.',
  },
  {
    id: 'sifat',
    title: 'صفات الحروف',
    summary: 'الصفات اللازمة والعارضة التي تميّز كل حرف',
    explanation:
      'صفات الحروف هي الكيفيات التي تُميّز كل حرف عند النطق به، مثل الجهر والهمس، الشدة والرخاوة، الإطباق والانفتاح، الاستعلاء والاستفال. مراعاة الصفات تمنع اللبس بين الحروف المشتركة في المخرج.',
    note: 'تتطلب الصفات تدريبًا عمليًا ومشافهة؛ يُنصح بالتلقّي من قارئ مُجاز.',
  },
  {
    id: 'noon-sakinah',
    title: 'النون الساكنة والتنوين',
    summary: 'أحكام الإظهار، الإدغام، الإقلاب، والإخفاء',
    explanation:
      'للنون الساكنة والتنوين أربعة أحكام عند ملاقاتها لحروف الهجاء: الإظهار (مع حروف الحلق)، الإدغام (مع الياء والراء والميم واللام والواو والنون)، الإقلاب (مع الباء)، والإخفاء (مع بقية الحروف).',
    note: 'تُتقن هذه الأحكام بالسماع والتدريب العملي.',
  },
  {
    id: 'meem-sakinah',
    title: 'الميم الساكنة',
    summary: 'الإخفاء الشفوي، الإدغام الشفوي، والإظهار الشفوي',
    explanation:
      'للميم الساكنة ثلاثة أحكام: الإخفاء الشفوي (عند الباء)، الإدغام الشفوي (عند الميم المتشابهة)، والإظهار الشفوي (عند باقي الحروف).',
    note: 'يُتقن بالتلقّي والمشافهة.',
  },
  {
    id: 'madd',
    title: 'المدود',
    summary: 'المد الطبيعي، المد الفرعي، والمد اللازم',
    explanation:
      'المد هو إطالة الصوت عند النطق بحرف المد. المد الطبيعي مقداره حركتان. والمد الفرعي إما بسبب الهمز أو السكون، ويكون واجبًا أو جائزًا أو لازمًا. المد اللازم أطول أنواع المد.',
    note: 'مقادير المدود تُضبط بالتلقي ولا تُقاس بالآلة بدقة كافية دون معلم.',
  },
  {
    id: 'waqf',
    title: 'الوقف والابتداء',
    summary: 'مواضع الوقف الجائز والواجب وحسن الوقف',
    explanation:
      'الوقف هو قطع الصوت عند آخر الكلمة. للوقف أنواع: الوقف التام، الكافي، الحسن، القبيح. ومعرفة مواضع الوقف تُعين على فهم المعنى وعدم قطعه بشكل يخلّ بالمراد.',
    note: 'يُتقن بدراسة علم الوقف والابتداء والتلقي.',
  },
];

export function TajweedPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="أكاديمية التجويد"
        subtitle="أساسيات علم التجويد وأحكام التلاوة"
        icon={<Type className="h-6 w-6" />}
      />

      <Card className="mb-5 bg-gradient-to-br from-primary-50 to-white dark:from-night-800 dark:to-night-900">
        <div className="flex items-start gap-3">
          <GraduationCap className="mt-0.5 h-6 w-6 shrink-0 text-primary-500" />
          <div>
            <p className="text-sm text-primary-600 dark:text-sand-100">
              التجويد علم يُؤخذ بالتلقي والمشافهة من معلم مُجاز. هذه الدروس مقدّمة تعريفية لتسهيل الفهم، ولا تغني عن التلقي المباشر.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {LESSONS.map((lesson, idx) => {
          const open = openId === lesson.id;
          return (
            <Card key={lesson.id} className="overflow-hidden">
              <button
                onClick={() => setOpenId(open ? null : lesson.id)}
                className="flex w-full items-center gap-4 text-right"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-500/10 font-display text-lg font-bold text-primary-500 dark:bg-primary-400/15">
                  {toArabicDigits(idx + 1)}
                </div>
                <div className="flex-1">
                  <p className="font-display text-lg font-bold text-primary-600 dark:text-sand-100">{lesson.title}</p>
                  <p className="text-xs text-primary-400 dark:text-sand-400">{lesson.summary}</p>
                </div>
                {open ? <ChevronLeft className="h-5 w-5 text-primary-400" /> : <ChevronRight className="h-5 w-5 text-primary-400" />}
              </button>

              {open && (
                <div className="mt-4 animate-fade-in border-t border-sand-200 pt-4 dark:border-white/10">
                  <p className="text-sm leading-relaxed text-primary-600 dark:text-sand-200">{lesson.explanation}</p>
                  <OrnamentalDivider />
                  <div className="flex items-start gap-2 rounded-xl bg-gold-50 p-3 dark:bg-gold-500/10">
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" />
                    <p className="text-xs text-gold-700 dark:text-gold-300">{lesson.note}</p>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
