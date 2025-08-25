
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Radio, Users, Volume2, Zap, Shield } from "lucide-react";
import WaveformLogo from "@/components/WaveformLogo";
import BroadcasterDashboard from "@/components/BroadcasterDashboard";
import ListenerInterface from "@/components/ListenerInterface";

const Index = () => {
  const [activeMode, setActiveMode] = useState<"home" | "broadcast" | "listen">("home");

  if (activeMode === "broadcast") {
    return <BroadcasterDashboard onBack={() => setActiveMode("home")} />;
  }

  if (activeMode === "listen") {
    return <ListenerInterface onBack={() => setActiveMode("home")} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 glory-gradient-subtle"></div>
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8 flex justify-center">
              <WaveformLogo size="large" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold font-montserrat mb-6 bg-gradient-to-r from-glory-green via-glory-indigo to-glory-amber bg-clip-text text-transparent">
              GloryWave
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Broadcast His Glory, Loud and Clear
            </p>
            
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              High-quality live audio broadcasting platform designed for churches, ministries, and faith communities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                size="lg" 
                className="bg-glory-indigo hover:bg-glory-indigo/90 text-white px-8 py-4 text-lg font-medium"
                onClick={() => setActiveMode("broadcast")}
              >
                <Mic className="mr-2 h-5 w-5" />
                Start Broadcasting
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-glory-green text-glory-green hover:bg-glory-green hover:text-background px-8 py-4 text-lg font-medium"
                onClick={() => setActiveMode("listen")}
              >
                <Radio className="mr-2 h-5 w-5" />
                Join Stream
              </Button>
            </div>

            {/* Status Indicators */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Badge variant="secondary" className="bg-surface-elevated text-glory-green px-4 py-2">
                <div className="w-2 h-2 bg-glory-green rounded-full mr-2 animate-pulse"></div>
                System Online
              </Badge>
              <Badge variant="secondary" className="bg-surface-elevated text-foreground px-4 py-2">
                <Users className="w-4 h-4 mr-1" />
                0 Active Streams
              </Badge>
              <Badge variant="secondary" className="bg-surface-elevated text-foreground px-4 py-2">
                <Volume2 className="w-4 h-4 mr-1" />
                HD Audio Ready
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-montserrat">
          Professional Audio Broadcasting
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-surface hover:bg-surface-elevated transition-colors border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-glory-green/10 rounded-lg flex items-center justify-center mb-4">
                <Volume2 className="h-6 w-6 text-glory-green" />
              </div>
              <CardTitle className="text-xl font-montserrat">Crystal Clear Audio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                High-quality Opus/AAC streaming with built-in 200% volume booster and auto-normalization for perfect sound.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-surface hover:bg-surface-elevated transition-colors border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-glory-indigo/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-glory-indigo" />
              </div>
              <CardTitle className="text-xl font-montserrat">Real-time Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Live audio level meters with color-coded feedback. Green for clean, red for clipping - keep your sound perfect.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-surface hover:bg-surface-elevated transition-colors border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-glory-amber/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-glory-amber" />
              </div>
              <CardTitle className="text-xl font-montserrat">Smart Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Built-in limiter prevents distortion while auto-reconnect ensures your listeners never miss a moment.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-surface hover:bg-surface-elevated transition-colors border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-glory-green/10 rounded-lg flex items-center justify-center mb-4">
                <Radio className="h-6 w-6 text-glory-green" />
              </div>
              <CardTitle className="text-xl font-montserrat">Easy Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Generate shareable stream links instantly. Your congregation can tune in from anywhere with one click.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-surface hover:bg-surface-elevated transition-colors border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-glory-indigo/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-glory-indigo" />
              </div>
              <CardTitle className="text-xl font-montserrat">Scales with You</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Support for up to 200 concurrent listeners with minimal buffering and maximum reliability.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-surface hover:bg-surface-elevated transition-colors border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-glory-amber/10 rounded-lg flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-glory-amber" />
              </div>
              <CardTitle className="text-xl font-montserrat">Church-Friendly</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Designed specifically for ministries with intuitive controls and reliable performance for worship services.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <WaveformLogo size="small" />
              <div>
                <h3 className="font-bold font-montserrat">GloryWave</h3>
                <p className="text-sm text-muted-foreground">Broadcast His Glory, Loud and Clear</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground text-center md:text-right">
              <p>© {new Date().getFullYear()} GloryWave. Built for the Kingdom.</p>
              <p className="text-xs mt-1">Powered by manuel technologies</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
