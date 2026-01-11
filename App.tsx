
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  Stethoscope, 
  Activity, 
  BookOpen, 
  ClipboardList, 
  AlertCircle, 
  RotateCcw, 
  CheckCircle2, 
  Play, 
  Pause, 
  Timer,
  X,
  BellRing,
  Check,
  ArrowRightLeft,
  Heart,
  ListChecks,
  Info
} from 'lucide-react';
import { AppSection, CalculationResult } from './types';
import { SPO2_TARGETS, MAJOR_CONCEPTS, CHECKLIST_ITEMS } from './constants';

// 定义流程节点 ID
type NodeId = 
  | 'PREP'        // 准备与简报
  | 'BIRTH'       // 出生评估 (Term, Tone, Crying?)
  | 'INITIAL'     // 初始步骤 (Warm, Clear, Stimulate)
  | 'POST_INIT'   // 评估 (Apnea/Gasping? HR < 100?)
  | 'STABLE_LABOR'// 呼吸困难或持续青紫 (CPAP?)
  | 'PPV'         // 正压通气
  | 'PPV_EVAL'    // PPV 评估 (HR < 100?)
  | 'MRSOPA'      // 通气矫正步骤
  | 'COMPRESS'    // 胸外按压
  | 'MEDS'        // 药物治疗
  | 'POST_CARE';  // 复苏后护理 (闭环终点)

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
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">新生儿复苏-LZRYEK</h1>
          <span className="text-[10px] font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">2025 NRP 指南</span>
        </div>
        
        <div className="ios-card bg-white p-3 border border-gray-100 shadow-sm">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">体重 (kg)</label>
              <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full text-lg font-semibold bg-gray-50 border-none rounded-md px-2 py-1" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">孕周 (周)</label>
              <input type="number" value={ga} onChange={(e) => setGa(Number(e.target.value))} className="w-full text-lg font-semibold bg-gray-50 border-none rounded-md px-2 py-1" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] border-t border-gray-100 pt-2 font-medium">
            <div className="flex justify-between border-r pr-2"><span>气管插管:</span><span className="text-blue-600">ID {results.etSize}</span></div>
            <div className="flex justify-between"><span>深度:</span><span className="text-blue-600">{results.etDepth} cm</span></div>
            <div className="flex justify-between border-r pr-2"><span>肾上腺素IV:</span><span className="text-red-600">{results.epiIV}</span></div>
            <div className="flex justify-between"><span>生理盐水:</span><span className="text-green-600">{results.volumeExpansion}</span></div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 overflow-y-auto">
        {activeSection === AppSection.GUIDANCE ? (
          <GuidanceView 
            node={currentNode} 
            setNode={setCurrentNode}
            seconds={seconds} 
            isTimerRunning={isTimerRunning}
            setIsTimerRunning={setIsTimerRunning}
            formatTime={formatTime}
            resetAll={resetAll}
          />
        ) : activeSection === AppSection.GOALS ? (
          <GoalsView />
        ) : activeSection === AppSection.CHECKLIST ? (
          <ChecklistView />
        ) : (
          <TheoryView />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 ios-blur border-t border-gray-200 px-2 pb-6 pt-2 flex justify-around items-center">
        <NavButton active={activeSection === AppSection.GUIDANCE} onClick={() => setActiveSection(AppSection.GUIDANCE)} icon={<Activity size={24} />} label="决策引导" />
        <NavButton active={activeSection === AppSection.GOALS} onClick={() => setActiveSection(AppSection.GOALS)} icon={<Heart size={24} />} label="生理目标" />
        <NavButton active={activeSection === AppSection.CHECKLIST} onClick={() => setActiveSection(AppSection.CHECKLIST)} icon={<ClipboardList size={24} />} label="核查清单" />
        <NavButton active={activeSection === AppSection.THEORY} onClick={() => setActiveSection(AppSection.THEORY)} icon={<BookOpen size={24} />} label="理论要点" />
      </nav>
    </div>
  );
};

/* --- Sub-Components --- */

