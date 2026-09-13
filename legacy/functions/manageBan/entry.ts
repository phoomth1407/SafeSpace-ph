import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { target_id, banned, banned_until } = body;
    if (!target_id) return Response.json({ error: 'target_id required' }, { status: 400 });
    if (typeof banned !== 'boolean') return Response.json({ error: 'banned boolean required' }, { status: 400 });

    const updated = await base44.asServiceRole.entities.User.update(target_id, {
      banned,
      banned_until: banned_until || null,
    });

    return Response.json({ ok: true, user: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
