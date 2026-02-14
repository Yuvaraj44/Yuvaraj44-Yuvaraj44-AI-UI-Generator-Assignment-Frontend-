


import React, { useState, useRef, useEffect } from 'react';
import Button from '../../../Shared/Components/Buttonpage/Buttonpage';
import Card from '../../../Shared/Components/Card/Cardpage';
import Input from '../../../Shared/Components/Input/Inputpage';
import Table from '../../../Shared/Components/Tablepage/Tablepage';
import Modal from '../../../Shared/Components/Modalpage/Modalpage';
import Sidebar from '../../../Shared/Components/Sidebar/Sidebarpage';
import Navbar from '../../../Shared/Components/Navbar/Navbarpage';
import Chart from '../../../Shared/Components/Chart/Chartpage';

const COMPONENT_REGISTRY = {
  button: Button,
  card: Card,
  input: Input,
  table: Table,
  modal: Modal,
  sidebar: Sidebar,
  navbar: Navbar,
  chart: Chart,
};

function Homepage() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [uiTree, setUiTree] = useState([]);
  const [componentCode, setComponentCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAgent, setCurrentAgent] = useState("");
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");

  // Version control state
  const [versionHistory, setVersionHistory] = useState([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Edit message state
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);
  const [editedContent, setEditedContent] = useState("");

  // Code editor state
  const [codeEditorContent, setCodeEditorContent] = useState("");
  const [isCodeEditable, setIsCodeEditable] = useState(false);

  const chatEndRef = useRef(null);

  // Auto-scroll chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Sync code editor with generated code
  useEffect(() => {
    if (componentCode && !isCodeEditable) {
      setCodeEditorContent(componentCode);
    }
  }, [componentCode, isCodeEditable]);

  // Extract component summary
  const getComponentSummary = (tree) => {
    const components = new Set();
    const traverse = (node) => {
      if (node.component) components.add(node.component);
      if (node.children) node.children.forEach(traverse);
    };
    tree.forEach(traverse);
    return Array.from(components);
  };

  // Render component tree to React elements
  const renderComponent = (node, index = 0) => {
    if (!node) return null;
    const { component, props = {}, children } = node;
    const Component = COMPONENT_REGISTRY[component?.toLowerCase()];

    if (!Component) {
      return (
        <div key={index} className="p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          ⚠️ Unknown component: {component}
        </div>
      );
    }

    if (children && children.length > 0) {
      return (
        <Component key={node.id || index} {...props}>
          {children.map((child, i) => renderComponent(child, i))}
        </Component>
      );
    }

    return <Component key={node.id || index} {...props} />;
  };

  // Generate React code from component tree
  const generateReactCode = (tree) => {
    const generateNodeCode = (node, indent = 2) => {
      const { component, props = {}, children } = node;
      const spaces = ' '.repeat(indent);
      const componentName = component.charAt(0).toUpperCase() + component.slice(1);

      const propsString = Object.entries(props)
        .map(([key, value]) => {
          if (typeof value === 'string') return `${key}="${value}"`;
          if (typeof value === 'boolean') return value ? key : '';
          if (Array.isArray(value) || typeof value === 'object') {
            return `${key}={${JSON.stringify(value)}}`;
          }
          return `${key}={${value}}`;
        })
        .filter(Boolean)
        .join(' ');

      if (children && children.length > 0) {
        const childrenCode = children
          .map(child => generateNodeCode(child, indent + 2))
          .join('\n');
        return `${spaces}<${componentName} ${propsString}>\n${childrenCode}\n${spaces}</${componentName}>`;
      }

      return `${spaces}<${componentName} ${propsString} />`;
    };

    const code = tree.map(node => generateNodeCode(node, 2)).join('\n');

    return `import React from 'react';
import Button from './components/Button';
import Card from './components/Card';
import Input from './components/Input';
import Table from './components/Table';
import Modal from './components/Modal';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Chart from './components/Chart';

function GeneratedUI() {
  return (
    <div className="p-4 space-y-4">
${code}
    </div>
  );
}

export default GeneratedUI;`;
  };

  // Handle message editing
  const handleEditMessage = (index) => {
    const msg = chatHistory[index];
    if (msg.role === 'user') {
      setEditingMessageIndex(index);
      setEditedContent(msg.content);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageIndex(null);
    setEditedContent("");
  };

  const handleResendEdit = async () => {
    if (!editedContent.trim() || editingMessageIndex === null) return;

    // Find UI state before this message
    const messagesBeforeEdit = chatHistory.slice(0, editingMessageIndex);
    const lastAssistantMessage = messagesBeforeEdit
      .reverse()
      .find(msg => msg.role === 'assistant');

    const previousTree = lastAssistantMessage?.componentTree || [];

    // Remove messages from edit point onwards
    setChatHistory(prev => prev.slice(0, editingMessageIndex));

    setMessage(editedContent);
    setEditingMessageIndex(null);
    setEditedContent("");

    // Restore UI state
    setUiTree(previousTree);
    if (previousTree.length > 0) {
      setComponentCode(generateReactCode(previousTree));
    } else {
      setComponentCode("");
    }

    // Generate with edited message
    await handleGenerate(editedContent, previousTree);
  };

  // Main generation function
  const handleGenerate = async (customMessage = null, customTree = null) => {
    const messageToSend = customMessage || message;
    const treeToUse = customTree !== null ? customTree : uiTree;

    if (!messageToSend.trim()) return;

    // Save current state to version history
    if (treeToUse.length > 0) {
      setVersionHistory(prev => [...prev, {
        tree: JSON.parse(JSON.stringify(treeToUse)),
        code: componentCode,
        message: messageToSend.substring(0, 50) + (messageToSend.length > 50 ? '...' : ''),
        timestamp: new Date().toISOString()
      }]);
    }

    setIsGenerating(true);
    setError("");

    try {
      console.log("=== STARTING GENERATION ===");
      console.log("Message:", messageToSend);
      console.log("Current tree length:", treeToUse.length);

      setCurrentAgent("1️⃣ Planner analyzing...");
      await new Promise(r => setTimeout(r, 300));

      const response = await fetch("http://localhost:4000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          currentTree: treeToUse
        }),
      });

      setCurrentAgent("2️⃣ Generator building...");
      await new Promise(r => setTimeout(r, 300));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Generation failed");
      }

      const { componentTree, explanation, metadata, plan } = await response.json();

      setCurrentAgent("3️⃣ Explainer documenting...");
      await new Promise(r => setTimeout(r, 300));

      console.log("Generated:", componentTree.length, "components");

      setUiTree(componentTree);
      const newCode = generateReactCode(componentTree);
      setComponentCode(newCode);
      setExplanation(explanation);

      setChatHistory(prev => [...prev, {
        role: 'user',
        content: messageToSend,
        timestamp: new Date().toLocaleTimeString()
      }, {
        role: 'assistant',
        content: explanation,
        componentTree,
        components: getComponentSummary(componentTree),
        metadata,
        plan,
        timestamp: new Date().toLocaleTimeString()
      }]);

      if (!customMessage) {
        setMessage("");
      }

      setTimeout(scrollToBottom, 100);

    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setIsGenerating(false);
      setCurrentAgent("");
    }
  };

  // Version rollback
  const handleRollback = (version) => {
    setUiTree(version.tree);
    setComponentCode(version.code);
    setShowVersionHistory(false);

    // Add to chat history
    setChatHistory(prev => [...prev, {
      role: 'system',
      content: `Rolled back to version from ${new Date(version.timestamp).toLocaleString()}`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Clear all
  const handleClear = () => {
    if (window.confirm("Clear all and start fresh?")) {
      setUiTree([]);
      setComponentCode("");
      setChatHistory([]);
      setExplanation("");
      setMessage("");
      setError("");
      setEditingMessageIndex(null);
      setEditedContent("");
      setVersionHistory([]);
      setCodeEditorContent("");
    }
  };

  // Copy code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(isCodeEditable ? codeEditorContent : componentCode);
    alert("Code copied to clipboard!");
  };

  // Regenerate from edited code
  const handleRegenerateFromCode = () => {
    try {
      // Simple parsing - in production, use proper parser
      alert("Code regeneration feature - would parse and regenerate component tree from edited code");
    } catch (error) {
      setError("Failed to parse edited code");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      {/* Top Navbar */}
      <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
              AI
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Deterministic UI Generator</h1>
              <p className="text-xs text-slate-400">3-Agent Pipeline • Fixed Component Library</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm border border-slate-700 transition-all"
          >
            🕒 History ({versionHistory.length})
          </button>
          <button
            onClick={handleClear}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm border border-slate-700 transition-all disabled:opacity-50"
          >
            🗑️ Clear
          </button>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-73px)]">
        {/* LEFT PANEL - Chat Interface */}
        <div className="w-1/3 bg-slate-900 border-r border-slate-800 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-bold text-amber-400">💬 AI Chat</h2>
            <p className="text-xs text-slate-500 mt-1">Describe your UI in plain English</p>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatHistory.length === 0 && (
              <div className="text-slate-500 text-center py-12">
                <div className="text-5xl mb-4">🎨</div>
                <div className="font-semibold mb-2">Start Building</div>
                <div className="text-sm px-6 mb-4">
                  Describe any UI using our 8 fixed components
                </div>
                <div className="text-xs text-slate-600 space-y-1 text-left max-w-xs mx-auto">
                  <p>💡 Examples:</p>
                  <p className="pl-4">"create a login form"</p>
                  <p className="pl-4">"add a dashboard with charts"</p>
                  <p className="pl-4">"create button send and input"</p>
                  <p className="pl-4">"make this more minimal"</p>
                  <p className="pl-4">"remove the chart"</p>
                </div>
              </div>
            )}

            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`rounded-lg border ${msg.role === 'user'
                  ? 'bg-slate-800/50 border-slate-700'
                  : msg.role === 'system'
                    ? 'bg-blue-900/20 border-blue-700/30'
                    : 'bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-700/30'
                  }`}
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {msg.role === 'user' ? '👤' : msg.role === 'system' ? '⚙️' : '🤖'}
                    </span>
                    <span className="text-xs font-semibold text-amber-400">
                      {msg.role === 'user' ? 'You' : msg.role === 'system' ? 'System' : 'AI'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-slate-600">{msg.timestamp}</div>
                    {msg.role === 'user' && editingMessageIndex !== i && (
                      <button
                        onClick={() => handleEditMessage(i)}
                        className="text-xs px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3">
                  {msg.role === 'user' ? (
                    editingMessageIndex === i ? (
                      <div className="space-y-2">
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-slate-200 text-sm resize-none"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleResendEdit}
                            disabled={!editedContent.trim() || isGenerating}
                            className="flex-1 px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium"
                          >
                            🔄 Resend
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-200">{msg.content}</div>
                    )
                  ) : msg.role === 'system' ? (
                    <div className="text-sm text-blue-300">{msg.content}</div>
                  ) : (
                    <>
                      {msg.components && msg.components.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {msg.components.map((comp, idx) => (
                            <span key={idx} className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {comp}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-sm text-amber-100 leading-relaxed">{msg.content}</div>
                      {msg.metadata && (
                        <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-700/30">
                          📦 {msg.metadata.componentCount} components • {msg.metadata.action}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            <div ref={chatEndRef} />
          </div>

          
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            {error && (
              <div className="mb-2 p-2 bg-red-900/30 border border-red-700/50 rounded text-red-300 text-xs">
                ⚠️ {error}
              </div>
            )}
            {currentAgent && (
              <div className="mb-2 p-2 bg-blue-900/30 border border-blue-700/50 rounded text-blue-300 text-xs animate-pulse font-medium">
                {currentAgent}
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="space-y-2">
              <textarea
                placeholder="Describe your UI... (e.g., 'create a dashboard with charts and buttons')"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
                rows={3}
                disabled={editingMessageIndex !== null || isGenerating}
              />
              <button
                type="submit"
                disabled={!message.trim() || isGenerating || editingMessageIndex !== null}
                className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
              >
                {isGenerating ? '⏳ Generating...' : uiTree.length > 0 ? '➕ Modify UI' : '✨ Generate UI'}
              </button>
            </form>
          </div>
        </div>

        {/* CENTER PANEL - Generated Code */}
        <div className="flex-1 border-x border-slate-800 flex flex-col">
          <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-amber-400">📝 Generated Code</h2>
              <p className="text-xs text-slate-500 mt-0.5">React Component • Editable</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCodeEditable(!isCodeEditable)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${isCodeEditable
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}  >
                {isCodeEditable ? '🔓 Editable' : '🔒 Read-only'}
              </button>
              <button
                onClick={handleCopyCode}
                disabled={!componentCode}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs transition-all disabled:opacity-50"
              >
                📋 Copy
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-slate-950">
            {componentCode ? (
              isCodeEditable ? (
                <textarea
                  value={codeEditorContent}
                  onChange={(e) => setCodeEditorContent(e.target.value)}
                  className="w-full h-full bg-slate-950 text-slate-300 font-mono text-xs p-4 resize-none focus:outline-none border-none"
                  spellCheck={false}
                />
              ) : (
                <pre className="text-slate-300 font-mono text-xs leading-relaxed p-4">
                  <code>{componentCode}</code>
                </pre>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-slate-600">
                <div className="text-center">
                  <div className="text-6xl mb-4">💻</div>
                  <div className="font-semibold mb-2">No Code Yet</div>
                  <div className="text-sm">Generated React code will appear here</div>
                </div>
              </div>
            )}
          </div>

          {explanation && (
            <div className="border-t border-slate-800 p-4 bg-slate-900/50 max-h-40 overflow-y-auto">
              <h3 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-2">
                <span>📖</span>
                <span>AI Explanation</span>
              </h3>
              <div className="text-xs text-slate-300 leading-relaxed">
                {explanation}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - Live Preview */}
        <div className="w-1/3 flex flex-col bg-slate-900">
          <div className="bg-slate-900 border-b border-slate-800 p-4">
            <h2 className="font-bold text-amber-400">👁️ Live Preview</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time rendering</p>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-white">
            {uiTree.length > 0 ? (
              <div className="space-y-4">
                {uiTree.map((node, i) => (
                  <div key={i}>{renderComponent(node, i)}</div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <div className="font-semibold mb-2 text-gray-700">No Preview</div>
                  <div className="text-sm text-gray-500">UI will render here</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <h2 className="text-xl font-bold text-amber-400">🕒 Version History</h2>
              <button onClick={() => setShowVersionHistory(false)} className="text-slate-400 hover:text-white text-2xl leading-none"   >
                ×
              </button>
            </div>
            <div className="p-4 space-y-2">
              {versionHistory.length === 0 ? (
                <div className="text-slate-500 text-center py-8 text-sm">
                  No versions saved yet. Generate some UIs to build history!
                </div>
              ) : (
                versionHistory.slice().reverse().map((version, i) => (
                  <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-3 hover:border-amber-500 transition-colors"      >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-amber-300 text-sm">
                          Version {versionHistory.length - i}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 truncate">
                          {version.message}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          {new Date(version.timestamp).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {version.tree.length} components
                        </div>
                      </div>
                      <button
                        onClick={() => handleRollback(version)}
                        className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white text-xs transition-all whitespace-nowrap"
                      >
                        ↩️ Restore
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Homepage;