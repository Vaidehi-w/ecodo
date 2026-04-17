import { useState, useEffect, useRef } from "react";
import { getEcoInsight } from "./gemini";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Assets
import fireIcon from "./assets/fire.jpg";
import jungleHeader from "./assets/jungle.jpg";
import aiBotIcon from "./assets/AIBot.png";

const ECO_TASKS = [
  { id: 1, label: "Use public transport or cycle", category: "Travel", type: "transportation" },
  { id: 2, label: "Fix leaking taps or quick showers", category: "Water", type: "water" },
  { id: 3, label: "Switch off unnecessary lights", category: "Energy", type: "energy" },
  { id: 4, label: "Avoid single-use plastic", category: "Waste", type: "waste" },
  { id: 5, label: "Plant a tree or home garden", category: "Greenery", type: "nature" },
  { id: 6, label: "Use digital notes instead of paper", category: "Digital", type: "paper" },
  { id: 7, label: "Compost kitchen waste", category: "Waste", type: "compost" },
  { id: 8, label: "Unplug chargers after use", category: "Energy", type: "vampire_power" },
  { id: 9, label: "Buy local produce", category: "Shopping", type: "food_miles" },
];

function App() {
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const [activeCategory, setActiveCategory] = useState("Daily Impact Score");
  const [isLogPageOpen, setIsLogPageOpen] = useState(false);
  const [efficiency, setEfficiency] = useState(0); // New % state
  const [aiComment, setAiComment] = useState("Track an action to see your impact percentage.");
  
  const [impactData, setImpactData] = useState([
    { name: 'Carbon', value: 33, fill: '#4ade80' },
    { name: 'Water', value: 33, fill: '#60a5fa' },
    { name: 'Energy', value: 33, fill: '#fb923c' },
  ]);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([{ role: "ai", text: "Hey! Let's check your green stats today." }]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const savedStreak = localStorage.getItem("eco-streak");
    if (savedStreak) setStreak(Number(savedStreak));
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTrackAction = async (task) => {
    setIsLogPageOpen(false);
    setLoading(true);
    
    try {
      // Improved Prompt for valid data and % logic
      const prompt = `User did: "${task.label}". 1. Give a 1-sentence casual comment about the impact. 2. Provide a 'Sustainability Percentage' (1-100) based on how much this helps a daily carbon footprint. 3. Provide 3 values: Carbon(kg), Water(L), Energy(kWh). Format: Comment | %:X, Carbon:Y, Water:Z, Energy:W. No emojis.`;
      
      const response = await getEcoInsight(prompt);
      const [comment, stats] = response.split('|');
      
      // Parsing the values from the AI string
      const pct = stats.match(/%:\s*(\d+)/)[1];
      const carbon = stats.match(/Carbon:\s*(\d+)/)[1];
      const water = stats.match(/Water:\s*(\d+)/)[1];
      const energy = stats.match(/Energy:\s*(\d+)/)[1];

      setAiComment(comment.trim());
      setEfficiency(parseInt(pct));
      setImpactData([
        { name: 'Carbon', value: parseInt(carbon), fill: '#4ade80' },
        { name: 'Water', value: parseInt(water), fill: '#60a5fa' },
        { name: 'Energy', value: parseInt(energy), fill: '#fb923c' },
      ]);

      setStreak(prev => prev + 1);
      localStorage.setItem("eco-streak", streak + 1);
    } catch (err) {
      setAiComment("Data error, but your action is 100% helpful!");
    }
    setLoading(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");
    try {
      const response = await getEcoInsight(`Casual chat: ${userMsg}. No emojis.`);
      setMessages(prev => [...prev, { role: "ai", text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", text: "Cloudy connection, try again!" }]);
    }
  };

  return (
    <div className="eco-app-container">
      {/* SIDEBAR */}
      <aside className="app-sidebar">
        <div className="brand"><h1 className="logo">Eco<span>Do</span></h1></div>
        <nav className="side-nav">
          <button className="nav-btn active">Live Dashboard</button>
          <button className="nav-btn">Impact History</button>
          <button className="nav-btn">Global Goals</button>
        </nav>
        
        <div className="streak-wrapper">
          <div className="streak-card">
            <div className="fire-container">
              <img src={fireIcon} alt="Streak" className="fire-img" />
              <div className="fire-glow"></div>
            </div>
            <div className="streak-stats">
              <span className="streak-label">Eco-Streak</span>
              <strong className="streak-val">{streak} Days</strong>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="app-main">
        <header className="app-header" style={{ backgroundImage: `url(${jungleHeader})` }}>
          <div className="header-mask">
            <div className="header-info">
              <h1>Environmental Impact</h1>
              <p>Real-time data for your green contributions.</p>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="home-action-section">
             <h3>Ready to improve your score?</h3>
             <button className="log-action-btn" onClick={() => setIsLogPageOpen(true)}>
               {loading ? "Calculating Data..." : "Add what you did"}
             </button>
          </section>

          {/* DATA IMPACT PANEL */}
          <section className="ai-panel">
            <div className="ai-card">
              <h4>{activeCategory}</h4>
              
              {/* PERCENTAGE DISPLAY */}
              <div className="efficiency-box">
                <span className="pct-num">{efficiency}%</span>
                <p>Sustainability Rating</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${efficiency}%` }}></div>
                </div>
              </div>

              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={impactData} innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value">
                      {impactData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="ai-commentary">
                <p>"{aiComment}"</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* CHATBOT */}
      <div className={`chat-box ${isChatOpen ? 'open' : ''}`}>
        <div className="chat-window">
          <div className="chat-header">Eco Assistant</div>
          <div className="chat-body">
            {messages.map((m, i) => <div key={i} className={`msg ${m.role}`}>{m.text}</div>)}
            <div ref={chatEndRef} />
          </div>
          <form className="chat-input" onSubmit={(e) => { e.preventDefault(); handleChat(); }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." />
          </form>
        </div>
        <div className="fixed-ai-bot" onClick={() => setIsChatOpen(!isChatOpen)}>
          <img src={aiBotIcon} alt="AI" />
        </div>
      </div>

      {/* OVERLAY */}
      {isLogPageOpen && (
         <div className="log-page-overlay">
            <div className="log-page-content">
               <header className="log-header">
                 <h2>Log a Green Act</h2>
                 <button className="close-x" onClick={() => setIsLogPageOpen(false)}>×</button>
               </header>
               <div className="tasks-grid">
                  {ECO_TASKS.map((task) => (
                    <div key={task.id} className="task-card" onClick={() => handleTrackAction(task)}>
                       <span className="task-cat">{task.category}</span>
                       <p className="task-label">{task.label}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      )}

      <style>{`
        :root { --dark: #0d0f0d; --panel: #161a16; --green: #4ade80; --text: #e2e8f0; --accent: #fb923c; }
        .eco-app-container { display: flex; height: 100vh; background: var(--dark); color: var(--text); font-family: 'Inter', sans-serif; overflow: hidden; }
        
        .app-sidebar { width: 280px; background: var(--panel); padding: 40px 20px; display: flex; flex-direction: column; border-right: 1px solid #222; }
        .logo { font-size: 2.2rem; color: var(--green); margin-bottom: 40px; font-weight: 800; }
        .logo span { color: white; }
        .side-nav { flex: 1; display: flex; flex-direction: column; gap: 12px; }
        .nav-btn { background: none; border: none; color: #94a3b8; text-align: left; padding: 14px; border-radius: 10px; cursor: pointer; }
        .nav-btn.active { background: rgba(74, 222, 128, 0.1); color: var(--green); }
        
        .streak-card { background: #1e241e; padding: 20px; border-radius: 20px; display: flex; align-items: center; gap: 18px; border: 1px solid rgba(251, 146, 60, 0.2); }
        .fire-img { width: 50px; height: 50px; border-radius: 50%; border: 2px solid var(--accent); }
        .streak-val { font-size: 1.4rem; color: var(--accent); display: block; }

        .app-main { flex: 1; overflow-y: auto; }
        .app-header { height: 280px; background-size: cover; background-position: center; position: relative; }
        .header-mask { height: 100%; background: linear-gradient(to top, var(--dark), transparent); display: flex; align-items: flex-end; padding: 40px; }
        
        .dashboard-content { padding: 40px; display: grid; grid-template-columns: 1fr 380px; gap: 30px; }
        .home-action-section { background: var(--panel); border-radius: 24px; padding: 50px; text-align: center; border: 1px solid #222; }
        .log-action-btn { background: var(--green); color: black; padding: 18px 45px; border-radius: 50px; border: none; font-weight: 800; cursor: pointer; }

        .ai-card { background: #1a201a; padding: 30px; border-radius: 24px; text-align: center; border: 1px solid #2d352d; }
        
        /* PERCENTAGE UI */
        .efficiency-box { margin-bottom: 20px; }
        .pct-num { font-size: 3rem; font-weight: 900; color: var(--green); }
        .progress-bar { height: 8px; background: #222; border-radius: 10px; margin-top: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--green); transition: 1s ease; }

        .ai-commentary { margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 15px; font-style: italic; font-size: 0.9rem; }

        .chat-box { position: fixed; bottom: 30px; right: 30px; z-index: 1000; }
        .chat-window { width: 320px; height: 450px; background: #161a16; border: 1px solid #333; border-radius: 20px; display: none; flex-direction: column; margin-bottom: 20px; overflow: hidden; }
        .chat-box.open .chat-window { display: flex; }
        .chat-header { padding: 15px; background: #000; font-weight: bold; text-align: center; }
        .chat-body { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
        .msg { padding: 10px 14px; border-radius: 12px; font-size: 0.9rem; max-width: 85%; }
        .msg.ai { background: #2d332d; align-self: flex-start; }
        .msg.user { background: var(--green); color: black; align-self: flex-end; }
        .chat-input { padding: 15px; background: #0a0c0a; }
        .chat-input input { width: 100%; background: transparent; border: none; color: white; outline: none; }
        
        .fixed-ai-bot { width: 75px; height: 75px; cursor: pointer; border-radius: 50%; border: 3px solid var(--green); overflow: hidden; background: white; }
        .fixed-ai-bot img { width: 100%; height: 100%; object-fit: cover; }

        .log-page-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 2000; display: flex; justify-content: center; backdrop-filter: blur(10px); padding: 40px; }
        .log-page-content { width: 100%; max-width: 900px; }
        .log-header { display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 20px; }
        .close-x { background: none; border: none; color: white; font-size: 2.5rem; cursor: pointer; }
        .tasks-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; margin-top: 30px; }
        .task-card { background: #161a16; padding: 25px; border-radius: 20px; border: 1px solid #2d352d; cursor: pointer; }
        .task-card:hover { border-color: var(--green); background: #1e241e; }
      `}</style>
    </div>
  );
}

export default App;