const NavButton: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 w-1/4 transition-colors ${active ? 'text-blue-600' : 'text-gray-400'}`}>
    {icon}<span className="text-[10px] font-medium">{label}</span>
  </button>
);

const GuidanceView: React.FC<{
  node: NodeId, 
  setNode: (n: NodeId) => void, 
  seconds: number, 
  isTimerRunning: boolean, 
  setIsTimerRunning: (r: boolean) => void,
  formatTime: (s: number) => string,
  resetAll: () => void
}> = ({ node, setNode, seconds, isTimerRunning, setIsTimerRunning, formatTime, resetAll }) => {
  const [nodeSeconds, setNodeSeconds] = useState(0);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    setNodeSeconds(0);
    setShowReminder(false);
  }, [node]);

  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      interval = window.setInterval(() => setNodeSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, node]);

  useEffect(() => {
    if (nodeSeconds === 30) setShowReminder(true);
  }, [nodeSeconds]);

  const timerColor = seconds >= 60 ? 'text-red-500' : seconds >= 30 ? 'text-orange-500' : 'text-blue-600';

  // 获取当前秒数对应的目标 SpO2
  const getCurrentSpO2Target = (s: number) => {
    if (s <= 60) return "60%-65%";
    if (s <= 120) return "65%-70%";
    if (s <= 180) return "70%-75%";
    if (s <= 240) return "75%-80%";
    if (s <= 300) return "80%-85%";
    return "85%-95%";
  };

  // 渲染节点内容
  const renderNode = () => {
    switch (node) {
      case 'PREP': return {
        title: "准备与简报",
        desc: "预判风险，分工协作。检查所有复苏设备。",
        details: [
          "进行产前咨询与风险评估",
          "指定团队负责人并分配复苏角色",
          "检查：辐射保暖台、氧源、T组合、吸痰球、喉镜等",
          "确认环境温度适宜，备好温热毛巾"
        ],
        actions: [
          { label: "出生 (计时开始)", next: 'BIRTH', primary: true, onAction: () => setIsTimerRunning(true) }
        ]
      };
      case 'BIRTH': return {
        title: "出生评估",
        desc: "快速评估新生儿出生状态，决定后续路径。",
        details: [
          "足月吗？（询问孕周）",
          "肌张力好吗？（观察肢体活动）",
          "有呼吸或哭声吗？（听觉与视觉评估）",
          "若三者皆是，转入母亲怀中进行皮肤接触护理"
        ],
        actions: [
          { label: "是 (转入常规护理)", next: 'POST_CARE', primary: false },
          { label: "否 (进入初始步骤)", next: 'INITIAL', primary: true }
        ]
      };
      case 'INITIAL': return {
        title: "初始步骤",
        desc: "针对非活力儿的初步干预，需在30秒内完成。",
        details: [
          "保暖：置于辐射保暖台下",
          "摆正体位：使气道开放（“嗅探位”）",
          "必要时清理气道：先口后鼻吸引",
          "擦干全身：移除湿毛巾并更换干毛巾",
          "刺激：摩擦背部或足底"
        ],
        actions: [
          { label: "完成评估", next: 'POST_INIT', primary: true }
        ]
      };
      case 'POST_INIT': return {
        title: "再次评估",
        desc: "决定是否需要开始正压通气（PPV）。",
        details: [
          "是否存在呼吸暂停或喘息？",
          "心率（HR）是否 < 100bpm？",
          "注意：心率评估首选听诊或心电图，触摸脐带搏动不可靠",
          "若存在以上任一情况，应立即开始 PPV"
        ],
        actions: [
          { label: "是 (开始 PPV)", next: 'PPV', primary: true },
          { label: "否 (检查呼吸窘迫)", next: 'STABLE_LABOR', primary: false }
        ]
      };
      case 'STABLE_LABOR': return {
        title: "辅助呼吸阶段",
        desc: "针对有自主呼吸但仍有困难的新生儿。",
        details: [
          "清理气道，监测右手导管前血氧 (SpO2)",
          "持续气道正压通气 (CPAP)：起始压力 5-8 cmH2O",
          "考虑给氧：目标值根据生后分钟数调整",
          "持续观察呼吸努力度和心率稳定性"
        ],
        actions: [
          { label: "生命体征稳定", next: 'POST_CARE', primary: true },
          { label: "病情恶化 (转 PPV)", next: 'PPV', primary: false }
        ]
      };
      case 'PPV': return {
        title: "正压通气 (PPV)",
        desc: "复苏中最关键的步骤。",
        details: [
          "频率：40-60 次/分（“吸-二-三-吸-二-三”）",
          "起始 PIP：20-25 cmH2O（早产儿可稍低）",
          "PEEP：建议 5 cmH2O",
          "连接脉氧仪，右手(导管前)测得 SpO2",
          "第一个15秒：观察心率是否上升和胸廓起伏"
        ],
        actions: [
          { label: "15-30秒后评估 HR", next: 'PPV_EVAL', primary: true }
        ]
      };
      case 'PPV_EVAL': return {
        title: "通气效果评估",
        desc: "判断通气是否有效并决定下一步。",
        details: [
          "心率正在上升吗？如果是，继续 PPV",
          "心率不升但胸廓有起伏吗？如果是，继续 PPV 至30秒再评估",
          "胸廓无起伏吗？立即执行 MRSOPA 矫正步骤",
          "目标：在生后 60s 内建立有效通气"
        ],
        actions: [
          { label: "是 (维持并过渡)", next: 'POST_CARE', primary: false },
          { label: "否 (检查通气矫正)", next: 'MRSOPA', primary: true }
        ]
      };
      case 'MRSOPA': return {
        title: "通气矫正 (MRSOPA)",
        desc: "当 PPV 效果不佳时，按顺序执行矫正。",
        details: [
          "M (Mask): 调整面罩，确保密封",
          "R (Reposition): 重新摆正气道（嗅探位）",
          "S (Suction): 吸引口鼻分泌物",
          "O (Open): 张开新生儿口腔",
          "P (Pressure): 增加通气压力（最高40 cmH2O）",
          "A (Alternative): 建立人工气道。**注意：若矫正后胸廓仍无起伏，必须考虑立即气管插管。**"
        ],
        actions: [
          { label: "HR < 60 (准备按压)", next: 'COMPRESS', primary: true },
          { label: "HR >= 60 (继续 PPV)", next: 'PPV', primary: false }
        ]
      };
      case 'COMPRESS': return {
        title: "胸外按压",
        desc: "循环支持。**注意：开始按压前应已完成气管插管。**",
        details: [
          "指征：充分 PPV 30秒后 HR < 60bpm",
          "插管：强烈建议在开始按压前完成气管插管或喉罩置入",
          "手法：双拇指环抱法，深度达胸廓前后径 1/3",
          "频率：90次按压 + 30次通气（3:1 协调）",
          "氧气：此时必须将氧浓度上调至 100%"
        ],
        actions: [
          { label: "60秒后评估 HR < 60?", next: 'MEDS', primary: true },
          { label: "HR 已恢复 > 60", next: 'PPV', primary: false }
        ]
      };
      case 'MEDS': return {
        title: "药物介入",
        desc: "当按压无法维持心率时。",
        details: [
          "肾上腺素：首选静脉或骨内（IV/IO）给药",
          "剂量：0.1-0.3 mL/kg (1:10000 稀释液)",
          "插管给药：若静脉未建立，可通过气管导管给药 (0.5-1.0 mL/kg)",
          "每 3-5 分钟可重复一次",
          "考虑：血容量不足或气胸"
        ],
        actions: [
          { label: "继续循环反馈", next: 'COMPRESS', primary: true },
          { label: "好转退出", next: 'POST_CARE', primary: false }
        ]
      };
      case 'POST_CARE': return {
        title: "复苏后管理",
        desc: "复苏后的生命支持与观察。",
        details: [
          "监测：HR, RR, 右手导管前SpO2, 血压",
          "插管管理：若已插管，需确认导管位置，监测呼气末CO2",
          "维持：正常体温（36.5-37.5°C）和血糖平衡",
          "评估：神经学评分，是否存在 HIE 风险（考虑亚低温）",
          "复盘：团队总结"
        ],
        actions: [
          { label: "完成/重置流程", next: 'PREP', primary: true, onAction: resetAll }
        ]
      };
      default: return { title: "", desc: "", details: [], actions: [] };
    }
  };

  const content = renderNode();

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 pb-4">
      {/* 状态提醒 */}
      {showReminder && (
        <div className="bg-amber-100 border border-amber-200 p-3 rounded-xl flex items-start gap-2 shadow-sm animate-bounce-short">
          <BellRing size={16} className="text-amber-600 mt-0.5" />
          <p className="text-[11px] text-amber-800 font-medium">当前阶段已持续 {nodeSeconds}s。请尽快做出决策进入下一步。</p>
          <button onClick={() => setShowReminder(false)}><X size={14} className="text-amber-400" /></button>
        </div>
      )}

      {/* 计时器卡片 */}
      <div className="ios-card p-4 flex items-center justify-between border border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isTimerRunning ? 'bg-blue-100 animate-pulse' : 'bg-gray-100'}`}><Timer size={20} className={isTimerRunning ? 'text-blue-600' : 'text-gray-400'} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">总时长</p>
            <p className={`text-3xl font-mono font-bold ${timerColor}`}>{formatTime(seconds)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`p-3 rounded-full ${isTimerRunning ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{isTimerRunning ? <Pause size={18}/> : <Play size={18}/>}</button>
          <button onClick={resetAll} className="p-3 rounded-full bg-gray-100 text-gray-400"><RotateCcw size={18}/></button>
        </div>
      </div>

      {/* 阶段进度条 */}
      <div className="flex gap-1 px-1">
        {['初始', '通气', '按压', '给药'].map((l, i) => {
          const isActive = (node === 'PREP' || node === 'BIRTH' || node === 'INITIAL' || node === 'POST_INIT') ? i===0 :
                           (node === 'PPV' || node === 'PPV_EVAL' || node === 'MRSOPA' || node === 'STABLE_LABOR') ? i===1 :
                           (node === 'COMPRESS') ? i===2 : i===3;
          return (
            <div key={l} className="flex-1 flex flex-col gap-1">
              <div className={`h-1.5 rounded-full ${isActive ? 'bg-blue-600 shadow-sm shadow-blue-200' : 'bg-gray-200'}`}></div>
              <span className={`text-[8px] text-center font-bold ${isActive ? 'text-blue-600' : 'text-gray-300'}`}>{l}</span>
            </div>
          );
        })}
      </div>

      {/* 主决策卡片 */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5"><Activity size={80}/></div>
        <div className="mb-4">
          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">当前步骤</span>
          <h2 className="text-2xl font-black text-gray-900 mt-1">{content.title}</h2>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">{content.desc}</p>
        
        <div className="flex flex-col gap-3">
          {content.actions.map((act, i) => (
            <button 
              key={i} 
              onClick={() => { if(act.onAction) act.onAction(); setNode(act.next); }}
              className={`w-full py-4 px-6 rounded-2xl flex items-center justify-between font-bold transition-all active:scale-[0.98] ${act.primary ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-700'}`}
            >
              {act.label} <ChevronRight size={18}/>
            </button>
          ))}
        </div>
      </div>

      {/* 详细细节版块 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <ListChecks size={18} className="text-gray-500" />
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">执行细节与指引</h3>
        </div>
        <div className="p-4 space-y-3">
          {content.details.map((detail, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                {detail}
              </p>
            </div>
          ))}
          {content.details.length === 0 && (
            <p className="text-xs text-gray-400 italic text-center py-2">无当前步骤的额外细节</p>
          )}
        </div>
        <div className="px-4 py-2 bg-blue-50 flex items-center gap-2">
          <Info size={12} className="text-blue-500" />
          <span className="text-[10px] text-blue-700 font-medium">请按照 2025 NRP 指南标准操作</span>
        </div>
      </div>

      {/* SpO2 目标提醒 - 强化说明 */}
      {seconds > 0 && seconds <= 600 && (
        <div className="bg-blue-50 rounded-2xl p-4 flex flex-col gap-2 border border-blue-100 animate-in fade-in slide-in-from-right duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-800">生后导管前(右手) SpO2 目标:</span>
            </div>
            <span className="text-sm font-black text-blue-700">{getCurrentSpO2Target(seconds)}</span>
          </div>
          <div className="flex items-start gap-1">
            <Info size={10} className="text-blue-400 mt-0.5" />
            <p className="text-[9px] text-blue-600 italic">注：此目标仅随生后时间改变，与是否气管插管无关。</p>
          </div>
        </div>
      )}
    </div>
  );
};

