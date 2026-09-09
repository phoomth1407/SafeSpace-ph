// PHQ-9 screening helpers. This is a screening aid, not a diagnosis.
export const PHQ9_OPTIONS = [
  { value: 0, th: "ไม่เลย", en: "Not at all" },
  { value: 1, th: "หลายวัน", en: "Several days" },
  { value: 2, th: "มากกว่าครึ่งหนึ่งของวัน", en: "More than half the days" },
  { value: 3, th: "เกือบทุกวัน", en: "Nearly every day" },
];

export const PHQ9_QUESTIONS = [
  { id: 1, th: "ในช่วง 2 สัปดาห์ที่ผ่านมา คุณมีความสนใจหรือความเพลิดเพลินในการทำสิ่งต่าง ๆ ลดลงหรือไม่?", en: "Over the last 2 weeks, how often have you had little interest or pleasure in doing things?" },
  { id: 2, th: "ในช่วง 2 สัปดาห์ที่ผ่านมา คุณรู้สึกหดหู่ เศร้า หรือสิ้นหวังหรือไม่?", en: "Over the last 2 weeks, how often have you felt down, depressed, or hopeless?" },
  { id: 3, th: "ในช่วง 2 สัปดาห์ที่ผ่านมา คุณมีปัญหาเกี่ยวกับการนอนหลับ เช่น หลับยาก หลับไม่สนิท หรือหลับมากเกินไปหรือไม่?", en: "Over the last 2 weeks, how often have you had trouble falling or staying asleep, or sleeping too much?" },
  { id: 4, th: "ในช่วง 2 สัปดาห์ที่ผ่านมา คุณรู้สึกเหนื่อยหรือมีพลังงานน้อยหรือไม่?", en: "Over the last 2 weeks, how often have you felt tired or had little energy?" },
  { id: 5, th: "ในช่วง 2 สัปดาห์ที่ผ่านมา คุณเบื่ออาหารหรือกินมากเกินไปหรือไม่?", en: "Over the last 2 weeks, how often have you had poor appetite or overeaten?" },
  { id: 6, th: "ในช่วง 2 สัปดาห์ที่ผ่านมา คุณรู้สึกไม่ดีกับตัวเอง รู้สึกว่าตัวเองล้มเหลว หรือทำให้ตัวเองหรือครอบครัวผิดหวังหรือไม่?", en: "Over the last 2 weeks, how often have you felt bad about yourself—or that you are a failure or have let yourself or your family down?" },
  { id: 7, th: "ในช่วง 2 สัปดาห์ที่ผ่านมา คุณมีปัญหาในการจดจ่อ เช่น อ่านหนังสือหรือดูโทรทัศน์หรือไม่?", en: "Over the last 2 weeks, how often have you had trouble concentrating on things, such as reading or watching television?" },
  { id: 8, th: "ในช่วง 2 สัปดาห์ที่ผ่านมา คุณเคลื่อนไหวหรือพูดช้าลงจนคนอื่นสังเกตได้ หรือในทางกลับกันรู้สึกกระสับกระส่ายมากกว่าปกติหรือไม่?", en: "Over the last 2 weeks, how often have you moved or spoken so slowly that other people could have noticed, or the opposite—being so fidgety or restless that you have been moving around a lot more than usual?" },
  { id: 9, th: "ในช่วง 2 สัปดาห์ที่ผ่านมา คุณมีความคิดว่าคุณคงจะดีกว่าถ้าไม่มีชีวิตอยู่ หรือคิดที่จะทำร้ายตัวเองหรือไม่?", en: "Over the last 2 weeks, how often have you had thoughts that you would be better off dead or of hurting yourself in some way?" },
];

export function getPhq9Band(score) {
  if (score <= 4) return "minimal";
  if (score <= 9) return "mild";
  if (score <= 14) return "moderate";
  if (score <= 19) return "moderately_severe";
  return "severe";
}

export function getPhq9BandLabel(score, lang = "th") {
  const labels = {
    minimal: { th: "น้อยมาก", en: "Minimal" },
    mild: { th: "เล็กน้อย", en: "Mild" },
    moderate: { th: "ปานกลาง", en: "Moderate" },
    moderately_severe: { th: "ค่อนข้างรุนแรง", en: "Moderately severe" },
    severe: { th: "รุนแรง", en: "Severe" },
  };
  const band = getPhq9Band(score);
  return labels[band][lang] || labels[band].th;
}

export function scorePhq9(answers) {
  const normalized = PHQ9_QUESTIONS.map((q) => {
    const raw = answers?.[q.id] ?? answers?.[String(q.id)] ?? 0;
    return Math.max(0, Math.min(3, Number(raw) || 0));
  });
  const score = normalized.reduce((sum, value) => sum + value, 0);
  return { score, band: getPhq9Band(score), answers: normalized };
}
