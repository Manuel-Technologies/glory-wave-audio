
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Radio,
  Users,
  Wifi,
  WifiOff,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WaveformLogo from './WaveformLogo';

interface ListenerInterfaceProps {
  onBack: () => void;
}

const ListenerInterface: React.FC<ListenerInterfaceProps> = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [streamUrl, setStreamUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [streamInfo, setStreamInfo] = useState({
    title: "Sunday Service",
    listeners: 42,
    quality: "320kbps",
    status: "Live"
  });
  
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!streamUrl.trim()) {
      toast({
        title: "Stream URL Required",
        description: "Please enter a valid stream URL",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    
    // Simulate connection
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      toast({
        title: "Connected",
        description: "Successfully connected to stream",
      });
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsPlaying(false);
    toast({
      title: "Disconnected",
      description: "Disconnected from stream",
    });
  };

  const handlePlayPause = () => {
    if (!isConnected) return;
    
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? "Paused" : "Playing",
      description: isPlaying ? "Stream paused" : "Stream resumed",
    });
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  // Auto-reconnect simulation
  useEffect(() => {
    if (isConnected && Math.random() < 0.02) { // 2% chance per interval
      setIsConnected(false);
      setIsPlaying(false);
      
      setTimeout(() => {
        setIsConnected(true);
        setIsPlaying(true);
        toast({
          title: "Reconnected",
          description: "Auto-reconnected to stream",
        });
      }, 3000);
    }
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-3">
            <WaveformLogo size="small" />
            <h1 className="text-2xl font-bold font-montserrat">Listen Live</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={isConnected ? "default" : "secondary"}
              className={isConnected ? "bg-glory-green text-background" : ""}
            >
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  CONNECTED
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  OFFLINE
                </>
              )}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Connection */}
            {!isConnected && (
              <Card className="bg-surface border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Radio className="h-5 w-5" />
                    Connect to Stream
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stream-url">Stream URL</Label>
                    <Input
                      id="stream-url"
                      placeholder="https://glorywave.app/listen/abc123"
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}
                      className="bg-surface-elevated border-border font-mono"
                    />
                  </div>
                  
                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full bg-glory-indigo hover:bg-glory-indigo/90 text-white"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Radio className="mr-2 h-4 w-4" />
                        Connect
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Player */}
            {isConnected && (
              <Card className="bg-surface border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Radio className="h-5 w-5" />
                      Now Playing
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnect}
                      className="text-glory-red border-glory-red hover:bg-glory-red hover:text-white"
                    >
                      Disconnect
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Stream Info */}
                    <div className="text-center py-8">
                      <h2 className="text-2xl font-bold font-montserrat mb-2">
                        {streamInfo.title}
                      </h2>
                      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {streamInfo.listeners} listeners
                        </div>
                        <div>{streamInfo.quality}</div>
                        <Badge 
                          variant="secondary" 
                          className="bg-glory-green/10 text-glory-green"
                        >
                          {streamInfo.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Waveform Visualization */}
                    <div className="flex justify-center py-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 20 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-1 bg-gradient-to-t from-glory-green to-glory-indigo rounded-full ${
                              isPlaying ? 'audio-meter-pulse' : ''
                            }`}
                            style={{
                              height: `${Math.random() * 40 + 10}px`,
                              animationDelay: `${i * 0.05}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Player Controls */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={handlePlayPause}
                        size="lg"
                        className={`px-8 h-12 ${isPlaying 
                          ? 'bg-glory-amber hover:bg-glory-amber/90' 
                          : 'bg-glory-green hover:bg-glory-green/90'
                        } text-background font-medium`}
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="mr-2 h-5 w-5" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-5 w-5" />
                            Play
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleMute}
                        className={`${isMuted ? 'bg-glory-red/10 border-glory-red text-glory-red' : ''}`}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Volume Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Volume</Label>
                        <span className="text-sm text-muted-foreground">
                          {isMuted ? 'Muted' : `${volume[0]}%`}
                        </span>
                      </div>
                      <Slider
                        value={isMuted ? [0] : volume}
                        onValueChange={(value) => {
                          setVolume(value);
                          if (value[0] > 0) setIsMuted(false);
                        }}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Connection Status */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-lg">Connection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`text-sm font-medium ${
                    isConnected ? 'text-glory-green' : 'text-muted-foreground'
                  }`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                {isConnected && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Buffering:</span>
                      <span className="text-sm font-medium">&lt; 1s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Quality:</span>
                      <span className="text-sm font-medium">{streamInfo.quality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Latency:</span>
                      <span className="text-sm font-medium">~2.5s</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Stream Info */}
            {isConnected && (
              <Card className="bg-surface border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Stream Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Title</div>
                    <div className="font-medium">{streamInfo.title}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Listeners</div>
                    <div className="font-medium">{streamInfo.listeners}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Started</div>
                    <div className="font-medium">2:30 PM</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setVolume([50])}
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Reset Volume
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  disabled={!isConnected}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Force Reconnect
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListenerInterface;
