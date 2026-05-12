
import { NextResponse } from 'next/server';
import data from '@/data/apartments.json';

export const runtime = 'edge';
function parseIcal(text: string) {
  const blocked: { start: string; end: string }[] = [];
  const lines = text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n');
  let inEvent=false, dtstart='', dtend='';
  for (const line of lines) {
    if(line==='BEGIN:VEVENT'){inEvent=true;dtstart='';dtend='';}
    if(line==='END:VEVENT'){if(dtstart&&dtend)blocked.push({start:dtstart,end:dtend});inEvent=false;}
    if(inEvent){
      const s=line.match(/^DTSTART(?:[^:]*)?:([0-9T]+)/);
      const e=line.match(/^DTEND(?:[^:]*)?:([0-9T]+)/);
      if(s)dtstart=s[1].substring(0,8);
      if(e)dtend=e[1].substring(0,8);
    }
  }
  return blocked;
}
function fmt(d:string){return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;}
export async function GET(req: Request) {
  const{searchParams}=new URL(req.url);
  const apt=data.apartments.find(a=>a.id===searchParams.get('apt'));
  if(!apt)return NextResponse.json({error:'Not found'},{status:404});
  const urls=Object.values(apt.ical as Record<string,string>);
  const all: {start:string;end:string}[]=[];
  await Promise.all(urls.map(async url=>{
    try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'}});if(r.ok)all.push(...parseIcal(await r.text()));}catch{}
  }));
  return NextResponse.json({blocked:all.map(b=>({start:fmt(b.start),end:fmt(b.end)}))},
    {headers:{'Cache-Control':'public, s-maxage=1800, stale-while-revalidate=3600'}});
}
