import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  // Verify webhook secret if configured
  const secret = req.headers.get('x-elevenlabs-signature');
  if (process.env.ELEVENLABS_WEBHOOK_SECRET && secret !== process.env.ELEVENLABS_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, content, folder, tags } = await req.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Note: Content from voice agent is stored as plaintext since
  // client-side encryption requires the user's key in the browser.
  // For production, implement server-side encryption or a key exchange.
  const { error } = await supabase.from('notes').insert({
    user_id: user.id,
    title: title || 'Voice Note',
    content_encrypted: content || '', // Placeholder — needs client-side encryption
    content_iv: '',
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
