from pathlib import Path

i18n = Path("src/lib/i18n.jsx")
s = i18n.read_text()
old = '"home.subtitle": "แอปพลิเคชันที่ช่วยให้เยาวชนไทยเข้าใจสุขภาพจิตของตนเอง ผ่านแบบประเมินอัจฉริยะ พื้นที่แบ่งปัน และสายด่วนที่พึ่งพาได้",'
new = '"home.subtitle": "แอปพลิเคชันที่ช่วยให้เยาวชนไทยเข้าใจสุขภาพจิตของตนเอง พูดคุย และสายด่วนรวมถึงให้ข้อมูลพึ่งพาได้",'
if old not in s:
    raise SystemExit("home subtitle not found")
i18n.write_text(s.replace(old, new, 1))

result = Path("src/pages/AssessmentResult.jsx")
s = result.read_text()
old = '{result.depression_chance && <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800"><div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center"><Brain className="w-4 h-4 text-purple-300" /></div><h2 className="text-sm font-semibold text-slate-100">{t("result.aiAnalysis")}</h2></div><div className="text-xs text-slate-500 mb-1">{t("result.depressionChance")}</div><p className="text-sm text-slate-300 leading-relaxed">{result.depression_chance}</p></div>}'
new = '''{result.depression_chance && <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800"><div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center"><Brain className="w-4 h-4 text-purple-300" /></div><h2 className="text-sm font-semibold text-slate-100">{t("result.aiAnalysis")}</h2></div><div className="text-xs text-slate-500 mb-1">{lang === "en" ? "Screening-based estimate" : "แนวโน้มจากแบบประเมิน"}</div><p className="text-sm text-slate-300 leading-relaxed">{result.depression_chance}</p></div>}
      <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20"><p className="text-xs text-amber-200 leading-relaxed">{lang === "en" ? "Important: This result is only an initial screening estimate based on your answers. It is not a medical diagnosis and cannot confirm any mental health condition. If your concerns continue or affect daily life, consider talking with a trusted adult or qualified mental health professional." : "หมายเหตุสำคัญ: ผลลัพธ์นี้เป็นเพียงการประเมินเบื้องต้นจากคำตอบของคุณ ไม่ใช่การวินิจฉัยทางการแพทย์ และไม่สามารถยืนยันว่าคุณมีภาวะทางสุขภาพจิตใด ๆ ได้ หากความกังวลหรือความรู้สึกต่าง ๆ ยังคงต่อเนื่องหรือส่งผลต่อชีวิตประจำวัน ควรพูดคุยกับผู้ใหญ่ที่ไว้ใจได้หรือผู้เชี่ยวชาญด้านสุขภาพจิต"}</p></div>'''
if old not in s:
    raise SystemExit("assessment result block not found")
result.write_text(s.replace(old, new, 1))
