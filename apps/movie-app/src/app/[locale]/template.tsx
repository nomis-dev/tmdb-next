'use client';

import { motion } from 'framer-motion';
import { usePathname } from '@/i18n/routing';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <motion.div
      initial={{ x: isHomePage ? 20 : -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ ease: 'easeOut', duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
