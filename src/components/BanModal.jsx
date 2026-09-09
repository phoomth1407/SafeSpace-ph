import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, UserX, ShieldCheck, Ban } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTranslation } from "@/lib/i18n";

export default function BanModal({ userId, onClose }) {
  const { t, lang } = useTranslation();
  const [u, setU] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banning, setBanning] = useState(false);
  const [banDuration, setBanDuration] = useState("permanent");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    base44.entities.User.get(userId)
      .then(setU)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleBan = async () => {
    setBanning(true);
    try {
      if (u.banned) {
        await base44.functions.invoke("manageBan", { target_id: userId, banned: false, banned_until: null });
        setU({ ...u, banned: false, banned_until: null });
      } else {
        let bannedUntil = null;
        if (banDuration !== "permanent") {
          const days = parseInt(banDuration);
          const d = new Date();
          d.setDate(d.getDate() + days);
          bannedUntil = d.toISOString();
        }
        await base44.functions.invoke("manageBan", { target_id: userId, banned: true, banned_until: bannedUntil });
        setU({ ...u, banned: true, banned_until: bannedUntil });
      }
    } catch {}
    setBanning(false);
  };

  return (
    <AnimatePresence>
      {userId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">{t("ban.title")}</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              </div>
            ) : u ? (
              <>
                <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium text-foreground">
                      {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {u.full_name || u.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    {u.banned && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 mt-0.5 inline-block">
                        {t("ban.banned")}
                        {u.banned_until && ` · ${new Date(u.banned_until).toLocaleDateString(lang === "en" ? "en-US" : "th-TH", { day: "numeric", month: "short" })}`}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  {u.banned ? t("ban.unbanConfirm") : t("ban.confirm")}
                </p>

                {!u.banned && (
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <span className="text-xs text-muted-foreground">{t("admin.banDuration")}</span>
                    {[
                      { id: "1", label: t("admin.ban.1day") },
                      { id: "7", label: t("admin.ban.7days") },
                      { id: "30", label: t("admin.ban.30days") },
                      { id: "permanent", label: t("admin.ban.permanent") },
                    ].map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setBanDuration(d.id)}
                        className={`text-xs px-3 py-1 rounded-full transition-colors ${
                          banDuration === d.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="flex-1 text-sm text-muted-foreground px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
                  >
                    {t("community.cancel")}
                  </button>
                  <button
                    onClick={handleBan}
                    disabled={banning}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40 ${
                      u.banned
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    }`}
                  >
                    {banning ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : u.banned ? (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        {t("ban.unban")}
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4" />
                        {t("ban.ban")}
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t("ban.notFound")}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
