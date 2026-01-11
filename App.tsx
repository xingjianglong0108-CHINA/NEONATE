
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  Activity, 
  BookOpen, 
  ClipboardList, 
  RotateCcw, 
  CheckCircle2, 
  Play, 
  Pause, 
  Timer,
  X,
  BellRing,
  Check,
  Heart,
  ListChecks,
  Info,
  Droplets,
  Zap,
  Calculator,
  Stethoscope,
  Syringe,
  AlertTriangle
} from 'lucide-react';
import { AppSection, CalculationResult } from './types';
import { SPO2_TARGETS, MAJOR_CONCEPTS, CHECKLIST_ITEMS, STABLE_SPO2_TARGET } from './constants';

// 定义流程节点 ID
type NodeId = 
  | 'PREP'        // 准备与简报
  | 'BIRTH'       // 出生评估
  | 'INITIAL'     // 初始步骤
  | 'POST_INIT'   // 评估
  | 'STABLE_LABOR'// 呼吸困难
  | 'PPV'         // 正压通气
  | 'PPV_EVAL'    // PPV 评估
  | 'MRSOPA'      // 通气矫正步骤
  | 'COMPRESS'    // 胸外按压
  | 'MEDS'        // 药物治疗
  | 'POST_CARE';  // 复苏后护理

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.GUIDANCE);
  const [weight, setWeight] = useState<number>(3.0);
  const [ga, setGa] = useState<number>(39);

  // 算法当前节点
  const [currentNode, setCurrentNode] = useState<NodeId>('PREP');
  
  // Timer State
  const [seconds, setSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const resetAll = () => {
    setCurrentNode('PREP');
    setSeconds(0);
    setIsTimerRunning(false);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const results = useMemo<CalculationResult>(() => {
    let etSize = "3.5";
    if (weight < 1) etSize = "2.5";
    else if (weight < 2) etSize = "3.0";
    const etDepth = (weight + 6).toFixed(1);
    const epiIV = (weight * 0.1).toFixed(2) + "-" + (weight * 0.3).toFixed(2) + " mL";
    const epiET = (weight * 0.5).toFixed(2) + "-" + (weight * 1.0).toFixed(2) + " mL";
    const volume = (weight * 10).toFixed(0) + "-" + (weight * 20).toFixed(0) + " mL";
    return { etSize, etDepth, epiIV, epiET, volumeExpansion: volume };
  }, [weight]);

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 ios-blur border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">新生儿复苏-LZRYEK</h1>
            <p className="text-[9px] text-gray-400 font-medium">Build v1.0.3-Release</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full shadow-sm">2025 NRP 指南</span>
        </div>
        
        <div className="ios-card bg-white p-3 border border-gray-100 shadow-sm mb-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">体重 (kg)</label>
              <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full text-lg font-semibold bg-gray-50 border-none rounded-md px-2 py-1 outline-none focus:bg-blue-50 transition-colors" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">孕周 (周)</label>
              <input type="number" value={ga} onChange={(e) => setGa(Number(e.target.value))} className="w-full text-lg font-semibold bg-gray-50 border-none rounded-md px-2 py-1 outline-none focus:bg-blue-50 transition-colors" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 overflow-y-auto">
        {activeSection === AppSection.GUIDANCE && (
          <GuidanceView 
            node={currentNode} 
            setNode={setCurrentNode}
            seconds={seconds} 
            isTimerRunning={isTimerRunning}
            setIsTimerRunning={setIsTimerRunning}
            formatTime={formatTime}
            resetAll={resetAll}
            results={results}
          />
        )}
        {activeSection === AppSection.GOALS && <GoalsView />}
        {activeSection === AppSection.CALCULATOR && <CalculatorView weight={weight} results={results} />}
        {activeSection === AppSection.CHECKLIST && <ChecklistView />}
        {activeSection === AppSection.THEORY && <TheoryView />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 ios-blur border-t border-gray-200 px-1 pb-6 pt-2 flex justify-around items-center z-50">
        <NavButton active={activeSection === AppSection.GUIDANCE} onClick={() => setActiveSection(AppSection.GUIDANCE)} icon={<Activity size={22} />} label="决策引导" />
        <NavButton active={activeSection === AppSection.GOALS} onClick={() => setActiveSection(AppSection.GOALS)} icon={<Heart size={22} />} label="生理目标" />
        <NavButton active={activeSection === AppSection.CALCULATOR} onClick={() => setActiveSection(AppSection.CALCULATOR)} icon={<Calculator size={22} />} label="计算联动" />
        <NavButton active={activeSection === AppSection.CHECKLIST} onClick={() => setActiveSection(AppSection.CHECKLIST)} icon={<ClipboardList size={22} />} label="核查清单" />
        <NavButton active={activeSection === AppSection.THEORY} onClick={() => setActiveSection(AppSection.THEORY)} icon={<BookOpen size={22} />} label="理论要点" />
      </nav>
    </div>
  );
};

/* --- Sub-Components --- */

const NavButton: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 w-1/5 transition-all active:scale-90 ${active ? 'text-blue-600' : 'text-gray-400'}`}>
    <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-blue-50' : 'bg-transparent'}`}>{icon}</div>
    <span className="text-[9px] font-bold tracking-tighter whitespace-nowrap">{label}</span>
  </button>
);

