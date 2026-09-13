// ระบบกรองคำหยาบคายและคำด่า/คำสบประมาท (ไทย + อังกฤษ) — ใช้ร่วมกันระหว่าง backend functions
// หากตรวจพบคำหยาบ จะปฏิเสธเนื้อหา

const THAI_PROFANITY = [
  // คำหยาบคาย
  "ควย", "ควาย", "เหี้ย", "หี", "สัส", "สัด", "เสือก", "เย็ด", "เย็ดหี", "หีบัก",
  "มึง", "กู", "อี", "อ้วน", "ตอแหล", "แม่ง", "แม่มึง", "พ่อมึง", "ไอ้", "อีตอก",
  "ชาติหมา", "ชาติหน้า", "หมาห์", "หมา", "สถุน", "ส้นตีน", "ระยำ", "เลว", "ตัวกาก",
  "อีดอก", "อีกะหรี่", "กะหรี่", "ดอกท", "ดอก", "หีเหม็น", "เย็ดกัน", "เย็ดแม่",
  "กระหรี่", "มานี่", "มาเนี่ย", "อีมา", "ไอ้มา", "ควายเด็ก", "หน้าหี", "หีบา",
  "อีช้าง", "อีควาย", "ไอ้ควาย", "อีหี", "หีแหก", "เย็ดแม่มึง", "เย็ดพ่อ",
  "แม่งเอ้ย", "หีสัด", "สัดหี", "เสือกเข้ามา", "ไอ้สัส", "อีสัส", "แม่ควาย",
  // คำด่า/สบประมาท/ดูถูก
  "ปัญญาอ่อน", "ปัญญาทราม", "กระจอก", "งี่เง่า", "เลวทราม", "ต่ำช้า", "ชิงหาหาย",
  "ตายาย", "ตัวกาก", "จัญไร", "ชั่วช้า", "อัปรีย์", "อัปลักษณ์", "น่าสมเพช",
  "ตัวแสบ", "ไร้ค่า", "หน้าด้าน", "หน้าทึบ", "ปากหมา", "เด็กหมา", "หมาจรจัด",
  "หมาเห่าเคราะห์", "บ้าหมา", "บ้าเริ่น", "เสียจริต", "วิกลจริต", "คนบ้า",
  "ไอ้บ้า", "อีบ้า", "หน้าโง่", "โง่หัวหด", "ไร้ปัญญา", "หัวกะโหลก",
  "ขี้นก", "ขี้เรื้อน", "สภาพแย่", "หน้าเหี้ย", "เฮี้ย", "เพี้ยน", "ตัวตด",
  "หน้าหนา", "หน้าเนื้อ", "หลังแข็ง", "อวดเก่ง", "อวดดี", "ขยะแห้ง",
  "อีจ้าว", "ไอ้จ้าว", "พ่อตาย", "แม่ตาย", "พ่องแม่ง",
];

const ENGLISH_PROFANITY = [
  // Profanity
  "fuck", "fucking", "fucker", "motherfucker", "shit", "bullshit", "bitch",
  "asshole", "dick", "dickhead", "pussy", "cunt", "whore", "slut",
  "bastard", "damn", "goddamn", "wanker", "prick", "twat", "cock", "sucker",
  "retard", "retarded", "nigger", "nigga", "fag", "faggot", "dyke", "homo",
  "jackass", "dumbass", "dipshit", "horseshit", "dipstick",
  // Insults / mockery
  "idiot", "stupid", "moron", "loser", "pathetic", "worthless", "scum",
  "freak", "creep", "psycho", "lunatic", "brain-dead", "trash", "garbage",
  "ugly", "dumb", "fail", "lame", "ridicule", "mock", "despise",
  "kill yourself", "go die", "drop dead", "shut up", "nobody cares",
  "you're trash", "you're garbage", "you're worthless", "you're pathetic",
  "nobody likes you", "nobody loves you", "go away", "get lost",
];

const ALL_PROFANITY = [...THAI_PROFANITY, ...ENGLISH_PROFANITY].map((w) => w.toLowerCase());

// ตรวจสอบคำหยาบแบบ substring (ทนต่อการเว้นวรรค/สะกดหลวม)
export function containsProfanity(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  const lower = text.toLowerCase();
  return ALL_PROFANITY.some((word) => lower.includes(word));
}

export function getProfanityError(lang: string): string {
  return lang === "en"
    ? "Your post contains inappropriate or insulting language. Please revise and try again."
    : "เนื้อหาของคุณมีคำหยาบคายหรือคำสบประมาท กรุณาแก้ไขแล้วโพสต์ใหม่อีกครั้ง";
}
