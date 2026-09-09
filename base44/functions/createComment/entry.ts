import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { containsProfanity, getProfanityError } from "../../shared/profanity.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.banned && (!user.banned_until || new Date(user.banned_until) > new Date())) {
      return Response.json({ error: 'banned' }, { status: 403 });
    }

    const body = await req.json();
    const { post_id, content, author_name, language } = body;
    if (!post_id || !content || typeof content !== 'string' || content.trim().length < 2) {
      return Response.json({ error: 'invalid' }, { status: 400 });
    }

    const lang = language === 'en' ? 'en' : 'th';
    if (containsProfanity(content)) {
      return Response.json({ error: getProfanityError(lang) }, { status: 400 });
    }

    const created = await base44.entities.CommunityComment.create({
      post_id,
      content: content.trim(),
      author_name: (author_name && author_name.trim()) || 'anonymous',
    });

    return Response.json(created);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
