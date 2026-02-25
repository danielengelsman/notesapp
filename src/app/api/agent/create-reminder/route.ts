import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const secret = req.headers.get('x-elevenlabs-signature');
  if (process.env.ELEVENLABS_WEBHOOK_SECRET && secret !== process.env.ELEVENLABS_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { text, due_date, user_id } = await req.json();

  if (!user_id) {
    return Response.json({ error: 'Missing user_id' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from('reminders').insert({
    user_id,
    text: text || 'Reminder',
    due_date: due_date || new Date().toISOString(),
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    success: true,
    message: `Reminder set: "${text}"`,
  });
}
