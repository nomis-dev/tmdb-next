import {useTranslations} from 'next-intl';
import {Link} from '../../i18n/routing';

export default function Index() {
  const t = useTranslations('HomePage');
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <p className="mb-4">{t('description')}</p>
      <div className="flex gap-4">
        <Link href="/" locale="en" className="text-blue-500 hover:underline">English</Link>
        <Link href="/" locale="zh" className="text-blue-500 hover:underline">中文</Link>
      </div>
    </div>
  );
}