const GuidanceView: React.FC<{
  node: NodeId, setNode: (n: NodeId) => void, seconds: number, 
  isTimerRunning: boolean, setIsTimerRunning: (r: boolean) => void,
  formatTime: (s: number) => string, resetAll: () => void, results: CalculationResult
}> = ({ node, setNode, seconds, isTimerRunning, setIsTimerRunning, formatTime, resetAll, results }) => {
  const [nodeSeconds, setNodeSeconds] = useState(0);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => { setNodeSeconds(0); setShowReminder(false); }, [node]);
  useEffect(() => {
    let interval: number;
    if (isTimerRunning) interval = window.setInterval(() => setNodeSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, node]);
  useEffect(() => { if (nodeSeconds === 30) setShowReminder(true); }, [nodeSeconds]);

  const timerColor = seconds >= 60 ? 'text-red-500' : seconds >= 30 ? 'text-orange-500' : 'text-blue-600';

  const getCurrentSpO2Target = (s: number) => {
    if (node === 'POST_CARE') return STABLE_SPO2_TARGET;
    if (s <= 60) return "60%-65%";
    if (s <= 120) return "65%-70%";
    if (s <= 180) return "70%-75%";
    if (s <= 240) return "75%-80%";
    if (s <= 300) return "80%-85%";
    return "85%-95%";
  };

  const renderNode = () => {
    switch (node) {
      case 'PREP': return {
        title: "准备与简报", desc: "预判风险，分工协作。检查所有复苏设备。",
        details: ["产前四问评估风险因素", "指定团队负责人及各角色分工", "检查复苏器、氧源、吸痰设备是否即刻可用", "确认辐射台预热，备好温热毛巾"],
        actions: [{ label: "出生 (计时开始)", next: 'BIRTH', primary: true, onAction: () => setIsTimerRunning(true) }]
      };
      case 'BIRTH': return {
        title: "出生评估", desc: "快速评估新生儿出生状态，决定后续路径。",
        details: ["足月吗？（询问孕周）", "肌张力好吗？（观察肢体活动）", "有呼吸或哭声吗？"],
        warning: "注意：若新生儿有明显呼吸窘迫或持续青紫，即使心率 > 100，仍需进入 CPAP 评估路径。",
        actions: [
          { label: "是 (转入常规护理)", next: 'POST_CARE', primary: false },
          { label: "否 (进入初始步骤)", next: 'INITIAL', primary: true }
        ]
      };
      case 'INITIAL': return {
        title: "初始步骤", desc: "针对非活力儿的初步干预，需在30秒内完成。",
        details: ["保暖：置于辐射保暖台下", "摆位：保持“嗅探位”以开放气道", "吸引：必要时先口后鼻清理分泌物", "擦干：彻底擦干并移除湿毛巾", "刺激：轻柔摩擦背部或足底"],
        actions: [{ label: "完成并评估", next: 'POST_INIT', primary: true }]
      };
      case 'POST_INIT': return {
        title: "再次评估", desc: "决定是否需要开始正压通气（PPV）。",
        details: ["是否有呼吸暂停或喘息？", "心率（HR）是否 < 100 bpm？", "是否有持续青紫或呼吸窘迫？"],
        actions: [
          { label: "异常 (立即 PPV)", next: 'PPV', primary: true },
          { label: "仅呼吸费力 (CPAP)", next: 'STABLE_LABOR', primary: false }
        ]
      };
      case 'STABLE_LABOR': return {
        title: "辅助呼吸阶段", desc: "针对有自主呼吸但仍有困难的新生儿。",
        details: ["监测右手导管前血氧 (SpO2)", "CPAP：起始压力建议 5-8 cmH2O", "根据 SpO2 曲线滴定给氧"],
        actions: [
          { label: "生命体征稳定", next: 'POST_CARE', primary: true },
          { label: "病情恶化 (转 PPV)", next: 'PPV', primary: false }
        ]
      };
      case 'PPV': return {
        title: "正压通气 (PPV)", desc: "复苏中最关键的步骤，建立有效通气是核心。",
        details: ["频率：40-60 次/分（“吸-二-三”）", "起始压力：PIP 20-25 / PEEP 5", "连接右手脉氧仪，监测 SpO2 目标"],
        actions: [{ label: "15-30秒后评估 HR", next: 'PPV_EVAL', primary: true }]
      };
      case 'PPV_EVAL': return {
        title: "通气效果评估", desc: "判断通气是否有效并决定下一步。",
        details: ["心率上升？继续 PPV", "心率不升但胸廓有起伏？继续 PPV 至30秒", "胸廓无起伏？立即进入 MRSOPA 矫正"],
        warning: "若心率持续 < 60bpm，必须在开始胸外按压前完成气管插管。",
        actions: [
          { label: "有效 (继续并过渡)", next: 'POST_CARE', primary: false },
          { label: "无效 (进入矫正步骤)", next: 'MRSOPA', primary: true }
        ]
      };
      case 'MRSOPA': return {
        title: "通气矫正 (MRSOPA)", desc: "PPV 效果不佳时，按顺序执行矫正。",
        details: ["M (Mask): 调整面罩确保密封", "R (Position): 重新摆正嗅探位", "S (Suction): 吸引口鼻分泌物", "O (Open): 张开新生儿口腔", "P (Pressure): 增加压力至最高 40 cmH2O", "A (Alternative): 建立人工气道(插管/喉罩)"],
        actions: [
          { label: "HR < 60 (准备按压)", next: 'COMPRESS', primary: true },
          { label: "HR >= 60 (恢复 PPV)", next: 'PPV', primary: false }
        ]
      };
      case 'COMPRESS': return {
        title: "胸外按压", desc: "循环支持。开始按压前应已完成插管且使用100%氧气。",
        details: ["手法：双拇指环抱法，深度达胸廓前后径 1/3", "比例：3:1 协调（90按压 + 30通气/min）", "氧气：此时必须上调至 100% 氧气"],
        actions: [{ label: "60秒后评估 HR < 60?", next: 'MEDS', primary: true }]
      };
      case 'MEDS': return {
        title: "药物介入", desc: "当按压无法维持心率时，考虑药物或容量。",
        details: ["肾上腺素：首选静脉 0.1-0.3 mL/kg", "扩容：若怀疑血容量不足，给 NS 10-20 mL/kg", "监测：每 3-5 分钟可重复肾上腺素"],
        actions: [
          { label: "继续循环反馈", next: 'COMPRESS', primary: true },
          { label: "心率恢复 > 60", next: 'POST_CARE', primary: false }
        ]
      };
      case 'POST_CARE': return {
        title: "复苏后管理", desc: "生命支持、监测与并发症预防。",
        details: ["SpO2 滴定目标：维持在 92-96%", "评估亚低温：针对 ≥36周有 HIE 风险者", "监测血糖(>2.5mmol/L)、体温(36.5-37.5℃)", "详细记录复苏过程，向家长交代病情"],
        actions: [{ label: "重置并重回准备", next: 'PREP', primary: true, onAction: resetAll }]
      };
      default: return { title: "", desc: "", details: [], actions: [] };
    }
  };

  const content = renderNode();

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 pb-4">
      {showReminder && (
        <div className="bg-amber-100 border border-amber-200 p-3 rounded-xl flex items-start gap-2 shadow-sm animate-bounce-short">
          <BellRing size={16} className="text-amber-600 mt-0.5" />
          <p className="text-[11px] text-amber-800 font-bold">已持续 {nodeSeconds}s。请尽快做出决策进入下一步。</p>
          <button onClick={() => setShowReminder(false)}><X size={14} className="text-amber-400" /></button>
        </div>
      )}

      {/* 计时器卡片 */}
      <div className="ios-card p-4 flex items-center justify-between border border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isTimerRunning ? 'bg-blue-100 animate-pulse' : 'bg-gray-100'}`}><Timer size={20} className={isTimerRunning ? 'text-blue-600' : 'text-gray-400'} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">复苏总时长</p>
            <p className={`text-3xl font-mono font-bold ${timerColor}`}>{formatTime(seconds)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`p-3 rounded-full ${isTimerRunning ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{isTimerRunning ? <Pause size={18}/> : <Play size={18}/>}</button>
          <button onClick={resetAll} className="p-3 rounded-full bg-gray-100 text-gray-400"><RotateCcw size={18}/></button>
        </div>
      </div>

      {/* 阶段性警示 */}
      {(content as any).warning && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-3 items-start animate-in slide-in-from-top duration-500">
          <AlertTriangle size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-orange-800 font-bold leading-relaxed">
            {(content as any).warning}
          </p>
        </div>
      )}

      {/* 主决策卡片 */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-widest">当前流程</span>
          {seconds > 0 && <span className="text-[10px] font-bold text-gray-400">已过 {seconds}s</span>}
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">{content.title}</h2>
        <p className="text-gray-600 text-sm mb-6 font-medium leading-relaxed">{content.desc}</p>
        
        <div className="space-y-3 mb-8">
          <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest border-b pb-1 mb-2">详细操作指引</h4>
          {content.details.map((d, i) => (
            <div key={i} className="flex gap-3 items-start text-[13px] text-gray-700 font-bold leading-snug">
              <Check size={14} className="text-blue-500 mt-0.5 flex-shrink-0" strokeWidth={3} /> {d}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {content.actions.map((act, i) => (
            <button key={i} onClick={() => { if(act.onAction) act.onAction(); setNode(act.next); }}
              className={`w-full py-4 px-6 rounded-2xl flex items-center justify-between font-bold transition-all active:scale-[0.98] ${act.primary ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-700'}`}>
              <span className="text-[15px]">{act.label}</span>
              <ChevronRight size={18}/>
            </button>
          ))}
        </div>
      </div>

      {/* SpO2 实时目标看板 */}
      {seconds > 0 && (
        <div className="bg-blue-600 rounded-2xl p-4 flex items-center justify-between shadow-lg text-white">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-blue-200" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-blue-200 uppercase">生后 SpO2 目标</span>
              <span className="text-xs font-bold">导管前监测 (右手)</span>
            </div>
          </div>
          <span className="text-2xl font-black">{getCurrentSpO2Target(seconds)}</span>
        </div>
      )}
    </div>
  );
};

