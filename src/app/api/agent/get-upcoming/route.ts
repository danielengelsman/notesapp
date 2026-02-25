import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const secret = req.headers.get('x-elevenlabs-signature');
  if (process.env.ELEVENLABS_WEBHOOK_SECRET && secret !== process.env.ELEVENLABS_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { user_id } = await req.json();

  if (!user_id) {
    return Response.json({ error: 'Missing user_id' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: reminders } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user_id)
    .eq('completed', false)
    .order('due_date', { ascending: true })
    .limit(10);

  const formatted = reminders?.map((r) => {
    const days = Math.ceil(
      (new Date(r.due_date).getTime() - Date.now()) / 86400000
    );
    const when =
      days <= 0 ? 'overdue' : days === 1 ? 'tomorrow' : `in ${days} days`;
    return `${r.text} — due ${when}`;
  });

  return Response.json({
    upcoming: formatted || [],
    count: reminders?.length || 0,
  });
}
