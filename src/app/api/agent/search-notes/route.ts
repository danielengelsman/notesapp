import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const secret = req.headers.get('x-elevenlabs-signature');
  if (process.env.ELEVENLABS_WEBHOOK_SECRET && secret !== process.env.ELEVENLABS_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { query, user_id } = await req.json();

  if (!user_id) {
    return Response.json({ error: 'Missing user_id' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Search by title (content is encrypted, so we can only search titles server-side)
  const { data: notes, error } = await supabase
    .from('notes')
    .select('id, title, folder, created_at')
    .eq('user_id', user_id)
    .ilike('title', `%${query}%`)
    .order('updated_at', { ascending: false })
    .limit(5);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    results: notes?.map((n) => ({
      title: n.title,
      folder: n.folder,
      created: n.created_at,
    })) || [],
    count: notes?.length || 0,
    message: notes?.length
      ? `Found ${notes.length} note(s) matching "${query}"`
      : `No notes found matching "${query}"`,
  });
}