const CalculatorView: React.FC<{weight: number, results: CalculationResult}> = ({ weight, results }) => {
  const lmaSize = weight < 2.5 ? "1.0" : "2.0";
  const uvcDepth = "紧急: 3-5cm (进入脐带)";
  
  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300 pb-4">
      {/* 气道与插管卡片 */}
      <div className="ios-card overflow-hidden shadow-md border border-gray-100">
        <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Stethoscope size={20} />
            <h3 className="font-bold text-[15px]">建立人工气道 ({weight}kg)</h3>
          </div>
          <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Airway</span>
        </div>
        
        <div className="p-5 grid grid-cols-2 gap-4">
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
            <p className="text-[10px] text-blue-600 font-black uppercase mb-2 tracking-widest">气管插管 ID</p>
            <p className="text-3xl font-black text-blue-900 leading-none">{results.etSize}<span className="text-sm font-bold ml-1">mm</span></p>
          </div>
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
            <p className="text-[10px] text-blue-600 font-black uppercase mb-2 tracking-widest">插管深度 (唇缘)</p>
            <p className="text-3xl font-black text-blue-900 leading-none">{results.etDepth}<span className="text-sm font-bold ml-1">cm</span></p>
          </div>
          <div className="bg-cyan-50/50 p-4 rounded-2xl border border-cyan-100 flex flex-col items-center text-center">
            <p className="text-[10px] text-cyan-700 font-black uppercase mb-2 tracking-widest">喉罩 LMA</p>
            <p className="text-2xl font-black text-cyan-900 leading-none">Size {lmaSize}</p>
          </div>
          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex flex-col items-center text-center">
            <p className="text-[10px] text-indigo-700 font-black uppercase mb-2 tracking-widest">脐静脉 UVC</p>
            <p className="text-[12px] font-black text-indigo-900 leading-tight">3 - 5 cm</p>
            <p className="text-[8px] text-indigo-500 mt-1 uppercase font-bold">紧急置入</p>
          </div>
        </div>
      </div>

      {/* 肾上腺素卡片 */}
      <div className="ios-card overflow-hidden shadow-md border border-gray-100">
        <div className="bg-rose-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Syringe size={20} />
            <h3 className="font-bold text-[15px]">肾上腺素剂量 (1:10000)</h3>
          </div>
          <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Drug</span>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-widest">静脉 / 骨内 (IV/IO)</span>
              <span className="text-[10px] text-gray-400 font-bold">0.1-0.3 mL/kg</span>
            </div>
            <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between shadow-inner">
              <div className="flex flex-col">
                <p className="text-[10px] text-rose-400 font-bold mb-1 uppercase">推荐推注量</p>
                <p className="text-4xl font-black text-rose-800 tracking-tighter">{results.epiIV}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                <Activity size={24} className="text-rose-600" />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 opacity-90">
            <div className="mt-1"><Info size={16} className="text-gray-400" /></div>
            <div>
              <p className="text-xs font-black text-gray-700 uppercase">气管内 (ET) - 临时剂量</p>
              <p className="text-lg font-black text-gray-600 mt-1">{results.epiET}</p>
              <p className="text-[10px] text-gray-400 mt-1 font-medium">仅在 IV/IO 未建立前考虑 (0.5-1.0 mL/kg)</p>
            </div>
          </div>
        </div>
      </div>

      {/* 扩容卡片 */}
      <div className="ios-card overflow-hidden shadow-md border border-gray-100">
        <div className="bg-emerald-600 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Droplets size={20} />
            <h3 className="font-bold text-[15px]">扩容与生理盐水</h3>
          </div>
          <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Fluid</span>
        </div>
        
        <div className="p-5">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-widest">生理盐水 (NS)</span>
              <span className="text-[10px] text-gray-400 font-bold">10-20 mL/kg</span>
            </div>
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between shadow-inner">
              <div className="flex flex-col">
                <p className="text-[10px] text-emerald-400 font-bold mb-1 uppercase">单次扩容总量</p>
                <p className="text-4xl font-black text-emerald-800 tracking-tighter">{results.volumeExpansion}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Droplets size={24} className="text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
            <p className="text-[11px] text-gray-500 font-bold">建议推注时长：5 - 10 分钟</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 text-center">
        <p className="text-[11px] text-gray-400 font-bold italic">数据依据 2025 NRP 指南生成。请结合临床实际情况决策。</p>
      </div>
    </div>
  );
};

