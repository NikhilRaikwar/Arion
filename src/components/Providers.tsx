'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['wallet', 'email'],
        appearance: {
          theme: 'light',
          accentColor: '#667eea',
          logo: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/5dd4d76f-6642-4783-8f5b-ac527e1da9c6/generated_images/modern-minimalist-logo-for-chainbot-a-bl-fc0b3a92-20251031201154.jpg',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}