const GoalsView: React.FC = () => (
  <div className="flex flex-col gap-4 animate-in fade-in duration-300">
    <div className="ios-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-500 flex items-center gap-2"><Activity size={16} className="text-blue-500" /> 生后导管前 (Pre-ductal) SpO2 目标</h3>
        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold">右手腕监测</span>
      </div>
      <div className="space-y-3">
        {SPO2_TARGETS.map((t, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-gray-700 font-medium">{t.time}</span>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold text-sm">{t.target}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
        <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
          <strong>重要：</strong>SpO2 目标曲线严格取决于出生后的时间（分钟）。无论采取何种呼吸支持手段（面罩 PPV、CPAP 或气管插管），目标值均保持一致。
        </p>
      </div>
    </div>
    <div className="ios-card p-5">
      <h3 className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-2"><Stethoscope size={16} className="text-green-500" /> 核心生理目标</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-green-50 rounded-xl"><p className="text-[10px] text-green-600 font-bold uppercase mb-1">体温目标</p><p className="text-xl font-bold text-green-900">36.5-37.5°C</p></div>
        <div className="p-4 bg-orange-50 rounded-xl"><p className="text-[10px] text-orange-600 font-bold uppercase mb-1">按压频率</p><p className="text-xl font-bold text-orange-900">90 次/分</p></div>
        <div className="p-4 bg-purple-50 rounded-xl"><p className="text-[10px] text-purple-600 font-bold uppercase mb-1">通气频率</p><p className="text-xl font-bold text-purple-900">40-60 次/分</p></div>
        <div className="p-4 bg-blue-50 rounded-xl"><p className="text-[10px] text-blue-600 font-bold uppercase mb-1">按压比例</p><p className="text-xl font-bold text-blue-900">3:1</p></div>
      </div>
    </div>
  </div>
);

const ChecklistView: React.FC = () => (
  <div className="flex flex-col gap-4 animate-in fade-in duration-300">
    <div className="ios-card overflow-hidden">
      <div className="bg-blue-50 p-4 border-b border-blue-100"><h3 className="text-blue-800 font-bold flex items-center gap-2"><Check size={18} /> 复苏前准备</h3></div>
      <div className="p-2">{CHECKLIST_ITEMS.pre.map((item, idx) => (<div key={idx} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg"><input type="checkbox" className="mt-1 w-5 h-5" /><span className="text-sm text-gray-700">{item}</span></div>))}</div>
    </div>
    <div className="ios-card overflow-hidden">
      <div className="bg-purple-50 p-4 border-b border-purple-100"><h3 className="text-purple-800 font-bold flex items-center gap-2"><Check size={18} /> 复苏后管理</h3></div>
      <div className="p-2">{CHECKLIST_ITEMS.post.map((item, idx) => (<div key={idx} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg"><input type="checkbox" className="mt-1 w-5 h-5" /><span className="text-sm text-gray-700">{item}</span></div>))}</div>
    </div>
  </div>
);

const TheoryView: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-gray-800 px-1">2025 NRP 核心理论</h2>
      {MAJOR_CONCEPTS.map((concept) => (
        <div key={concept.id} className="ios-card overflow-hidden">
          <button onClick={() => setSelected(selected === concept.id ? null : concept.id)} className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50">
            <span className="font-bold text-gray-800">{concept.title}</span>
            <ChevronRight size={18} className={`text-gray-400 transition-transform ${selected === concept.id ? 'rotate-90' : ''}`} />
          </button>
          {selected === concept.id && <div className="p-4 bg-blue-50/30 border-t border-blue-50 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{concept.content}</div>}
        </div>
      ))}
    </div>
  );
};

export default App;
