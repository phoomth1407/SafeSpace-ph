import { computeAssessmentResult } from "@/lib/assessmentScoring";

// Base44-free browser backend for the school/demo build.
const KEY="safespace_";
const read=(k,fallback=[])=>{try{return JSON.parse(localStorage.getItem(KEY+k)||JSON.stringify(fallback));}catch{return fallback;}};
const write=(k,v)=>localStorage.setItem(KEY+k,JSON.stringify(v));
const id=()=>`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const user=()=>read("session",null);
const entity=(name)=>({
 async list(order="-created_date",limit=50){const a=read(`entity_${name}`,[]),f=order.replace(/^-/,"");a.sort((x,y)=>String(y[f]||"").localeCompare(String(x[f]||"")));return a.slice(0,limit);},
 async filter(filters={},order="created_date",limit=100){const a=read(`entity_${name}`,[]).filter(x=>Object.entries(filters).every(([k,v])=>x[k]===v)),f=order.replace(/^-/,"");a.sort((x,y)=>String(x[f]||"").localeCompare(String(y[f]||"")));return a.slice(0,limit);},
 async get(i){return read(`entity_${name}`,[]).find(x=>x.id===i)||null;},
 async create(data){const item={...data,id:data.id||id(),created_date:data.created_date||new Date().toISOString(),created_by_id:data.created_by_id||user()?.id||null};const a=read(`entity_${name}`,[]);a.push(item);write(`entity_${name}`,a);return item;},
 async update(i,patch){const a=read(`entity_${name}`,[]),n=a.findIndex(x=>x.id===i);if(n<0)throw Error("Not found");a[n]={...a[n],...patch,updated_date:new Date().toISOString()};write(`entity_${name}`,a);return a[n];},
 async delete(i){write(`entity_${name}`,read(`entity_${name}`,[]).filter(x=>x.id!==i));return{success:true};}
});
const entities=new Proxy({},{get:(_,name)=>entity(name)});

function assess(answers,lang){const r=computeAssessmentResult(answers||[]);if(lang!=="en")return r;const s={low:"Your answers suggest relatively low current stress. Keep taking care of your wellbeing and talk to someone you trust when needed.",moderate:"Your answers suggest some areas of stress that deserve attention. Consider talking with someone you trust.",high:"Your answers suggest a high level of distress. Consider talking with a trusted adult or qualified mental-health professional.",severe:"Your answers suggest significant distress. Please reach out to a trusted adult or qualified professional as soon as possible. This result is not a diagnosis."};return{...r,ai_summary:s[r.risk_level]||s.moderate,recommendations:["Talk with someone you trust.","Use healthy ways to manage stress and make time for rest.","If distress continues, consider qualified professional support."],analysis_source:"local-rule-based"};}
const invoke=async(name,p={})=>{
 if(name==="analyzeAssessment"){const r=assess(p.answers,p.language);if(user()){const x=await entities.Assessment.create({...r,answers:p.answers||[],age:p.age||null,nationality:p.nationality||"",language:p.language||"th"});return{data:{...r,id:x.id,is_guest:false}};}return{data:{...r,id:id(),is_guest:true}};}
 if(name==="analyzeCommunityPost"){const text=String(p.content||"").trim(),risky=/suicide|self[- ]?harm|ฆ่าตัวตาย|ทำร้ายตัวเอง/i.test(text);return{data:await entities.CommunityPost.create({content:text,category:p.category||"other",author_name:p.author_name||"anonymous",ai_risk_flag:risky?"high":"safe",ai_response:p.ai_enabled===false?"":(risky?"This message may describe serious distress. Consider reaching out to a trusted adult or qualified professional.":"Thanks for sharing. Community support is not a substitute for professional support."),hearts:0,bumps:0,hearted_by:[],bumped_by:[],is_announcement:false})};}
 if(name==="communityInteract"){const u=user();if(!u)return{data:{error:"auth_required"}};const p0=await entities.CommunityPost.get(p.post_id);if(!p0)return{data:{error:"not_found"}};const k=p.action==="heart"?"hearted_by":"bumped_by",c=p.action==="heart"?"hearts":"bumps",a=Array.isArray(p0[k])?p0[k]:[],next=a.includes(u.id)?a.filter(x=>x!==u.id):[...a,u.id],x=await entities.CommunityPost.update(p.post_id,{[k]:next,[c]:next.length});return{data:{hearts:x.hearts||0,bumps:x.bumps||0,hearted:(x.hearted_by||[]).includes(u.id),bumped:(x.bumped_by||[]).includes(u.id)}};}
 if(name==="createComment"){if(!user())return{data:{error:"auth_required"}};return{data:await entities.CommunityComment.create(p)};}
 if(name==="manageBan")return{data:await entities.User.update(p.user_id,{banned:!!p.banned})};
 return{data:{error:`Function ${name} is unavailable in the local build.`}};
};
const auth={
 async me(){return user();},
 async loginViaEmailPassword(email,password){const u=read("accounts",[]).find(x=>x.email.toLowerCase()===email.toLowerCase()&&x.password===password);if(!u)throw Error("Invalid email or password");write("session",u);return u;},
 async register({email,password}){if(read("accounts",[]).some(x=>x.email.toLowerCase()===email.toLowerCase()))throw Error("An account with this email already exists");const u={id:id(),email,role:"user",banned:false};const a=read("accounts",[]);a.push({...u,password});write("accounts",a);write("session",u);return u;},
 async verifyOtp(){return{access_token:"local-demo"};},async resendOtp(){return{success:true};},setToken(){},
 logout(){localStorage.removeItem(KEY+"session");window.location.href="/";},
 redirectToLogin(r="/"){window.location.href=`/login?returnTo=${encodeURIComponent(r)}`;},
 loginWithProvider(){throw Error("Google sign-in is unavailable in the static GitHub Pages build. Use email/password.");}
};
export const base44={entities,functions:{invoke},auth};
