
import { HookPost, CarouselOutput, DayPlan, CreationMode } from '../types';

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

export const downloadAsTxt = (data: any, mode: CreationMode, title: string) => {
  let content = `--- ${title} ---\n\n`;

  if (mode === 'HOOKS') {
    (data as HookPost[]).forEach((p, i) => {
      // Include visual idea in export
      content += `Post ${i + 1}:\n${p.content}\nVisual Idea: ${p.visualIdea}\n\n`;
    });
  } else if (mode === 'CAROUSEL') {
    const c = data as CarouselOutput;
    c.slides.forEach((s, i) => {
      // Fix: Access .text and .visual properties instead of treating the object as a string
      content += `Slide ${i + 1}: ${s.text}\nVisual: ${s.visual}\n\n`;
    });
    content += `\nCTA: ${c.cta}\n`;
  } else if (mode === 'PLAN_30') {
    (data as DayPlan[]).forEach((d) => {
      // Include visual idea in export
      content += `Day ${d.day} [${d.type}]\nTopic: ${d.topic}\nIdea: ${d.idea}\nVisual Idea: ${d.visualIdea}\n\n`;
    });
  }

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadAsCsv = (data: any, mode: CreationMode, title: string) => {
  let csvContent = "";
  
  if (mode === 'HOOKS') {
    // Include visual idea in export
    csvContent = "Number,Content,Visual Idea\n" + (data as HookPost[]).map((p, i) => `${i + 1},"${p.content.replace(/"/g, '""')}","${p.visualIdea.replace(/"/g, '""')}"`).join("\n");
  } else if (mode === 'CAROUSEL') {
    const c = data as CarouselOutput;
    // Fix: Corrected line 49 - Access .text and .visual properties of CarouselSlide and call replace on the string fields
    csvContent = "Slide,Text,Visual\n" + c.slides.map((s, i) => `${i + 1},"${s.text.replace(/"/g, '""')}","${s.visual.replace(/"/g, '""')}"`).join("\n");
    csvContent += `\nCTA,"${c.cta.replace(/"/g, '""')}"`;
  } else if (mode === 'PLAN_30') {
    // Include visual idea in export
    csvContent = "Day,Topic,Type,Idea,Visual Idea\n" + (data as DayPlan[]).map((d) => `${d.day},"${d.topic.replace(/"/g, '""')}","${d.type.replace(/"/g, '""')}","${d.idea.replace(/"/g, '""')}","${d.visualIdea.replace(/"/g, '""')}"`).join("\n");
  }

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
