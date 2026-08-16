import { useState } from 'react';
import { Music, ChevronLeft, ChevronRight, Headphones } from 'lucide-react';
import { PageHeader, Card, toArabicDigits, OrnamentalDivider } from '@/core/widgets/ui';

interface Maqam {
  id: string;
  name: string;
  description: string;
  characteristics: string;
  mood: string;
}

const MAQAMAT: Maqam[] = [
  { id: 'bayati', name: 'البيات', description: 'من أكثر المقامات استخدامًا في التلاوة، يتميّز بالخشوع والطمأنينة.', characteristics: 'يبدأ عادةً بدرجة الدوكاه (ري)، ويتميّز بنغمة الحسيني.', mood: 'خشوع، رقة، تأمل' },
  { id: 'rast', name: 'الرست', description: 'مقام أصيل مهيب، يُستخدم في تلاوات الفجر غالبًا.', characteristics: 'يبدأ بدرجة الرست (دو)، ويتميّز بالوقار والاستقرار.', mood: 'مهابة، وقار، ثبات' },
  { id: 'hijaz', name: 'الحجاز', description: 'مقام يبعث على الشجن والعاطفة، شائع في التلاوات.', characteristics: 'يتميّز بالمسافة الموسيقية بين الدو ري بيمول (الفاصل الموسع).', mood: 'شجن، عاطفة، خشوع' },
  { id: 'saba', name: 'الصبا', description: 'مقام حزين يبعث على التأمل والبكاء.', characteristics: 'يتميّز ببنية فريدة تجمع بين المقامات.', mood: 'حزن، تأمل، خشية' },
  { id: 'nahawand', name: 'النهاوند', description: 'مقام رقيق عاطفي يشبه المقامات الغربية الصغرى.', characteristics: 'يبدأ بدرجة الدوكاه ويتدرّج بعاطفة.', mood: 'رقة، عاطفة، حنان' },
  { id: 'sikah', name: 'السيكا', description: 'مقام يُستخدم كثيرًا في الابتهالات.', characteristics: 'يقوم على درجة السيكا (بين مي ومي بيمول).', mood: 'ابتهال، تضرّع، رقّة' },
  { id: 'ajam', name: 'العجم', description: 'مقام مشرق يبعث على السرور.', characteristics: 'يشبه المقام الكبير في الموسيقى الغربية (Major).', mood: 'بهجة، إشراق، سرور' },
];

export function MaqamatPage() {
  const [activeId, setActiveId] = useState<string>(MAQAMAT[0].id);
  const active = MAQAMAT.find((m) => m.id === activeId) ?? MAQAMAT[0];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="المقامات"
        subtitle="مقامات التلاوة القرآنية وخصائصها"
        icon={<Music className="h-6 w-6" />}
      />

      <Card className="mb-5 bg-gradient-to-br from-gold-50 to-white dark:from-night-800 dark:to-night-900">
        <p className="text-sm text-primary-600 dark:text-sand-100">
          المقامات هي أنماط صوتية تُضفي على التلاوة طابعًا روحانيًا. تعلّم المقامات يُؤخذ بالتلقي والسماع من المقرئين المُجازين. هذا العرض تعريفي فقط.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* List */}
        <div className="space-y-2 lg:col-span-1">
          {MAQAMAT.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => setActiveId(m.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-right transition ${
                activeId === m.id
                  ? 'border-secondary-400 bg-secondary-50 dark:border-secondary-500/40 dark:bg-secondary-900/20'
                  : 'border-sand-200 bg-white hover:border-sand-300 dark:border-white/10 dark:bg-night-800'
              }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/10 font-display text-sm font-bold text-primary-500">
                {toArabicDigits(idx + 1)}
              </span>
              <span className="font-display font-bold text-primary-600 dark:text-sand-100">{m.name}</span>
              {activeId === m.id ? <ChevronLeft className="mr-auto h-4 w-4 text-secondary-500" /> : null}
            </button>
          ))}
        </div>

        {/* Detail */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 text-white">
              <Music className="h-7 w-7" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-primary-600 dark:text-sand-100">{active.name}</p>
              <p className="text-xs text-secondary-500">{active.mood}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-primary-600 dark:text-sand-200">{active.description}</p>
          <OrnamentalDivider />
          <div className="rounded-xl bg-sand-50 p-4 dark:bg-white/5">
            <p className="mb-1 text-xs font-semibold text-primary-500 dark:text-sand-300">الخصائص</p>
            <p className="text-sm text-primary-600 dark:text-sand-200">{active.characteristics}</p>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-gold-50 p-3 dark:bg-gold-500/10">
            <Headphones className="mt-0.5 h-4 w-4 shrink-0 text-gold-600 dark:text-gold-400" />
            <p className="text-xs text-gold-700 dark:text-gold-300">
              التسجيلات الصوتية للمقامات يجب أن تأتي من مصادر موثقة. لا يتم توليد أي تسجيل صوتي بالذكاء الاصطناعي.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
