// Safe return target for the static GitHub Pages build.
export function safeReturnTo(){
  const raw=new URLSearchParams(window.location.search).get("returnTo");
  if(!raw)return "/";
  try{
    const url=new URL(raw,window.location.origin);
    if(url.origin!==window.location.origin)return "/";
    for(const p of ["access_token","clear_access_token","app_id","app_base_url","functions_version","from_url"])url.searchParams.delete(p);
    const target=url.pathname+url.search+url.hash;
    if(!target.startsWith("/")||target.startsWith("//")||target.includes("\\"))return "/";
    return target;
  }catch{return "/";}
}
