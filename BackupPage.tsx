import { useRef, useState } from 'react';
import { DatabaseBackup, Download, Upload, Check, AlertCircle } from 'lucide-react';
import { PageHeader, Card } from '@/core/widgets/ui';
import { buildBackup, restoreBackup, type BackupPayload } from '@/core/services/userData';

export function BackupPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleExport = () => {
    const payload = buildBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noor-quran-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ type: 'ok', text: 'تم تصدير نسختك الاحتياطية بنجاح' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result as string) as BackupPayload;
        if (!payload.version) throw new Error('invalid');
        restoreBackup(payload);
        setMsg({ type: 'ok', text: 'تم استيراد النسخة واستعادة بياناتك بنجاح. أعد تحميل الصفحة لرؤية كل التغييرات.' });
      } catch {
        setMsg({ type: 'err', text: 'الملف غير صالح. تأكد من اختيار نسخة احتياطية صحيحة من نور القرآن.' });
      }
    };
    reader.onerror = () => setMsg({ type: 'err', text: 'تعذّر قراءة الملف.' });
    reader.readAsText(file);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="النسخ الاحتياطي" subtitle="صدّر بياناتك واستوردها" icon={<DatabaseBackup className="h-6 w-6" />} />

      <Card className="mb-4">
        <p className="mb-4 text-sm leading-relaxed text-primary-500 dark:text-sand-200">
          يشمل النسخ الاحتياطي: تقدّم القراءة، العلامات، المفضلة، الملاحظات، خطط الحفظ، عدّادات الأذكار، والإعدادات. لا يشمل النص القرآني الأساسي لأنه جزء من التطبيق.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Export */}
          <button
            onClick={handleExport}
            className="flex flex-col items-center gap-3 rounded-2xl border border-sand-200 bg-white p-6 text-center transition hover:border-secondary-400 hover:shadow-soft dark:border-white/10 dark:bg-night-900"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-500 text-white">
              <Download className="h-7 w-7" />
            </div>
            <div>
              <p className="font-display font-bold text-primary-600 dark:text-sand-100">تصدير نسخة</p>
              <p className="text-xs text-primary-400 dark:text-sand-400">احفظ نسخة على جهازك</p>
            </div>
          </button>

          {/* Import */}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-3 rounded-2xl border border-sand-200 bg-white p-6 text-center transition hover:border-primary-400 hover:shadow-soft dark:border-white/10 dark:bg-night-900"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500 text-white">
              <Upload className="h-7 w-7" />
            </div>
            <div>
              <p className="font-display font-bold text-primary-600 dark:text-sand-100">استيراد نسخة</p>
              <p className="text-xs text-primary-400 dark:text-sand-400">استعد بياناتك من ملف</p>
            </div>
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImport} />
        </div>
      </Card>

      {msg && (
        <div
          className={`flex items-start gap-2 rounded-xl p-4 ${
            msg.type === 'ok' ? 'bg-secondary-50 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300' : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'
          }`}
        >
          {msg.type === 'ok' ? <Check className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
          <p className="text-sm">{msg.text}</p>
        </div>
      )}

      <Card className="mt-4 bg-gold-50 dark:bg-gold-500/10">
        <p className="text-xs text-gold-700 dark:text-gold-300">
          تنبيه: الاستيراد يستبدل البيانات الحالية. يُنصح بتصدير نسخة قبل الاستيراد.
        </p>
      </Card>
    </div>
  );
}
