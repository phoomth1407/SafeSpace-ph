// แบบประเมินสุขภาพจิต อ้างอิงกรอบ "ความสุขมวลรวม" — รองรับ 2 ภาษา (th / en)

export const assessmentCategories = [
  {
    id: "individual",
    title: { th: "ปัจเจกบุคคล", en: "Individual" },
    subtitle: { th: "พฤติกรรม สุขภาพ และทักษะชีวิต", en: "Behavior, health & life skills" },
    icon: "User",
    questions: {
      th: [
        { q: "ช่วง 2 สัปดาห์ที่ผ่านมา คุณรู้สึกเศร้า ท้อแท้ หรือหมดหวังบ่อยแค่ไหน?", options: ["ไม่เคยเลย", "บางครั้ง", "บ่อยครั้ง", "เกือบทุกวัน"] },
        { q: "คุณรู้สึกว่าตัวเองไม่มีคุณค่า หรือรู้สึกผิดเป็นประจำหรือไม่?", options: ["ไม่เคย", "นานๆ ครั้ง", "บ่อยครั้ง", "เกือบตลอดเวลา"] },
        { q: "คุณมีทักษะในการจัดการความเครียดหรือความโกรธไหม?", options: ["มีมาก รู้จักวิธีระบาย", "พอมีบ้าง", "ไม่ค่อยมี", "ไม่มีเลย ไม่รู้จะทำยังไง"] }
      ],
      en: [
        { q: "In the past 2 weeks, how often have you felt sad, exhausted, or hopeless?", options: ["Never", "Sometimes", "Often", "Almost every day"] },
        { q: "Do you often feel worthless or guilty?", options: ["Never", "Rarely", "Often", "Almost always"] },
        { q: "Do you have skills to manage stress or anger?", options: ["Yes, I know how to release it", "Somewhat", "Not much", "None at all, I don't know how"] }
      ]
    }
  },
  {
    id: "bullying",
    title: { th: "การถูกกลั่นแกล้ง", en: "Bullying" },
    subtitle: { th: "เครือข่ายการช่วยเหลือทางสังคม", en: "Social support network" },
    icon: "ShieldAlert",
    questions: {
      th: [
        { q: "คุณเคยถูกเพื่อนทำร้ายร่างกายรุนแรงหรือขู่ทำร้ายแค่ไหน?", options: ["ไม่เคย", "เคยนานๆ ครั้ง", "เคยบ่อยครั้ง", "เกิดขึ้นเป็นประจำ"] },
        { q: "คุณเคยถูกแซว ด่า หรือพูดจาไม่ดีจนรู้สึกแย่หรือไม่?", options: ["ไม่เคย", "นานๆ ครั้ง ไม่ได้รู้สึกแย่", "บ่อยครั้ง รู้สึกแย่", "ทุกวัน รู้สึกแย่มาก"] },
        { q: "คุณเคยถูกกลั่นแกล้งทางสื่อสังคมออนไลน์หรือไม่?", options: ["ไม่เคย", "เคยบ้าง", "เคยบ่อย", "เป็นประจำจนไม่อยากใช้โซเชียล"] }
      ],
      en: [
        { q: "How often have you been physically hurt or threatened by peers?", options: ["Never", "Rarely", "Often", "Regularly"] },
        { q: "Have you been teased, insulted, or spoken to badly until you felt bad?", options: ["Never", "Rarely, didn't feel bad", "Often, felt bad", "Every day, felt very bad"] },
        { q: "Have you been bullied on social media?", options: ["Never", "Sometimes", "Often", "Regularly, don't want to use social media"] }
      ]
    }
  },
  {
    id: "family",
    title: { th: "ครอบครัว", en: "Family" },
    subtitle: { th: "โครงสร้างทางสังคมและเครือข่ายช่วยเหลือ", en: "Social structure & support" },
    icon: "Home",
    questions: {
      th: [
        { q: "บรรยากาศในบ้านเป็นอย่างไร?", options: ["อบอุ่น คุยกันรู้เรื่อง", "ปกติ คุยกันได้บ้าง", "เครียด ทะเลาะกันบ่อย", "หนักมาก อยากหนีออกจากบ้าน"] },
        { q: "คุณมีคนในครอบครัวที่คุยด้วยได้เวลามีปัญหาหรือไม่?", options: ["มี คุยได้ทุกเรื่อง", "มีบ้าง แต่ไม่ทุกเรื่อง", "แทบไม่มี", "ไม่มีเลย"] },
        { q: "ครอบครัวมีปัญหาการเงินที่ส่งผลต่อคุณหรือไม่?", options: ["ไม่มีปัญหา", "มีบ้างแต่พอรับมือได้", "มีและเครียด", "มีหนักมาก ส่งผลต่อชีวิตประจำวัน"] }
      ],
      en: [
        { q: "What is the atmosphere at home like?", options: ["Warm, easy to talk", "Normal, talk sometimes", "Tense, argue often", "Very heavy, want to leave"] },
        { q: "Is there a family member you can talk to when you have problems?", options: ["Yes, about everything", "Sometimes, not everything", "Almost none", "None at all"] },
        { q: "Does your family have financial problems that affect you?", options: ["No problem", "Some, manageable", "Yes, stressful", "Very much, affects daily life"] }
      ]
    }
  },
  {
    id: "study",
    title: { th: "การเรียนและการศึกษา", en: "Study & Education" },
    subtitle: { th: "การมีปัญญา/การศึกษา", en: "Wisdom / education" },
    icon: "GraduationCap",
    questions: {
      th: [
        { q: "คุณรู้สึกกดดันเรื่องการเรียนมากแค่ไหน?", options: ["ไม่กดดันเลย", "กดดันบ้าง แต่รับมือได้", "กดดันมาก เครียดบ่อย", "กดดันจนอยากเลิกเรียน"] },
        { q: "คุณรู้สึกว่าตัวเองเรียนไม่ทันหรือโง่กว่าเพื่อนหรือไม่?", options: ["ไม่รู้สึก", "นานๆ ครั้ง", "บ่อยครั้ง", "รู้สึกแบบนั้นตลอดเวลา"] },
        { q: "คุณมีเป้าหมายในอนาคตหรือความฝันที่อยากทำไหม?", options: ["มีชัดเจน และกำลังทำ", "มี แต่ยังไม่ชัดเจน", "ไม่แน่ใจ ไม่รู้ว่าอยากเป็นอะไร", "ไม่มีเป้าหมาย ไม่สนใจอะไร"] }
      ],
      en: [
        { q: "How much pressure do you feel about studying?", options: ["None", "Some, manageable", "A lot, often stressed", "So much I want to quit"] },
        { q: "Do you feel you can't keep up or are less smart than peers?", options: ["No", "Rarely", "Often", "All the time"] },
        { q: "Do you have future goals or dreams?", options: ["Clear, working on them", "Yes, but unclear", "Unsure, don't know what", "No goals, don't care"] }
      ]
    }
  },
  {
    id: "social",
    title: { th: "เพื่อนและสังคม", en: "Friends & Society" },
    subtitle: { th: "เครือข่ายการช่วยเหลือทางสังคม", en: "Social support network" },
    icon: "Users",
    questions: {
      th: [
        { q: "คุณมีเพื่อนสนิทที่พึ่งพาได้เวลายากกี่คน?", options: ["มากกว่า 3 คน", "1-2 คน", "มีแต่ไม่สนิทจริง", "ไม่มีเลย"] },
        { q: "คุณรู้สึกโดดเดี่ยวหรือเหงาบ่อยแค่ไหน?", options: ["ไม่เคย", "นานๆ ครั้ง", "บ่อยครั้ง", "ตลอดเวลา"] },
        { q: "คุณรู้สึกว่ามีคนเข้าใจคุณจริงๆ ไหม?", options: ["มีหลายคน", "มีคนเดียว", "แทบไม่มี", "ไม่มีเลย"] }
      ],
      en: [
        { q: "How many close friends can you rely on in hard times?", options: ["More than 3", "1-2", "Some, not truly close", "None"] },
        { q: "How often do you feel lonely?", options: ["Never", "Rarely", "Often", "All the time"] },
        { q: "Do you feel someone truly understands you?", options: ["Many people", "One person", "Almost none", "None at all"] }
      ]
    }
  },
  {
    id: "health",
    title: { th: "สุขภาพและโภชนาการ", en: "Health & Nutrition" },
    subtitle: { th: "อาหารและโภชนาการ ทุนทางสุขภาพ", en: "Food & health capital" },
    icon: "Apple",
    questions: {
      th: [
        { q: "คุณนอนหลับเพียงพอไหม?", options: ["หลับสนิท 7-8 ชม.", "พอได้ แต่บางคืนน้อย", "นอนน้อย เพลียบ่อย", "นอนไม่ได้เกือบทุกคืน"] },
        { q: "คุณกินอาหารครบ 3 มื้อหรือไม่?", options: ["ครบทุกวัน", "ขาดบ้างบางมื้อ", "ขาดบ่อย", "แทบไม่กิน หรือกินไม่ลง"] },
        { q: "คุณมีอาการเจ็บป่วยที่รบกวนชีวิตประจำวันหรือไม่?", options: ["ไม่มี", "มีบ้าง ไม่มาก", "มี และรบกวนบ่อย", "มีหลายอย่าง ไม่ได้รับการรักษา"] }
      ],
      en: [
        { q: "Do you get enough sleep?", options: ["Sound 7-8 hrs", "Okay, some nights less", "Little, often tired", "Can't sleep most nights"] },
        { q: "Do you eat 3 meals a day?", options: ["Every day", "Miss some meals", "Often miss", "Hardly eat, or can't eat"] },
        { q: "Do you have illness that disrupts daily life?", options: ["No", "Some, not much", "Yes, often disruptive", "Many, untreated"] }
      ]
    }
  },
  {
    id: "lifeskills",
    title: { th: "ทักษะชีวิตและอารมณ์", en: "Life Skills & Emotions" },
    subtitle: { th: "พัฒนาการวัยเด็ก และความอยู่ดีมีสุข", en: "Childhood development & well-being" },
    icon: "Sparkles",
    questions: {
      th: [
        { q: "เวลาเจอปัญหา คุณจัดการอย่างไร?", options: ["คิดแก้ไขได้ ขอความช่วยเหลือได้", "พยายามคิด แต่บางครั้งท้อ", "หลีกเลี่ยง ไม่อยากรับมือ", "ปล่อยผ่าน รู้สึกช่วยตัวเองไม่ได้"] },
        { q: "คุณเคยคิดอยากทำร้ายตัวเองหรือไม่?", options: ["ไม่เคย", "เคยคิดบ้างแต่ไม่ทำ", "เคยคิดบ่อย", "เคยคิดและเคยทำ"] },
        { q: "คุณรู้สึกว่าชีวิตในอนาคตยังมีความหวังหรือไม่?", options: ["มีความหวัง อยากสู้ต่อ", "มีบ้าง แต่ไม่มาก", "ไม่แน่ใจ", "ไม่เห็นความหวังเลย"] }
      ],
      en: [
        { q: "When facing a problem, how do you handle it?", options: ["Can solve, can ask for help", "Try, but sometimes give up", "Avoid, don't want to face it", "Let it go, feel helpless"] },
        { q: "Have you ever thought of harming yourself?", options: ["Never", "Thought sometimes, didn't do it", "Think often", "Thought and did it"] },
        { q: "Do you feel hopeful about the future?", options: ["Hopeful, want to keep going", "Some, not much", "Unsure", "No hope at all"] }
      ]
    }
  }
];

export const categoryLabels = {
  bullying: { th: "ถูกกลั่นแกล้ง", en: "Bullying" },
  family: { th: "ครอบครัว", en: "Family" },
  study: { th: "การเรียน", en: "Study" },
  relationship: { th: "ความสัมพันธ์", en: "Relationship" },
  mental: { th: "สุขภาพจิต", en: "Mental Health" },
  other: { th: "อื่นๆ", en: "Other" }
};