const GoalsView: React.FC = () => (
  <div className="flex flex-col gap-4 animate-in fade-in duration-300">
    <div className="ios-card p-5">
      <h3 className="text-sm font-bold text-gray-500 flex items-center gap-2 mb-4"><Activity size={16} className="text-blue-500" /> 生后动态 SpO2 目标曲线</h3>
      <div className="space-y-2">
        {SPO2_TARGETS.map((t, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-gray-700 text-xs font-bold">{t.time}</span>
            <span className="bg-blue-50 text-blue-700 px-3 py-0.5 rounded-full font-bold text-xs">{t.target}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="ios-card p-5 border-l-4 border-green-500 bg-green-50/20 text-center">
      <p className="text-[10px] text-green-600 font-bold uppercase mb-1">复苏稳定期推荐 SpO2</p>
      <p className="text-3xl font-black text-green-900">{STABLE_SPO2_TARGET}</p>
      <p className="text-[10px] text-green-600 mt-2 font-medium italic">滴定氧浓度维持此范围，严防高氧损伤</p>
    </div>
  </div>
);

const ChecklistView: React.FC = () => (
  <div className="flex flex-col gap-4 animate-in fade-in duration-300">
    {Object.entries(CHECKLIST_ITEMS).map(([key, items]) => (
      <div key={key} className="ios-card overflow-hidden">
        <div className={`p-4 border-b flex items-center justify-between ${key === 'pre' ? 'bg-blue-50 text-blue-800' : 'bg-purple-50 text-purple-800'}`}>
          <h3 className="font-bold flex items-center gap-2"><Check size={18} /> {key === 'pre' ? '复苏前核查' : '复苏后管理'}</h3>
          <span className="text-[9px] font-bold opacity-60 uppercase">{items.length} 条</span>
        </div>
        <div className="p-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
              <input type="checkbox" className="mt-1 w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-100" />
              <p className="text-[13px] text-gray-700 font-medium leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const TheoryView: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-gray-800 px-1">2025 NRP 核心理论</h2>
      {MAJOR_CONCEPTS.map((concept) => (
        <div key={concept.id} className="ios-card overflow-hidden">
          <button onClick={() => setSelected(selected === concept.id ? null : concept.id)} 
            className={`w-full flex items-center justify-between p-4 transition-colors ${selected === concept.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'}`}>
            <span className="font-bold text-[14px] text-left pr-4">{concept.title}</span>
            <ChevronRight size={18} className={`flex-shrink-0 transition-transform ${selected === concept.id ? 'rotate-90 text-white' : 'text-gray-400'}`} />
          </button>
          {selected === concept.id && (
            <div className="p-5 bg-white border-t text-[13px] text-gray-700 font-medium leading-relaxed">
              <div className="whitespace-pre-wrap">
                {concept.content.split(/(\*\*.*?\*\*)/g).map((part, i) => (
                  part.startsWith('**') ? <strong key={i} className="text-blue-900 font-bold">{part.slice(2, -2)}</strong> : part
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default App;
