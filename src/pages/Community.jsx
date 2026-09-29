import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { Loader2, Send, PenLine, X, Heart, LogIn, Megaphone, Filter, ArrowLeft, Ban, Mail } from "lucide-react";
import { appClient } from "@/api/appClient";
import { useAuth } from "@/lib/AuthContext";
import CommunityPostCard from "@/components/CommunityPostCard";
import BreathingExerciseModal from "@/components/BreathingExerciseModal";
import GroundingModal from "@/components/GroundingModal";
import { categoryLabels } from "@/lib/assessmentQuestions";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabaseClient";

export default function Community() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { t, lang } = useTranslation();
  const isAdmin = user?.role === "admin";
  const isBanned = !!user?.banned;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAnnounce, setShowAnnounce] = useState(false);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("other");
  const [authorName, setAuthorName] = useState("");
  const [anon, setAnon] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [focusedPostId, setFocusedPostId] = useState(null);
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [groundingOpen, setGroundingOpen] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [accessModal, setAccessModal] = useState(null);
  const [guestInfo, setGuestInfo] = useState(null);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyScrolled, setPolicyScrolled] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [pendingCommunityAction, setPendingCommunityAction] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setPolicyAccepted(false);
      return;
    }
    try {
      setPolicyAccepted(localStorage.getItem(`safespace_community_policy_accepted:${user.id}`) === "1");
    } catch {
      setPolicyAccepted(false);
    }
  }, [isAuthenticated, user?.id]);

  const finishIntro = () => {
    if (!policyAccepted) {
      setPendingCommunityAction({ type: "enter" });
      setPolicyScrolled(false);
      setPolicyOpen(true);
      return;
    }
    setIntroComplete(true);
  };

  const openPolicyFor = (action) => {
    if (policyAccepted) {
      if (action.type === "post") setShowForm(true);
      if (action.type === "comment") setFocusedPostId(action.postId);
      return;
    }
    setPendingCommunityAction(action);
    setPolicyScrolled(false);
    setPolicyOpen(true);
  };

  const requestPost = () => {
    if (!isAuthenticated) {
      setAccessModal({ type: "post" });
      return;
    }
    if (isBanned) return;
    openPolicyFor({ type: "post" });
  };

  const requestComment = (postId) => {
    if (!isAuthenticated) {
      setAccessModal({ type: "comment", postId });
      return;
    }
    if (isBanned) return;
    openPolicyFor({ type: "comment", postId });
  };

  const continueAsGuest = () => {
    const intent = accessModal;
    setAccessModal(null);
    setGuestInfo(intent);
  };

  const acknowledgeGuestInfo = () => {
    const intent = guestInfo;
    setGuestInfo(null);
    if (intent?.type === "comment" && intent.postId) {
      setFocusedPostId(intent.postId);
    }
  };

  const acceptCommunityPolicy = () => {
    if (!policyScrolled || !pendingCommunityAction) return;
    const action = pendingCommunityAction;
    if (isAuthenticated && user?.id) {
      try { localStorage.setItem(`safespace_community_policy_accepted:${user.id}`, "1"); } catch {}
      setPolicyAccepted(true);
    }
    setPendingCommunityAction(null);
    setPolicyOpen(false);
    if (action.type === "enter") {
      setIntroComplete(true);
      return;
    }
    if (action.type === "post") setShowForm(true);
    if (action.type === "comment") setFocusedPostId(action.postId);
  };

  const handlePolicyScroll = (event) => {
    const el = event.currentTarget;
    setPolicyScrolled(el.scrollTop + el.clientHeight >= el.scrollHeight - 12);
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await appClient.entities.CommunityPost.list("-created_date", 50);
      setPosts(data);
    } catch (err) {
      setError(t("community.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    const params = new URLSearchParams(window.location.search);
    const focus = params.get("focus");
    if (focus) setFocusedPostId(focus);

    const channel = supabase
      .channel("community-posts-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_posts" },
        ({ new: newPost }) => {
          setPosts((current) => {
            if (current.some((post) => post.id === newPost.id)) return current;
            return [newPost, ...current].slice(0, 50);
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "community_posts" },
        ({ new: updatedPost }) => {
          setPosts((current) =>
            current.map((post) => (post.id === updatedPost.id ? updatedPost : post))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "community_posts" },
        ({ old: deletedPost }) => {
          setPosts((current) => current.filter((post) => post.id !== deletedPost.id));
          setFocusedPostId((current) => (current === deletedPost.id ? null : current));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeletePost = async (id) => {
    try {
      await appClient.entities.CommunityPost.delete(id);
      setPosts(posts.filter((p) => p.id !== id));
      if (focusedPostId === id) setFocusedPostId(null);
    } catch (err) {
      alert(t("community.deletePostError"));
    }
  };

  const handleSubmit = async () => {
    if (content.trim().length < 10) {
      setError(t("community.errorShort"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { data: result } = await appClient.functions.invoke("createCommunityPost", {
        content: content.trim(),
        category,
        author_name: anon ? "anonymous" : authorName.trim() || "anonymous",
        ai_response: "",
        ai_risk_flag: "safe",
        ai_enabled: false,
      });

      if (result?.allowed === false) {
        const nextAllowed = result.next_allowed_at
          ? new Date(result.next_allowed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : null;
        setError(
          nextAllowed
            ? `${t("community.error")} ${nextAllowed}`
            : t("community.error")
        );
        return;
      }

      if (result?.error) {
        setError(result.error);
        return;
      }

      setContent("");
      setCategory("other");
      setShowForm(false);
      await loadPosts();
    } catch (err) {
      setError(t("community.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnnounce = async () => {
    if (content.trim().length < 5) {
      setError(t("community.errorShort"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await appClient.functions.invoke("createCommunityAnnouncement", {
        content: content.trim(),
      });
      setContent("");
      setShowAnnounce(false);
      await loadPosts();
    } catch (err) {
      setError(t("community.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const announcements = posts.filter((p) => p.is_announcement);
  const userPosts = posts.filter((p) => !p.is_announcement);
  const filteredPosts = filter === "all" ? userPosts : userPosts.filter((p) => p.category === filter);
  const sortedPosts = [...filteredPosts].sort((a, b) => (b.bumps || 0) - (a.bumps || 0));

  const WellnessIcon = ({ type, className = "h-5 w-5" }) => {
    const common = { className, viewBox: "0 0 48 48", fill: "none", xmlns: "http://www.w3.org/2000/svg", "aria-hidden": "true" };
    const stroke = { stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" };
    if (type === "breath") return <svg {...common}><path d="M7 18h20c5 0 7-2.4 7-5.5 0-3-2.4-5.5-5.5-5.5-2.7 0-4.7 1.5-5.5 3.7" {...stroke}/><path d="M7 26h28c4.5 0 7 2.1 7 5.2 0 3-2.3 5.3-5.4 5.3-2.5 0-4.5-1.4-5.3-3.5" {...stroke}/><path d="M7 34h14" {...stroke}/><circle cx="38" cy="11" r="2" fill="currentColor" opacity=".2"/></svg>;
    if (type === "ground") return <svg {...common}><path d="M24 39V18" {...stroke}/><path d="M24 25c-7-1-11-5.3-11-12 7.3.2 11.5 4 11.5 10.5" fill="currentColor" opacity=".12"/><path d="M24 25c-7-1-11-5.3-11-12 7.3.2 11.5 4 11.5 10.5" {...stroke}/><path d="M24 31c1.5-7 6-10.8 13-10.5-.7 7.2-5 11-13 12" fill="currentColor" opacity=".12"/><path d="M24 31c1.5-7 6-10.8 13-10.5-.7 7.2-5 11-13 12" {...stroke}/><path d="M15 39h18" {...stroke} opacity=".45"/></svg>;
    return <svg {...common}><path d="M8 25h6l7 6V17l-7 6H8v2Z" fill="currentColor" opacity=".12"/><path d="M8 25h6l7 6V17l-7 6H8v2Z" {...stroke}/><path d="M28 20c4 2.5 4 5.5 0 8" {...stroke}/><path d="M34 16c7 5 7 11 0 16" {...stroke}/><path d="M39 12c10 7.5 10 16.5 0 24" {...stroke} opacity=".35"/></svg>;
  };

  const renderForm = (isAnnounce) => (
    <div className="community-composer">
      <div className="community-composer-head">
        <div className="community-composer-title">
          <span className="community-composer-icon">
            {isAnnounce ? <Megaphone className="h-4 w-4" /> : <PenLine className="h-4 w-4" />}
          </span>
          <div>
            <span>{isAnnounce ? t("community.postAnnouncement") : t("community.writeTitle")}</span>
            
          </div>
        </div>
        <button
          onClick={() => { setShowForm(false); setShowAnnounce(false); setContent(""); setError(null); }}
          className="community-icon-button"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!isAnnounce && (
        <>
          <div className="community-category-picker">
            {Object.entries(categoryLabels).map(([key, labelObj]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`community-category-chip ${category === key ? "is-active" : ""}`}
              >
                {labelObj[lang] || labelObj.th}
              </button>
            ))}
          </div>
          <div className="community-composer-row">
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={t("community.authorPlaceholder")}
              disabled={anon}
              className="community-field"
            />
            <label className="community-anon-toggle">
              <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
              <span>{t("community.anonToggle")}</span>
            </label>
          </div>
        </>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("community.contentPlaceholder")}
        rows={5}
        className="community-field community-textarea"
      />
      {error && <div className="community-form-error">{error}</div>}
      <div className="community-composer-foot">
        <span>{content.length} {t("community.chars")}</span>
        <button
          onClick={isAnnounce ? handleAnnounce : handleSubmit}
          disabled={submitting || content.trim().length < (isAnnounce ? 5 : 10)}
          className="community-submit-button"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isAnnounce ? <Megaphone className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          {submitting ? t("community.post") : isAnnounce ? t("community.postAnnouncement") : t("community.post")}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`community-page ${introComplete ? "is-feed-mode" : "is-intro-mode"}`}>
      {!introComplete && <section className="community-hero-card">
        <div className="community-hero-glow community-hero-glow-a" />
        <div className="community-hero-glow community-hero-glow-b" />
        <div className="community-hero-copy">
          <div className="community-eyebrow">
            <span className="community-live-dot" />
            SafeSpace Community
          </div>
          <h1>{t("community.title")}</h1>
          <p>{t("community.subtitle")}</p>
          <div className="community-hero-actions">
            {!isAuthenticated && (
              <button onClick={() => navigate("/login")} className="community-primary-button">
                <LogIn className="h-4 w-4" />
                {t("community.login")}
              </button>
            )}
            <button onClick={finishIntro} className="community-primary-button">
              {t("community.next")}
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </button>
            <button onClick={() => navigate("/contact-admin")} className="community-secondary-button">
              <Mail className="h-4 w-4" />
              {t("contact.tab")}
            </button>
          </div>
        </div>
        <div className="community-hero-art" aria-hidden="true">
          <div className="community-art-orbit orbit-one" />
          <div className="community-art-orbit orbit-two" />
          <div className="community-art-core">
            <div className="community-art-person person-one" />
            <div className="community-art-person person-two" />
            <div className="community-art-person person-three" />
            <span className="community-art-heart"><Heart className="h-5 w-5" /></span>
          </div>
        </div>
      </section>}

      {!introComplete && (
        
        <section className="community-tools-card">
          <div className="community-section-heading">
            <div>
              
              <h2>{t("community.quickTitle")}</h2>
            </div>
            
          </div>
          <div className="community-tools-grid">
            <button onClick={() => setBreathingOpen(true)} className="community-tool-card tool-breath">
              <span className="community-tool-icon"><WellnessIcon type="breath" /></span>
              <span><strong>{t("community.quickBreath")}</strong></span>
              <ArrowLeft className="community-tool-arrow" />
            </button>
            <button onClick={() => setGroundingOpen(true)} className="community-tool-card tool-ground">
              <span className="community-tool-icon"><WellnessIcon type="ground" /></span>
              <span><strong>{t("community.quickGround")}</strong></span>
              <ArrowLeft className="community-tool-arrow" />
            </button>
            <button onClick={() => window.dispatchEvent(new Event("safespace:open-sounds"))} className="community-tool-card tool-sound">
              <span className="community-tool-icon"><WellnessIcon type="sound" /></span>
              <span><strong>{t("community.quickSound")}</strong></span>
              <ArrowLeft className="community-tool-arrow" />
            </button>
          </div>
        </section>
      )}

      {introComplete && (
        <div className="community-feed-mode-content">
      {isAuthenticated && isBanned && (
        <div className="community-notice community-notice-danger">
          <Ban className="w-4 h-4" />
          <p>{t("community.banned")}</p>
        </div>
      )}

      {isBanned ? null : showAnnounce ? (
        renderForm(true)
      ) : showForm ? (
        renderForm(false)
      ) : (
        <section className="community-share-card">
          <div className="community-share-avatar"><PenLine className="w-5 h-5" /></div>
          <button onClick={requestPost} className="community-share-trigger">
            <span>{t("community.writePlaceholder")}</span>
            <small>{isAuthenticated ? (anon ? t("community.anonToggle") : authorName || t("community.anon")) : t("community.loginPrompt")}</small>
          </button>
          {isAdmin && (
            <button onClick={() => setShowAnnounce(true)} className="community-announce-button">
              <Megaphone className="w-4 h-4" />
              {t("community.postAnnouncement")}
            </button>
          )}
        </section>
      )}

      {!focusedPostId && (
        <section className="community-feed-section">
          <div className="community-feed-header">
            <div>
              
              <h2>{t("community.title")}</h2>
            </div>
            <div className="community-filter-wrap">
              <Filter className="w-4 h-4" />
              <div className="community-filter-scroll">
                <button onClick={() => setFilter("all")} className={`community-filter-chip ${filter === "all" ? "is-active" : ""}`}>{t("community.filter.all")}</button>
                {Object.entries(categoryLabels).map(([key, labelObj]) => (
                  <button key={key} onClick={() => setFilter(key)} className={`community-filter-chip ${filter === key ? "is-active" : ""}`}>
                    {labelObj[lang] || labelObj.th}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {focusedPostId && (
        <button onClick={() => setFocusedPostId(null)} className="community-back-button">
          <ArrowLeft className="w-4 h-4" />
          {t("community.back")}
        </button>
      )}

      {!focusedPostId && announcements.length > 0 && (
        <div className="community-announcements">
          <div className="community-feed-label"><Megaphone className="w-4 h-4" /> {t("community.announcement")}</div>
          {announcements.map((post) => (
            <CommunityPostCard key={post.id} post={post} isAdmin={isAdmin} isOwner={user?.id === post.created_by_id} user={user} onDelete={handleDeletePost} isAnnouncement />
          ))}
        </div>
      )}

      <div className="community-posts-list">
        {loading ? (
          <div className="community-loading"><Loader2 className="w-7 h-7 animate-spin" /></div>
        ) : focusedPostId ? (
          (() => {
            const p = posts.find((x) => x.id === focusedPostId);
            return p ? <CommunityPostCard post={p} isAdmin={isAdmin} isOwner={user?.id === p.created_by_id} user={user} onDelete={handleDeletePost} focused onFocus={() => setFocusedPostId(null)} onCommentIntent={requestComment} /> : null;
          })()
        ) : sortedPosts.length === 0 ? (
          <div className="community-empty">
            <div className="community-empty-icon"><Heart className="w-6 h-6" /></div>
            <h3>{t("community.empty")}</h3>
            
            {isAuthenticated && !isBanned && <button onClick={requestPost} className="community-primary-button"><PenLine className="w-4 h-4" />{t("community.writePlaceholder")}</button>}
          </div>
        ) : (
          sortedPosts.map((post) => (
            <CommunityPostCard key={post.id} post={post} isAdmin={isAdmin} isOwner={user?.id === post.created_by_id} user={user} onDelete={handleDeletePost} onFocus={() => setFocusedPostId(post.id)} onCommentIntent={requestComment} />
          ))
        )}
      </div>

        </div>
      )}

      {accessModal && (
        <div className="community-modal-layer" role="dialog" aria-modal="true" aria-labelledby="community-access-title">
          <div className="community-modal-backdrop" />
          <div className="community-modal-card community-access-modal">
            <div className="community-modal-icon"><LogIn className="h-5 w-5" /></div>
            <span className="community-modal-kicker">SafeSpace Community</span>
            <h2 id="community-access-title">{accessModal.type === "post" ? t("community.accessPostTitle") : t("community.accessCommentTitle")}</h2>
            <p>{t("community.accessDesc")}</p>
            <div className="community-modal-actions">
              <button onClick={() => navigate("/login")} className="community-primary-button"><LogIn className="h-4 w-4" />{t("community.login")}</button>
              <button onClick={continueAsGuest} className="community-secondary-button">{t("community.guestContinue")}</button>
            </div>
          </div>
        </div>
      )}

      {guestInfo && (
        <div className="community-modal-layer" role="dialog" aria-modal="true" aria-labelledby="community-guest-title">
          <div className="community-modal-backdrop" />
          <div className="community-modal-card">
            <div className="community-modal-icon"><Heart className="h-5 w-5" /></div>
            <span className="community-modal-kicker">SafeSpace Community</span>
            <h2 id="community-guest-title">{t("community.guestTitle")}</h2>
            <p>{t("community.guestDesc")}</p>
            <button onClick={acknowledgeGuestInfo} className="community-primary-button w-full">{t("community.ok")}</button>
          </div>
        </div>
      )}

      {policyOpen && (
        <div className="community-modal-layer" role="dialog" aria-modal="true" aria-labelledby="community-policy-title">
          <div className="community-modal-backdrop" />
          <div className="community-modal-card community-policy-modal">
            <div className="community-modal-icon"><Heart className="h-5 w-5" /></div>
            <span className="community-modal-kicker">SafeSpace Community</span>
            <h2 id="community-policy-title">{t("community.policyTitle")}</h2>
            <p className="community-policy-lead">{t("community.policyLead")}</p>
            <div className="community-policy-scroll" onScroll={handlePolicyScroll}>
<ReactMarkdown
                components={{
                  h1: ({children}) => <h3 className="community-policy-md-title">{children}</h3>,
                  h2: ({children}) => <h3 className="community-policy-md-title">{children}</h3>,
                  h3: ({children}) => <h3 className="community-policy-md-title">{children}</h3>,
                  p: ({children}) => <p>{children}</p>,
                  ul: ({children}) => <ul>{children}</ul>,
                  ol: ({children}) => <ol>{children}</ol>,
                  li: ({children}) => <li>{children}</li>,
                  blockquote: ({children}) => <blockquote>{children}</blockquote>,
                  strong: ({children}) => <strong>{children}</strong>,
                }}
              >
                # SafeSpace Community Policy
**Version 1.0 — Community Guidelines and Terms of Participation**

**Last updated:** September 2026

Welcome to the SafeSpace Community.

The SafeSpace Community is designed to provide a place where people can share experiences, talk about everyday difficulties, encourage one another, and learn from different perspectives in a respectful environment.

Because conversations in this community may involve personal experiences, stress, emotions, relationships, school, family, or mental wellbeing, we place particular importance on **respect, privacy, safety, and responsible communication**.

By selecting **“Agree and Continue”**, you confirm that you have read and understood this policy and agree to follow it when using the Community.

---

# 1. About the SafeSpace Community

The Community is a social discussion feature within SafeSpace.

It allows users to:

- Read posts written by other users.
- Share their own experiences.
- Ask questions.
- Give encouragement.
- Discuss everyday experiences.
- Comment on posts.
- React to posts.
- Participate in community discussions.
- Use available wellbeing tools.

The Community is intended to support **peer-to-peer conversation and sharing**.

It is not intended to replace:

- A doctor.
- A psychologist.
- A psychiatrist.
- A counselor.
- A teacher or school counselor.
- A parent or guardian.
- Emergency services.
- Professional mental-health treatment.

Information or opinions posted by community members should not automatically be treated as professional advice.

---

# 2. Who Can Use the Community

SafeSpace may be used by people of different ages and backgrounds.

Because the Community may include younger users, everyone is expected to communicate in a way that is appropriate for a general and youth-friendly environment.

Users must not use age, anonymity, or the online nature of the platform as a reason to behave in a way that could place another person at risk.

The Community is **not a dating service** and should not be used to seek romantic, sexual, or private relationships with other users.

---

# 3. Guest Access

Users who are not signed in may still access publicly available Community content.

Guest users may:

- Read posts.
- Read comments.
- Browse Community categories.
- Use available public wellbeing features.
- Learn about the Community.

Guest users cannot:

- Create posts.
- Comment on posts.
- Perform actions that require an authenticated account.

If a guest attempts to post or comment, SafeSpace will explain that an account is required.

Choosing Guest access does not create an account or grant permission to bypass Community restrictions.

---

# 4. Account Responsibility

Users are responsible for activity performed through their account.

Users should:

- Keep their login credentials private.
- Avoid sharing passwords.
- Log out when using a shared device.
- Avoid allowing other people to use their account.
- Provide accurate information where information is required by the service.
- Follow this Community Policy.

Users should contact SafeSpace if they believe someone has gained unauthorized access to their account.

SafeSpace may take action against an account when there is evidence of abuse, regardless of whether the account owner personally performed the activity.

---

# 5. Be Respectful

The most important rule of the Community is simple:

> **Treat other people as people, not as targets.**

Users may disagree with one another.

Disagreement itself is not a violation.

However, disagreements should remain respectful.

Users should avoid:

- Insults.
- Personal attacks.
- Mocking someone for their feelings.
- Ridiculing someone's experiences.
- Deliberately embarrassing another user.
- Threatening another user.
- Harassing another user.
- Repeatedly targeting a particular user.
- Encouraging other people to attack or harass someone.

You may disagree with someone's opinion without attacking the person who expressed it.

---

# 6. Bullying and Harassment

SafeSpace does not permit bullying or harassment.

Harassment can include repeated unwanted behavior intended to intimidate, humiliate, pressure, or distress another user.

Examples include:

- Repeatedly insulting someone.
- Following someone from post to post to provoke them.
- Encouraging others to target a particular user.
- Repeatedly responding to someone after they have clearly asked you to stop.
- Threatening another user.
- Deliberately spreading personal information about another user.
- Creating posts specifically to humiliate another person.

A single disagreement is not automatically harassment.

Moderation may consider the **context, frequency, intent, and overall pattern of behavior** when reviewing a report.

---

# 7. Hate and Discrimination

The Community must remain welcoming to people from different backgrounds.

Users must not attack, threaten, or encourage discrimination against people based on characteristics such as:

- Race.
- Ethnicity.
- Nationality.
- Religion.
- Disability.
- Gender.
- Sexual orientation.
- Age.
- Other protected or personal characteristics.

Users may discuss difficult social issues or express opinions about ideas, policies, or experiences.

However, discussion should not become an excuse for targeting or demeaning another person or group.

---

# 8. Privacy and Personal Information

**Think carefully before sharing personal information.**

The Community is not the appropriate place to publish sensitive information about yourself or another person.

Users should avoid posting:

- Full names when unnecessary.
- Home addresses.
- Phone numbers.
- Passwords.
- Account credentials.
- School identification numbers.
- Government identification numbers.
- Financial information.
- Precise locations.
- Private conversations without permission.
- Private photographs of another person without permission.
- Information that could allow someone to identify or locate another person.

Do not ask another user for sensitive personal information.

For example, asking someone to publicly provide their phone number, home address, school location, or private social-media account is inappropriate.

---

# 9. Protecting Other People's Privacy

You must not publish someone else's private information simply because you know it.

This includes information obtained:

- In person.
- Through school.
- Through social media.
- Through private messages.
- Through another website.
- From friends.
- From screenshots.
- From leaked or accidentally exposed information.

If another person shares something with you privately, that does not automatically give you permission to publish it in SafeSpace.

---

# 10. Appropriate Posts and Discussions

Users are encouraged to share experiences that can contribute positively to the Community.

Examples include:

- “I've been feeling stressed about school lately. How do you manage your workload?”
- “I had a difficult week and wanted somewhere to talk about it.”
- “What helps you relax after a stressful day?”
- “I found this way of organizing my homework useful.”
- “I hope everyone who is having a difficult week gets some rest.”

Users can talk honestly about difficult emotions.

The goal is not to force everyone to be positive all the time.

People are allowed to have difficult days.

What matters is that discussions remain respectful and do not create unnecessary risk for other users.

---

# 11. Mental-Health Discussions

Mental-health experiences can be discussed in the Community.

However, users should remember that another person's experience may be very different from their own.

When responding to someone, it is generally better to:

- Listen.
- Show understanding.
- Encourage appropriate support.
- Share personal experience carefully.
- Respect differences between people.

Users should avoid presenting themselves as a professional when they are not one.

For example, users should not confidently diagnose another person based on a post.

Statements such as:

> “You definitely have a particular disorder.”

or

> “You don't need professional help.”

can be misleading and should be avoided.

A personal experience can be shared as an experience rather than presented as a universal medical fact.

---

# 12. Medical and Mental-Health Advice

Community members may share information about things that helped them.

However, personal experience is not necessarily appropriate advice for someone else.

Users should not:

- Diagnose other users.
- Tell someone to stop prescribed treatment.
- Claim that a particular treatment is guaranteed to work.
- Present personal experience as professional medical advice.
- Discourage someone from seeking appropriate professional help.
- Make promises about someone's health or recovery.

When a situation appears serious or outside the scope of ordinary peer discussion, users should encourage the person to speak with a trusted adult, qualified professional, or appropriate service.

---

# 13. Dangerous or Harmful Content

The Community must not be used to encourage users to participate in dangerous behavior.

This includes content that encourages:

- Dangerous challenges.
- Harmful experimentation.
- Unsafe use of substances.
- Dangerous activities.
- Deliberately putting another person in danger.
- Instructions intended to facilitate serious harm.

Content may be removed when it presents a meaningful safety risk even if the poster claims that it was intended as a joke.

---

# 14. Sexual and Inappropriate Content

SafeSpace is intended to remain appropriate for younger users.

The Community must not be used for:

- Sexual content.
- Sexual solicitation.
- Sexualized interactions involving minors.
- Requests for intimate photographs.
- Sharing intimate photographs without permission.
- Sexual roleplay.
- Sexual services or offers.
- Attempts to move young users into inappropriate private interactions.

Users should never pressure another person to provide photographs or personal information.

Any interaction that appears to place a young person at risk may be treated as a serious Community Policy concern.

---

# 15. Dating and Private Relationships

SafeSpace is not a dating platform.

Users should not use the Community to:

- Search for romantic partners.
- Pressure another user into a relationship.
- Request private contact information.
- Repeatedly ask someone to move a conversation to another platform.
- Manipulate another user into sharing private information.
- Pursue romantic or sexual interactions with younger users.

Friendly conversation is allowed.

The distinction is that the Community exists for **support and discussion**, not relationship-seeking.

---

# 16. Threats and Safety Concerns

Threatening another person is not permitted.

This includes:

- Direct threats.
- Threats against another person's property.
- Threats intended to intimidate.
- Encouraging others to threaten someone.
- Publishing information with the apparent purpose of enabling someone to be targeted.

If a situation appears to involve an immediate safety concern, SafeSpace may prioritize safety over ordinary Community interactions and may restrict relevant content or accounts.

---

# 17. Spam and Repeated Content

The Community should remain useful and readable.

Users must not intentionally flood the Community with:

- Repeated posts.
- Repeated comments.
- Advertising.
- Promotional messages.
- Automated messages.
- Unrelated links.
- Repeated requests for attention.
- Content copied repeatedly into multiple discussions.

SafeSpace may apply posting limits to reduce spam.

For example, ordinary accounts may have a limit of **2 posts within a 30-minute period**.

This limit is a technical safeguard and does not replace the Community Policy.

---

# 18. Advertising and Promotion

The Community is not intended to function as an advertising platform.

Users should not use ordinary Community posts to promote:

- Products.
- Services.
- Websites.
- Referral links.
- Paid programs.
- Unrelated social-media accounts.
- Commercial opportunities.

Relevant educational resources may be shared when appropriate to the discussion, provided that they are not being used primarily for promotion.

---

# 19. Misleading Information

Users should make a reasonable effort not to deliberately spread false or misleading information.

This is particularly important when discussing:

- Health.
- Mental health.
- Safety.
- Medical treatment.
- Emergency situations.

Users may share personal opinions and experiences.

However, intentionally presenting an unverified claim as a guaranteed fact can be harmful.

SafeSpace may remove content that creates a significant safety risk because of misleading information.

---

# 20. Links and External Websites

Users should be careful when clicking links shared by other users.

SafeSpace cannot guarantee the safety, accuracy, availability, or privacy practices of every external website.

Users should avoid sharing suspicious links, malicious files, scams, or links intended to collect another person's private information.

SafeSpace may remove links that appear to create a security or safety risk.

---

# 21. Copyright and Ownership

Users should respect the rights of creators.

Do not upload or reproduce material that you do not have permission to use when doing so would violate another person's rights.

This includes:

- Artwork.
- Photographs.
- Videos.
- Written material.
- Private messages.
- Other copyrighted content.

Users should not claim another person's work as their own.

If you share something created by someone else, provide appropriate attribution where applicable.

---

# 22. Impersonation

Users must not pretend to be:

- Another SafeSpace user.
- A teacher.
- A counselor.
- A medical professional.
- A SafeSpace administrator.
- Another real person.

Users should not create misleading accounts intended to deceive other members.

Parody or clearly fictional content should not be presented in a way that could reasonably cause users to believe it is an official account.

---

# 23. Reporting Content

If you believe a post or comment violates this policy, use the available reporting feature.

A report should provide enough information for the moderators to understand the concern.

You do not need to confront the person yourself.

Reports should not be used simply because:

- You disagree with someone's opinion.
- You dislike someone's personality.
- Someone disagreed with you.
- Someone gave you an answer you did not like.

Reports are intended to identify genuine Community Policy or safety concerns.

---

# 24. False or Abusive Reports

The reporting system should not be used as a tool for harassment.

Repeatedly submitting intentionally false reports against another user may itself be considered misuse of the Community.

SafeSpace may consider patterns of abusive reporting when taking moderation action.

---

# 25. Moderation

SafeSpace may review content that:

- Has been reported.
- Appears to violate this policy.
- Creates a significant safety concern.
- Appears to involve spam or abuse.
- Requires investigation following a moderation event.

Moderation decisions may consider:

- The content itself.
- The surrounding conversation.
- Previous behavior where relevant.
- Whether the behavior was repeated.
- The potential impact on other users.
- The seriousness of the violation.

A single word or phrase should not always be considered in isolation.

---

# 26. Possible Moderation Actions

Depending on the situation, SafeSpace may:

1. Leave the content available.
2. Ask the user to modify the content.
3. Remove a post.
4. Remove a comment.
5. Restrict certain Community functions.
6. Temporarily restrict an account.
7. Suspend an account.
8. Ban an account.

The action taken may depend on the seriousness and frequency of the behavior.

Severe violations may result in stronger action without multiple warnings.

---

# 27. Repeat Violations

Repeatedly violating the Community Policy may result in progressively stronger restrictions.

For example, an account that repeatedly posts prohibited content after receiving warnings may receive restrictions or suspension.

Creating another account to deliberately avoid an existing restriction may itself be treated as a policy violation.

---

# 28. Appeals and Contact

If a user believes moderation action was made incorrectly, they should be able to contact SafeSpace through the available administrator/contact channel.

An appeal should explain:

- What action occurred.
- Why the user believes it was incorrect.
- Any relevant context.

Appeals should not contain threats, harassment, or unrelated content.

SafeSpace may review an appeal and determine whether the original action should remain, change, or be reversed.

---

# 29. Privacy Does Not Mean Complete Anonymity

Users should not assume that posting anonymously means that their activity is completely untraceable.

SafeSpace may maintain technical information necessary to operate, secure, and protect the service, subject to its applicable privacy practices.

Users should therefore avoid posting sensitive personal information even when using an anonymous display name.

**Anonymous posting is not a guarantee of complete anonymity.**

---

# 30. Community Content and SafeSpace

Posts and comments are created by users.

A user's post does not necessarily represent the views of SafeSpace.

SafeSpace does not automatically endorse:

- Opinions.
- Experiences.
- Medical claims.
- Advice.
- Recommendations.
- Statements made by community members.

Users should evaluate information carefully.

---

# 31. No Guarantee of a Completely Risk-Free Community

SafeSpace will take reasonable steps within the capabilities of the platform to maintain a respectful Community.

However, no online community can guarantee that every inappropriate post, comment, or interaction will be detected immediately.

Content may sometimes remain visible until it is reported or identified through moderation.

If you encounter something concerning, reporting it helps SafeSpace identify the issue.

---

# 32. Protecting Young Users

Because SafeSpace may be used by young people, additional care should be taken when interacting with other users.

Do not:

- Ask another young person for their private contact information.
- Ask for private photographs.
- Encourage someone to meet you privately.
- Pressure someone to leave SafeSpace for another platform.
- Attempt to discover someone's school or home location.
- Manipulate another user into revealing personal information.
- Use emotional vulnerability to pressure another user.

If a conversation begins to make you uncomfortable, you do not have to continue it.

---

# 33. When You Need Help

The Community can provide conversation and peer support, but it cannot replace professional assistance.

If you are dealing with something that feels too difficult to manage alone, consider speaking with:

- A parent or guardian.
- A trusted teacher.
- A school counselor.
- A qualified mental-health professional.
- Another trusted adult.

In Thailand, the **Department of Mental Health hotline 1323** is available for mental-health support.

If there is an immediate emergency or someone is in immediate danger, contact the appropriate emergency service rather than waiting for a Community response.

---

# 34. Respect for Different Experiences

There is no single experience that represents everyone.

Two people can experience the same situation differently.

Users should therefore avoid statements such as:

> “Everyone feels this way.”

or

> “Your problem isn't serious.”

Instead, allow people to describe their own experiences.

A person's feelings do not need to be identical to yours for them to deserve respect.

---

# 35. Constructive Disagreement

Healthy disagreement is allowed.

A useful disagreement focuses on the **idea**, rather than attacking the person.

For example:

**Acceptable:**

> “I had a different experience with that. For me, it worked differently because…”

**Not acceptable:**

> “You're stupid for thinking that.”

The goal is not to eliminate disagreement.

The goal is to prevent disagreement from becoming personal abuse.

---

# 36. Community Culture

SafeSpace aims to build a culture where users can:

**Listen before judging.  
Share without pressuring.  
Disagree without attacking.  
Protect each other's privacy.  
Ask for help when needed.  
Give support without pretending to be a professional.**

A good Community is not one where everyone agrees.

It is one where people can participate without being afraid of being mocked, attacked, or exploited.

---

# 37. Changes to This Policy

SafeSpace may update this policy as the Community develops.

Changes may be made to:

- Improve user safety.
- Clarify existing rules.
- Address new types of abuse.
- Reflect changes to Community features.
- Improve moderation procedures.
- Comply with applicable requirements.

When significant changes are made, SafeSpace may require users to review and accept the updated policy before continuing to use posting or commenting features.

The version and update date should be displayed whenever the policy is presented.

---

# 38. Agreement

Before posting or commenting, users must confirm that they have read this policy.

By selecting:

### **“ตกลงและดำเนินการต่อ”**

you confirm that:

- You have read the Community Policy.
- You understand the rules.
- You agree to follow the policy.
- You understand that violations may result in moderation action.
- You understand that SafeSpace Community content is created by users.
- You understand that SafeSpace is not a replacement for professional or emergency services.

---

## SafeSpace Community

**แบ่งปันอย่างปลอดภัย • รับฟังอย่างเคารพ • ดูแลกันและกัน**

This policy is intended to make the Community a place where people can talk honestly while still respecting the safety, privacy, and dignity of everyone who uses SafeSpace.
              </ReactMarkdown>
            </div>
            <button onClick={acceptCommunityPolicy} disabled={!policyScrolled} className="community-primary-button w-full disabled:opacity-40 disabled:cursor-not-allowed">
              {policyScrolled ? t("community.policyAccept") : t("community.policyScroll")}
            </button>
          </div>
        </div>
      )}

      <BreathingExerciseModal open={breathingOpen} onClose={() => setBreathingOpen(false)} />
      <GroundingModal open={groundingOpen} onClose={() => setGroundingOpen(false)} />
    </div>
  );
}