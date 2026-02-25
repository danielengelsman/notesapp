'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Reminder, ReminderFormData } from '@/types';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('reminders')
        .select('*')
        .order('due_date', { ascending: true });

      if (fetchError) throw fetchError;
      setReminders((data as Reminder[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const createReminder = useCallback(async (formData: ReminderFormData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error: insertError } = await supabase
      .from('reminders')
      .insert({
        user_id: user.id,
        text: formData.text,
        due_date: formData.due_date,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const reminder = data as Reminder;
    setReminders((prev) => {
      const updated = [reminder, ...prev];
      updated.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
      return updated;
    });
    return reminder;
  }, [supabase]);

  const toggleComplete = useCallback(async (id: string, completed: boolean) => {
    const { error: updateError } = await supabase
      .from('reminders')
      .update({ completed })
      .eq('id', id);

    if (updateError) throw updateError;
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed } : r))
    );
  }, [supabase]);

  const deleteReminder = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, [supabase]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  return {
    reminders,
    loading,
    error,
    fetchReminders,
    createReminder,
    toggleComplete,
    deleteReminder,
  };
}
