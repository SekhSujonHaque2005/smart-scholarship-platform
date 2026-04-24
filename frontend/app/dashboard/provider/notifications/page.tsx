'use client';

import React from 'react';
import { ProviderLayout } from '@/components/provider/ProviderLayout';
import { Notifications } from '@/components/dashboard/Notifications';
import { motion } from 'framer-motion';

export default function ProviderNotificationsPage() {
  return (
    <ProviderLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Notifications />
      </motion.div>
    </ProviderLayout>
  );
}
