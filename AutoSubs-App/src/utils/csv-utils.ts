import { Subtitle } from "@/types";

export function generateCavalryCsv(subtitles: Subtitle[]): string {
  const headers = [
    "Text",
    "Start (s)",
    "End (s)",
    "Start (f@24)",
    "End (f@24)",
    "Start (f@25)",
    "End (f@25)",
    "Start (f@30)",
    "End (f@30)",
    "Start (f@60)",
    "End (f@60)"
  ];
  
  const rows = subtitles.map(sub => {
    const textEscaped = `"${sub.text.replace(/"/g, '""')}"`;
    const startSec = sub.start.toFixed(3);
    const endSec = sub.end.toFixed(3);
    
    const f24Start = Math.round(sub.start * 24);
    const f24End = Math.round(sub.end * 24);
    
    const f25Start = Math.round(sub.start * 25);
    const f25End = Math.round(sub.end * 25);
    
    const f30Start = Math.round(sub.start * 30);
    const f30End = Math.round(sub.end * 30);
    
    const f60Start = Math.round(sub.start * 60);
    const f60End = Math.round(sub.end * 60);
    
    return [
      textEscaped,
      startSec,
      endSec,
      f24Start, f24End,
      f25Start, f25End,
      f30Start, f30End,
      f60Start, f60End
    ].join(",");
  });
  
  return [headers.join(","), ...rows].join("\n");
}
