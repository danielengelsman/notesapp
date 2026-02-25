import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  // Verify webhook secret if configured
  const secret = req.headers.get('x-elevenlabs-signature');
  if (process.env.ELEVENLABS_WEBHOOK_SECRET && secret !== process.env.ELEVENLABS_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, content, folder, tags, user_id } = await req.json();

  if (!user_id) {
    return Response.json({ error: 'Missing user_id' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Voice notes are stored as plaintext with a sentinel IV since
  // client-side encryption requires the user's key in the browser.
  const { error } = await supabase.from('notes').insert({
    user_id,
    title: title || 'Voice Note',
    content_encrypted: content || '',
    content_iv: '__voice__',
    folder: folder || 'Personal',
    tags: tags || [],
    security_level: 'cloud',
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    success: true,
    message: `Note "${title || 'Voice Note'}" created in ${folder || 'Personal'} folder.`,
  });
}
