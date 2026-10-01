import React, { useState, useEffect } from "react";
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
import { COMMUNITY_POLICY_EN, COMMUNITY_POLICY_TH, COMMUNITY_POLICY_VERSION } from "@/lib/communityPolicy";
import PolicyConsentModal from "@/components/PolicyConsentModal";

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
      setPolicyAccepted((() => { try { const v = JSON.parse(localStorage.getItem(`safespace_community_policy_accepted:${user.id}`) || "null"); return v?.accepted === true && v?.version === COMMUNITY_POLICY_VERSION; } catch { return false; } })());
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
      try { localStorage.setItem(`safespace_community_policy_accepted:${user.id}`, JSON.stringify({ accepted: true, version: COMMUNITY_POLICY_VERSION, acceptedAt: new Date().toISOString() })); } catch {}
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

      <PolicyConsentModal
        open={policyOpen}
        title={lang === "en" ? "Before you post" : "ก่อนโพสต์"}
        lang={lang}
        popupContent={
          <div className="space-y-4">
            <p>{lang === "en" ? <>The SafeSpace Community is a user-created discussion area for sharing experiences and wellbeing-related conversations. It is <strong>not a private diary, dating service, medical service, therapist, or emergency service.</strong></> : <>ชุมชน SafeSpace เป็นพื้นที่สนทนาที่สร้างโดยผู้ใช้ สำหรับแบ่งปันประสบการณ์และพูดคุยเรื่องสุขภาวะ <strong>ไม่ใช่ไดอารี่ส่วนตัว บริการหาคู่ บริการทางการแพทย์ นักบำบัด หรือบริการฉุกเฉิน</strong></>}</p>
            <p>{lang === "en" ? "Community posts and comments are visible to users within the Community. An anonymous-style display name does not guarantee that your account, technical activity, or disclosed information cannot be associated with you." : "โพสต์และความคิดเห็นในชุมชนสามารถมองเห็นได้โดยผู้ใช้ในชุมชน การใช้ชื่อแบบนิรนามไม่ได้รับประกันว่าบัญชี กิจกรรมทางเทคนิค หรือข้อมูลที่เปิดเผยจะไม่สามารถเชื่อมโยงกลับมาหาคุณได้"}</p>
            <p>{lang === "en" ? "Do not post passwords or login codes, exact addresses or private contact details, government or school identification numbers, financial information, another person's private information, sexual or inappropriate material, harassment, threats, discrimination, impersonation, spam, or deliberately misleading content." : "ห้ามโพสต์รหัสผ่านหรือรหัสเข้าสู่ระบบ ที่อยู่แบบละเอียดหรือข้อมูลติดต่อส่วนตัว เลขประจำตัวของรัฐหรือโรงเรียน ข้อมูลทางการเงิน ข้อมูลส่วนตัวของผู้อื่น เนื้อหาทางเพศหรือไม่เหมาะสม การคุกคาม ข่มขู่ เลือกปฏิบัติ แอบอ้าง สแปม หรือข้อมูลที่ทำให้ผู้อื่นเข้าใจผิดโดยเจตนา"}</p>
            <p>{lang === "en" ? "Guests may read Community content but must sign in before posting or commenting. Ordinary users are currently limited to two successful non-announcement posts in a rolling 30-minute period." : "ผู้เยี่ยมชมอ่านเนื้อหาได้แต่ต้องเข้าสู่ระบบก่อนโพสต์หรือแสดงความคิดเห็น ปัจจุบันผู้ใช้ทั่วไปโพสต์สำเร็จที่ไม่ใช่ประกาศได้ไม่เกิน 2 โพสต์ในช่วงเวลา 30 นาทีแบบ rolling"}</p>
            <p>{lang === "en" ? <>Community content legal basis: <strong>[TO CONFIRM — developer/legal review required]</strong>. Privacy contact: <strong>[privacy contact email — to be filled in by the developer]</strong>.</> : <>ฐานทางกฎหมายสำหรับเนื้อหาชุมชน: <strong>[TO CONFIRM — ต้องตรวจสอบโดยผู้พัฒนา/ผู้เชี่ยวชาญ]</strong> ติดต่อเรื่องความเป็นส่วนตัว: <strong>[privacy contact email — to be filled in by the developer]</strong></>}</p>
            <p>{lang === "en" ? <>You have the right to complain to the Thai Personal Data Protection Committee (PDPC) at <strong>pdpc.or.th</strong> if you believe your personal data has been mishandled.</> : <>คุณมีสิทธิร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (PDPC) ที่ <strong>pdpc.or.th</strong> หากเชื่อว่าข้อมูลส่วนบุคคลของคุณถูกจัดการอย่างไม่เหมาะสม</>}</p>
            <p>{lang === "en" ? "Emergency support in Thailand: 1669 medical emergency; 1323 Department of Mental Health hotline; 1300 MSDHS social assistance line, especially for children and young people." : "ช่องทางฉุกเฉินในประเทศไทย: 1669 เหตุฉุกเฉินทางการแพทย์; 1323 สายด่วนสุขภาพจิต กรมสุขภาพจิต; 1300 สายด่วนช่วยเหลือสังคม พม. โดยเฉพาะเด็กและเยาวชน"}</p>
          </div>
        }
        fullPolicy={lang === "en" ? COMMUNITY_POLICY_EN : COMMUNITY_POLICY_TH}
        requiredConsents={[
          { id: "policy", label: lang === "en" ? "I have read and agree to the Community Policy." : "ฉันได้อ่านและยอมรับ Community Policy" }
        ]}
        onAccept={() => {
          const action = pendingCommunityAction;
          if (isAuthenticated && user?.id) {
            try { localStorage.setItem(`safespace_community_policy_accepted:${user.id}`, "1"); } catch {}
            setPolicyAccepted(true);
          }
          setPendingCommunityAction(null);
          setPolicyOpen(false);
          if (action?.type === "enter") setIntroComplete(true);
          if (action?.type === "post") setShowForm(true);
          if (action?.type === "comment") setFocusedPostId(action.postId);
        }}
        onDecline={() => { setPolicyOpen(false); setPendingCommunityAction(null); }}
      />

      <BreathingExerciseModal open={breathingOpen} onClose={() => setBreathingOpen(false)} />
      <GroundingModal open={groundingOpen} onClose={() => setGroundingOpen(false)} />
    </div>
  );
}