'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname === '/zh' || pathname === '/en';

  return (
    <motion.div
      initial={{ x: isHomePage ? 20 : -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ ease: 'easeOut', duration: 0.3 }}
      className="w-[100vw] overflow-x-hidden"
    >
      {children}
    </motion.div>
  );
}
