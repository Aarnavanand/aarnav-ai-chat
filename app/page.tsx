"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/sonner';
import { 
  Terminal, 
  Copy, 
  Moon, 
  Sun, 
  History, 
  ChevronDown, 
  ChevronUp, 
  Loader2,
  Info,
  Zap,
  GitBranch,
  Code,
  Send,
  Sparkles
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { gsap } from 'gsap';

interface CommandHistory {
  id: string;
  query: string;
  command: string;
  timestamp: Date;
  type: 'shell' | 'git' | 'python';
}

export default function CommandPal() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // GSAP refs
  const headerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Load history from localStorage
    const savedHistory = localStorage.getItem('commandpal-history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        const historyWithDates = parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(historyWithDates);
      } catch (error) {
        console.error('Error parsing history:', error);
        localStorage.removeItem('commandpal-history');
      }
    }

    // GSAP initial animations
    const tl = gsap.timeline();
    
    // Animate background elements
    gsap.set('.bg-orb', { scale: 0, opacity: 0 });
    gsap.to('.bg-orb', {
      scale: 1,
      opacity: 1,
      duration: 2,
      stagger: 0.3,
      ease: "power2.out"
    });

    // Animate main elements
    tl.fromTo(headerRef.current, 
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
    )
    .fromTo(mainCardRef.current,
      { y: 50, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" },
      "-=0.4"
    )
    .fromTo(sidebarRef.current,
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=0.6"
    )
    .fromTo(footerRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
      "-=0.2"
    );

    // Continuous floating animation for background orbs
    gsap.to('.bg-orb-1', {
      y: -20,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });

    gsap.to('.bg-orb-2', {
      y: 15,
      x: -10,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      delay: 1
    });

    gsap.to('.bg-orb-3', {
      x: 10,
      y: -10,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      delay: 2
    });

  }, []);

  const saveToHistory = (query: string, command: string) => {
    const commandType = detectCommandType(command);
    const newEntry: CommandHistory = {
      id: Date.now().toString(),
      query,
      command,
      timestamp: new Date(),
      type: commandType
    };

    const updatedHistory = [newEntry, ...history.slice(0, 4)];
    setHistory(updatedHistory);
    localStorage.setItem('commandpal-history', JSON.stringify(updatedHistory));
  };

  const detectCommandType = (command: string): 'shell' | 'git' | 'python' => {
    if (command.startsWith('git ')) return 'git';
    if (command.startsWith('python ') || command.startsWith('pip ') || command.includes('python') || command.startsWith('sorted(') || command.startsWith('len(') || command.startsWith('print(')) return 'python';
    return 'shell';
  };

  const generateCommand = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a command description.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult('');
    setExplanation('');

    // Animate loading state
    gsap.to('.generate-btn', {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });

    try {
      const response = await fetch('/api/generate-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.command) {
        throw new Error('No command received from API');
      }

      setResult(data.command);
      saveToHistory(query, data.command);
      
      // Animate result appearance
      setTimeout(() => {
        if (resultCardRef.current) {
          gsap.fromTo(resultCardRef.current,
            { y: 30, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }
          );
        }
      }, 100);
      
      toast({
        title: "✅ Command Generated!",
        description: "Your terminal command is ready to use.",
      });
    } catch (error) {
      console.error('Error generating command:', error);
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to generate command. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const explainCommand = async () => {
    if (!result.trim()) {
      toast({
        title: "Error",
        description: "No command to explain. Generate a command first.",
        variant: "destructive",
      });
      return;
    }

    setExplaining(true);
    setExplanation('');

    try {
      const response = await fetch('/api/explain-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: result.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.explanation) {
        throw new Error('No explanation received from API');
      }

      setExplanation(data.explanation);
      
      toast({
        title: "✅ Command Explained!",
        description: "Check the explanation below the command.",
      });
    } catch (error) {
      console.error('Error explaining command:', error);
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Failed to explain command. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExplaining(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      
      // Animate copy success
      gsap.to('.copy-btn', {
        scale: 1.1,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.out"
      });
      
      toast({
        title: "✅ Copied!",
        description: "Command copied to clipboard.",
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        toast({
          title: "✅ Copied!",
          description: "Command copied to clipboard.",
        });
      } catch (fallbackError) {
        toast({
          title: "❌ Error",
          description: "Failed to copy to clipboard.",
          variant: "destructive",
        });
      }
      document.body.removeChild(textArea);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateCommand();
  };

  const loadFromHistory = (item: CommandHistory) => {
    setQuery(item.query);
    setResult(item.command);
    setExplanation('');
    
    // Animate history item selection
    gsap.to('.history-item', {
      scale: 0.98,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });
    
    toast({
      title: "📋 Loaded from History",
      description: "Command loaded successfully.",
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('commandpal-history');
    
    // Animate clear action
    gsap.to('.history-content', {
      opacity: 0,
      y: -10,
      duration: 0.3,
      onComplete: () => {
        gsap.to('.history-content', {
          opacity: 1,
          y: 0,
          duration: 0.3
        });
      }
    });
    
    toast({
      title: "🗑️ History Cleared",
      description: "All command history has been cleared.",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'git':
        return <GitBranch className="w-3 h-3" />;
      case 'python':
        return <Code className="w-3 h-3" />;
      default:
        return <Terminal className="w-3 h-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'git':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'python':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const handleThemeToggle = () => {
    // Animate theme toggle
    gsap.to('.theme-btn', {
      rotation: 180,
      duration: 0.3,
      ease: "power2.out"
    });
    
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div ref={backgroundRef} className="absolute inset-0 overflow-hidden">
        <div className="bg-orb bg-orb-1 absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="bg-orb bg-orb-2 absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="bg-orb bg-orb-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div ref={headerRef} className="flex items-center justify-between mb-12 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/25">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                CommandPal
              </h1>
              <p className="text-sm text-muted-foreground/80">
                AI-powered terminal command generator by{' '}
                <span className="font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Aarnav Anand
                </span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="theme-btn backdrop-blur-sm bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/5 transition-all duration-300"
              onClick={handleThemeToggle}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
          {/* Main Input Area */}
          <div className="lg:col-span-3">
            <Card ref={mainCardRef} className="border-0 shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 transition-all duration-300 hover:shadow-3xl hover:bg-white/80 dark:hover:bg-slate-900/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-violet-600" />
                  Natural Language Input
                  <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Textarea
                      placeholder="Describe what you want to do... (e.g., 'Create a new Git branch called feature-login')"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="min-h-[120px] text-base bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border-white/30 dark:border-white/10 focus:border-violet-500/50 dark:focus:border-violet-400/50 transition-all duration-300 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          handleSubmit(e);
                        }
                      }}
                      disabled={loading}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/60 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded-md backdrop-blur-sm">
                      Press Ctrl+Enter to submit
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!query.trim() || loading}
                    className="generate-btn w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Generate Command
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Output Area */}
            {result && (
              <Card ref={resultCardRef} className="mt-8 border-0 shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 transition-all duration-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-emerald-600" />
                      Generated Command
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getTypeColor(detectCommandType(result))}>
                        {getTypeIcon(detectCommandType(result))}
                        {detectCommandType(result)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="copy-btn backdrop-blur-sm bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/5 transition-all duration-300"
                        onClick={() => copyToClipboard(result)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="backdrop-blur-sm bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/5 transition-all duration-300"
                        onClick={explainCommand}
                        disabled={explaining}
                      >
                        {explaining ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Info className="w-4 h-4 mr-1" />
                        )}
                        Explain
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-950 dark:bg-black/50 rounded-xl p-6 font-mono text-sm backdrop-blur-sm border border-slate-800 dark:border-slate-700 shadow-inner">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                      </div>
                      <span className="text-slate-400 text-xs font-medium">Terminal</span>
                    </div>
                    <div className="text-emerald-400 text-base break-all">
                      <span className="text-slate-500">$</span> <span className="ml-2">{result}</span>
                    </div>
                  </div>
                  
                  {explanation && (
                    <div className="mt-6 p-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200/50 dark:border-blue-800/30 backdrop-blur-sm">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Command Explanation:
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                        {explanation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <Card ref={sidebarRef} className="border-0 shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 transition-all duration-300 hover:shadow-3xl hover:bg-white/80 dark:hover:bg-slate-900/80">
              <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-white/30 dark:hover:bg-white/5 transition-all duration-300 rounded-t-lg">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-violet-600" />
                        History ({history.length})
                      </div>
                      {historyOpen ? <ChevronUp className="w-4 h-4 transition-transform duration-300" /> : <ChevronDown className="w-4 h-4 transition-transform duration-300" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <ScrollArea className="h-[500px]">
                      <div className="history-content">
                        {history.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No commands yet</p>
                            <p className="text-xs mt-1">Generate your first command!</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-xs text-muted-foreground">Recent Commands</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearHistory}
                                className="text-xs h-6 px-2 text-muted-foreground hover:text-destructive"
                              >
                                Clear All
                              </Button>
                            </div>
                            {history.map((item) => (
                              <div
                                key={item.id}
                                className="history-item p-4 bg-white/40 dark:bg-slate-950/40 rounded-xl border border-white/30 dark:border-white/10 cursor-pointer hover:bg-white/60 dark:hover:bg-slate-950/60 transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:scale-[1.02] transform"
                                onClick={() => loadFromHistory(item)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline" className={`${getTypeColor(item.type)} text-xs`}>
                                    {getTypeIcon(item.type)}
                                    {item.type}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatTimestamp(item.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2 leading-relaxed">
                                  {item.query}
                                </p>
                                <code className="text-xs bg-slate-950 dark:bg-black/50 text-emerald-400 px-3 py-2 rounded-lg font-mono block truncate backdrop-blur-sm border border-slate-800 dark:border-slate-700">
                                  {item.command}
                                </code>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>
        </div>
        
        {/* Footer Watermark */}
        <div ref={footerRef} className="text-center mt-16 pb-8 relative z-10">
          <p className="text-sm text-muted-foreground/60 backdrop-blur-sm bg-white/10 dark:bg-black/10 px-4 py-2 rounded-full inline-block border border-white/20 dark:border-white/10">
            Created with ❤️ by{' '}
            <span className="font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Aarnav Anand
            </span>
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  );
}