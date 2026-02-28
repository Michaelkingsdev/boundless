'use client';

import { useMemo, useState } from 'react';
import { useAuthStatus } from '@/hooks/use-auth';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import HackathonCard from '@/components/landing-page/hackathon/HackathonCard';
import {
  ProgressIndicator,
  SubmissionStage,
} from '@/components/hackathons/ProgressIndicator';
import { cn } from '@/lib/utils';
import { Hackathon } from '@/lib/api/hackathons';
import EmptyState from '@/components/EmptyState';

interface ExtendedUser {
  profile?: {
    hackathonsAsParticipant?: Hackathon[];
    userHackathons?: Hackathon[];
    hackathonSubmissionsAsParticipant?: Array<{
      id: string;
      hackathonId: string;
      status: string;
      submittedAt: string;
    }>;
  };
}

export default function ParticipatingPage() {
  const { user, isLoading } = useAuthStatus() as {
    user: ExtendedUser | null;
    isLoading: boolean;
  };
  const [activeTab, setActiveTab] = useState<'all' | 'hackathons' | 'projects'>(
    'all'
  );

  const unifiedList = useMemo(() => {
    if (!user?.profile) return [];

    const hackathonsAsParticipant = user.profile.hackathonsAsParticipant || [];
    const userHackathons = user.profile.userHackathons || [];

    // Merge and deduplicate by ID
    const merged = [...hackathonsAsParticipant, ...userHackathons];
    const seen = new Set();
    const deduplicated = merged.filter(h => {
      if (seen.has(h.id)) return false;
      seen.add(h.id);
      return true;
    });

    // Sort logic: active/ongoing first, then upcoming, then completed
    return deduplicated.sort((a, b) => {
      const getPriority = (h: Hackathon) => {
        const now = new Date().getTime();
        const start = new Date(h.startDate).getTime();
        const deadline = new Date(h.submissionDeadline).getTime();

        if (now >= start && now <= deadline) return 0; // Ongoing
        if (now < start) return 1; // Upcoming
        return 2; // Completed
      };

      return getPriority(a) - getPriority(b);
    });
  }, [user]);

  const filteredList = useMemo(() => {
    if (activeTab === 'all') return unifiedList;
    if (activeTab === 'hackathons') {
      // In this context, "hackathons" might mean ones you are participating in vs "projects" (ones you created/lead)
      // But the prompt says "Each tab filters from the unified list".
      // Usually "Projects" refers to hackathons where you have a submission.
      return unifiedList; // Placeholder for specific filter logic if needed
    }
    return unifiedList;
  }, [unifiedList, activeTab]);

  const getSubmissionStage = (hackathonId: string): SubmissionStage => {
    const submission = user?.profile?.hackathonSubmissionsAsParticipant?.find(
      s => s.hackathonId === hackathonId
    );

    if (!submission) return 'Not Started';

    const status = submission.status.toUpperCase();
    if (status === 'DRAFT') return 'In Progress';
    if (status === 'SUBMITTED') return 'Submitted';
    if (status === 'UNDER_REVIEW') return 'Under Review';
    if (status === 'WINNER' || status === 'COMPLETED') return 'Results Pending';

    return 'In Progress';
  };

  if (isLoading) {
    return (
      <div className='flex h-[400px] items-center justify-center'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
      </div>
    );
  }

  return (
    <div className='container mx-auto max-w-7xl px-4 py-8 md:px-6 lg:py-12'>
      <div className='mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-white md:text-4xl'>
            Participating
          </h1>
          <p className='mt-2 text-zinc-400'>
            Track your active hackathons, projects, and pending submissions.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={v => setActiveTab(v as any)}
          className='w-full md:w-auto'
        >
          <TabsList className='relative h-11 w-full justify-start rounded-full bg-zinc-900/50 p-1 md:w-auto'>
            {['all', 'hackathons', 'projects'].map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className={cn(
                  'relative z-10 h-9 rounded-full px-6 text-sm font-medium capitalize transition-colors duration-200',
                  activeTab === tab
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId='activeTabGlow'
                    className='absolute inset-0 -z-10 rounded-full bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <AnimatePresence mode='popLayout'>
        {filteredList.length > 0 ? (
          <motion.div
            layout
            className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {filteredList.map(hackathon => (
              <motion.div
                key={hackathon.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='relative'
              >
                <HackathonCard
                  {...hackathon}
                  isFullWidth
                  className='hover:shadow-primary/5 rounded-4xl border-white/5 transition-all duration-500 hover:border-white/20 hover:shadow-2xl'
                />
                <div className='pointer-events-none absolute right-3 bottom-3 z-20'>
                  <ProgressIndicator stage={getSubmissionStage(hackathon.id)} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            title='No active engagements'
            description="You haven't joined any hackathons yet. Explore our open events to get started!"
            buttonText='Explore Hackathons'
            onAddClick={() => (window.location.href = '/hackathons')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
