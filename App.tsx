import React, { useState, useEffect, useCallback } from 'react';
import { 
  Niche, 
  CreationMode, 
  Platform, 
  ContentType, 
  AppState, 
  GenerationResult,
  HookPost,
  CarouselOutput,
  DayPlan,
  CarouselSlide
} from './types';
import { NICHES, MODES, PLATFORMS, CONTENT_TYPES } from './constants';
import { generateContent } from './services/geminiService';
import { SelectionGroup } from './components/SelectionGroup';
import { Button } from './components/Button';
import { copyToClipboard, downloadAsTxt, downloadAsCsv } from './utils/helpers';

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleCopy}
      className="text-xs font-semibold"
    >
      {copied ? "Copied ✓" : "Copy"}
    </Button>
  );
};

export default function App() {
  const [state, setState] = useState<AppState>({
    niche: 'Students',
    mode: 'HOOKS',
    platforms: ['TikTok'],
    contentType: 'Educational',
    topic: '',
    loading: false,
    result: null,
    history: [],
  });

  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('faceless_history');
    if (saved) {
      try {
        setState(prev => ({ ...prev, history: JSON.parse(saved) }));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    if (state.history.length > 0) {
      localStorage.setItem('faceless_history', JSON.stringify(state.history));
    }
  }, [state.history]);

  const handleModeChange = (mode: CreationMode) => {
    setState(prev => ({ 
      ...prev, 
      mode, 
      result: null,
      topic: prev.topic
    }));
  };

  const handlePlatformChange = (platform: Platform) => {
    setState(prev => ({ ...prev, platforms: [platform] }));
  };

  const onGenerate = async () => {
    if (state.mode === 'CAROUSEL' && !state.topic.trim()) {
      alert("Topic is required for Carousel generation.");
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
    try {
      const data = await generateContent({
        niche: state.niche,
        mode: state.mode,
        platforms: state.platforms,
        contentType: state.contentType,
        topic: state.topic
      });

      const newResult: GenerationResult = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        mode: state.mode,
        niche: state.niche,
        platform: state.platforms,
        contentType: state.contentType,
        topic: state.topic,
        data: data
      };

      setState(prev => ({
        ...prev,
        loading: false,
        result: newResult,
        history: [newResult, ...prev.history].slice(0, 50)
      }));
    } catch (err) {
      alert("Failed to generate content. Please check your API connection.");
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCopyAll = () => {
    if (!state.result) return;
    let allText = "";
    if (state.mode === 'HOOKS') {
      allText = (state.result.data as HookPost[]).map(p => `Script: ${p.content}\nVisual Idea: ${p.visualIdea}`).join('\n\n');
    } else if (state.result.mode === 'CAROUSEL') {
      const c = state.result.data as CarouselOutput;
      allText = c.slides.map((s, i) => `Slide ${i+1}: ${s.text}\nVisual: ${s.visual}`).join('\n\n') + `\n\nCTA: ${c.cta}`;
    } else {
      allText = (state.result.data as DayPlan[]).map(d => {
        let dayText = `Day ${d.day} - ${d.topic}\nType: ${d.type}\nIdea: ${d.idea}\nVisual Style: ${d.visualIdea}`;
        if (d.slides && d.slides.length > 0) {
          dayText += `\nSlides:\n` + d.slides.map((s, i) => `S${i+1}: ${s.text} (Visual: ${s.visual})`).join('\n');
        }
        return dayText;
      }).join('\n\n');
    }
    copyToClipboard(allText);
    alert("Copied everything to clipboard!");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
            <h1 className="font-bold text-xl text-gray-900 hidden sm:block">Faceless reels</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? "Back to Editor" : "History"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 w-full">
        {/* App Introduction Section */}
        <section className="mb-10 bg-indigo-50 border border-indigo-100 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-indigo-900 mb-2">Generate Faceless Reels Content</h2>
              <p className="text-indigo-700 leading-relaxed mb-6 text-sm">
                A specialized tool for creators to generate high-retention viral scripts. Get instant ideas, 30-day plans, and aesthetic B-roll prompts tailored to your niche.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-white/60 p-3 rounded-xl border border-indigo-100">
                  <span className="font-bold text-indigo-600 text-xs block mb-1">⚡ Viral Assets</span>
                  <p className="text-[11px] text-indigo-800">Generate hooks, carousels, and visual ideas designed for maximum engagement.</p>
                </div>
                <div className="bg-white/60 p-3 rounded-xl border border-indigo-100">
                  <span className="font-bold text-indigo-600 text-xs block mb-1">📅 Monthly Roadmaps</span>
                  <p className="text-[11px] text-indigo-800">Stay consistent with 30-day structured content plans optimized for short-form video.</p>
                </div>
                <div className="bg-white/60 p-3 rounded-xl border border-indigo-100">
                  <span className="font-bold text-indigo-600 text-xs block mb-1">🔄 Regenerate</span>
                  <p className="text-[11px] text-indigo-800">Not feeling the vibe? Tap 'Regenerate' in the workspace to refresh ideas instantly.</p>
                </div>
                <div className="bg-white/60 p-3 rounded-xl border border-indigo-100">
                  <span className="font-bold text-indigo-600 text-xs block mb-1">📜 History</span>
                  <p className="text-[11px] text-indigo-800">Recover your last 50 generations anytime by using the History toggle.</p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-52 bg-white p-5 rounded-xl shadow-sm border border-indigo-100 shrink-0">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Guide</h3>
              <ul className="space-y-3">
                {[
                  "Pick Niche & Style",
                  "Choose Mode",
                  "Enter Topic",
                  "Click Generate",
                  "Copy & Export"
                ].map((step, i) => (
                  <li key={i} className="flex gap-2 text-xs items-center">
                    <span className="bg-indigo-600 text-white w-4 h-4 rounded-full flex items-center justify-center shrink-0 font-bold text-[9px]">{i+1}</span>
                    <span className="text-gray-600 font-medium">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className={`lg:col-span-5 space-y-8 ${showHistory ? 'hidden lg:block' : ''}`}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-8">
              <SelectionGroup label="1. Niche" options={NICHES} selected={state.niche} onChange={(niche) => setState(prev => ({ ...prev, niche }))} />
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">2. Mode</label>
                <div className="grid gap-3">
                  {MODES.map((m) => (
                    <button key={m.value} onClick={() => handleModeChange(m.value)} className={`p-4 rounded-xl border text-left transition-all ${state.mode === m.value ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600' : 'bg-white border-gray-200 hover:border-indigo-300'}`}>
                      <div className="font-bold text-gray-900">{m.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{m.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              <SelectionGroup label="3. Platform" options={PLATFORMS} selected={state.platforms[0]} onChange={handlePlatformChange} />
              <SelectionGroup label="4. Content Type" options={CONTENT_TYPES} selected={state.contentType} onChange={(contentType) => setState(prev => ({ ...prev, contentType }))} />
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">5. Topic (Optional)</label>
                <textarea value={state.topic} onChange={(e) => setState(prev => ({ ...prev, topic: e.target.value }))} placeholder={state.mode === 'CAROUSEL' ? "Topic required..." : "Enter context..."} className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] text-sm" />
              </div>
              <Button className="w-full py-4 text-lg" isLoading={state.loading} onClick={onGenerate}>Generate Content</Button>
            </div>
          </div>

          <div className={`lg:col-span-7 ${!showHistory ? 'block' : 'hidden lg:block'}`}>
            {showHistory ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Recent History</h2>
                  <Button variant="outline" size="sm" onClick={() => { localStorage.removeItem('faceless_history'); setState(prev => ({ ...prev, history: [] })); }}>Clear All</Button>
                </div>
                {state.history.length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-500">History is empty.</div>
                ) : (
                  <div className="space-y-4">
                    {state.history.map((h) => (
                      <div key={h.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 cursor-pointer flex justify-between items-center transition-colors" onClick={() => { setState(prev => ({ ...prev, result: h })); setShowHistory(false); }}>
                        <div>
                          <div className="font-bold text-gray-900">{h.mode.replace('_', ' ')} • {h.niche}</div>
                          <div className="text-xs text-gray-400">{new Date(h.timestamp).toLocaleString()}</div>
                        </div>
                        <div className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[10px] font-bold uppercase">{h.contentType}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {!state.result && !state.loading && (
                  <div className="bg-indigo-50 p-12 rounded-2xl border-2 border-dashed border-indigo-200 text-center flex flex-col items-center h-full min-h-[400px] justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Workspace</h3>
                    <p className="text-gray-600 max-w-sm text-sm">Configure settings and generate content.</p>
                  </div>
                )}

                {state.loading && (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>)}
                  </div>
                )}

                {state.result && !state.loading && (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 bg-white/80 backdrop-blur py-4 z-30 px-2 -mx-2">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-900">Output</h2>
                        <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{state.result.mode === 'PLAN_30' ? '30-Day Plan' : state.result.mode}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopyAll}>Copy All</Button>
                        <Button variant="outline" size="sm" onClick={() => downloadAsTxt(state.result?.data, state.result!.mode, `Faceless_${state.result!.mode}`)}>Export .TXT</Button>
                        <Button variant="outline" size="sm" onClick={() => downloadAsCsv(state.result?.data, state.result!.mode, `Faceless_${state.result!.mode}`)}>Export .CSV</Button>
                        <Button variant="secondary" size="sm" onClick={onGenerate}>Regenerate</Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {state.result.mode === 'HOOKS' && (state.result.data as HookPost[]).map((post, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Post {idx + 1}</span>
                            <CopyButton text={`Script: ${post.content}\nVisual: ${post.visualIdea}`} />
                          </div>
                          <p className="text-lg text-gray-800 leading-relaxed font-semibold mb-4">{post.content}</p>
                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-1">🎬 Visual Idea</span>
                            <p className="text-xs text-gray-600 italic">{post.visualIdea}</p>
                          </div>
                        </div>
                      ))}

                      {state.result.mode === 'CAROUSEL' && (
                        <div className="space-y-4">
                          {(state.result.data as CarouselOutput).slides.map((slide, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 shrink-0">{idx + 1}</div>
                              <div className="flex-grow">
                                <div className="flex justify-between mb-2">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">Slide {idx + 1}</span>
                                  <CopyButton text={`Text: ${slide.text}\nVisual: ${slide.visual}`} />
                                </div>
                                <p className="text-gray-800 font-medium text-lg mb-3">{slide.text}</p>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                  <span className="text-[9px] font-bold text-indigo-500 uppercase block mb-1">Visual Direction</span>
                                  <p className="text-xs text-gray-500">{slide.visual}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="bg-indigo-50 p-6 rounded-2xl shadow-sm border-2 border-dashed border-indigo-200">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-xs font-bold text-indigo-600 uppercase">Final CTA</span>
                              <CopyButton text={(state.result.data as CarouselOutput).cta} />
                            </div>
                            <p className="text-lg text-indigo-900 font-bold">{(state.result.data as CarouselOutput).cta}</p>
                          </div>
                        </div>
                      )}

                      {state.result.mode === 'PLAN_30' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(state.result.data as DayPlan[]).map((day, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:border-indigo-200 transition-colors">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="bg-gray-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs">D{day.day}</span>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{day.type}</span>
                                </div>
                                <CopyButton text={`${day.topic}\nIdea: ${day.idea}\nVisual: ${day.visualIdea}`} />
                              </div>
                              <h4 className="font-bold text-gray-900 mb-2 line-clamp-1">{day.topic}</h4>
                              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{day.idea}</p>
                              <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-100">
                                <span className="text-[9px] font-bold text-indigo-400 uppercase block mb-1">Visual Concept</span>
                                <p className="text-[11px] text-gray-500 italic">{day.visualIdea}</p>
                              </div>
                              {day.slides && day.slides.length > 0 && (
                                <div className="mt-auto pt-3 border-t border-gray-50 space-y-2">
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Draft Slides</span>
                                  {day.slides.map((s, si) => (
                                    <div key={si} className="bg-white p-2 border border-gray-100 rounded text-[11px] text-gray-600">
                                      <div className="flex gap-2"><span className="font-bold text-indigo-400 shrink-0">S{si+1}</span><span>{s.text}</span></div>
                                      <div className="text-[10px] text-gray-400 mt-1 italic pl-6">{s.visual}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-[10px] text-gray-400">© 2024 Faceless Reels Content Gen • Designed for Creators</p>
        </div>
      </footer>
    </div>
  );
}
