
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Volume2, 
  Users, 
  Link2, 
  Copy, 
  Radio,
  Settings,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WaveformLogo from './WaveformLogo';
import AudioLevelMeter from './AudioLevelMeter';
import { useAudioStream } from '@/hooks/useAudioStream';

interface BroadcasterDashboardProps {
  onBack: () => void;
}

const BroadcasterDashboard: React.FC<BroadcasterDashboardProps> = ({ onBack }) => {
  const [streamTitle, setStreamTitle] = useState("Sunday Service");
  const [listenerCount] = useState(0);
  const [streamUrl] = useState("https://glorywave.app/listen/abc123");
  const [volume, setVolumeSlider] = useState([100]);
  const [gain, setGainSlider] = useState([150]);
  
  const { toast } = useToast();

  // Use real audio stream hook
  const [audioState, audioControls] = useAudioStream();

  const handleStartStream = async () => {
    if (audioState.isStreaming) {
      audioControls.stopStream();
      toast({
        title: "Stream Stopped",
        description: "Your broadcast has ended.",
      });
    } else {
      try {
        await audioControls.startStream();
        toast({
          title: "Stream Started",
          description: "You're now live! Share your link.",
        });
      } catch (error) {
        toast({
          title: "Stream Failed",
          description: audioState.error || "Failed to start stream",
          variant: "destructive",
        });
      }
    }
  };

  const copyStreamLink = () => {
    navigator.clipboard.writeText(streamUrl);
    toast({
      title: "Link Copied",
      description: "Stream link copied to clipboard",
    });
  };

  const getAudioStatus = () => {
    if (!audioState.isStreaming) return { text: "Offline", color: "text-muted-foreground" };
    if (audioState.error) return { text: "Error", color: "text-glory-red" };
    if (audioState.isClipping) return { text: "Clipping", color: "text-glory-red" };
    if (audioState.audioLevel > 70) return { text: "Hot", color: "text-glory-amber" };
    if (audioState.audioLevel > 30) return { text: "Good", color: "text-glory-green" };
    return { text: "Low", color: "text-muted-foreground" };
  };

  // Handle volume changes
  const handleVolumeChange = (value: number[]) => {
    setVolumeSlider(value);
    audioControls.setVolume(value[0]);
  };

  // Handle gain changes
  const handleGainChange = (value: number[]) => {
    setGainSlider(value);
    audioControls.setGain(value[0]);
  };

  const audioStatus = getAudioStatus();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
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
            <h1 className="text-2xl font-bold font-montserrat">Broadcaster Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={audioState.isStreaming ? "default" : "secondary"}
              className={audioState.isStreaming ? "bg-glory-green text-background" : ""}
            >
              {audioState.isStreaming ? (
                <>
                  <Radio className="w-3 h-3 mr-1" />
                  LIVE
                </>
              ) : (
                "OFFLINE"
              )}
            </Badge>
            
            {audioState.isConnected && (
              <Badge variant="secondary" className="bg-glory-indigo/10 text-glory-indigo">
                <Wifi className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
            
            {audioState.error && (
              <Badge variant="destructive">
                <WifiOff className="w-3 h-3 mr-1" />
                Error
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stream Control */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Stream Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="stream-title">Stream Title</Label>
                  <Input
                    id="stream-title"
                    value={streamTitle}
                    onChange={(e) => setStreamTitle(e.target.value)}
                    className="bg-surface-elevated border-border"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      size="lg"
                      onClick={handleStartStream}
                      disabled={!!audioState.error}
                      className={`px-8 ${audioState.isStreaming 
                        ? 'bg-glory-red hover:bg-glory-red/90' 
                        : 'bg-glory-indigo hover:bg-glory-indigo/90'
                      } text-white font-medium`}
                    >
                      {audioState.isStreaming ? (
                        <>
                          <MicOff className="mr-2 h-5 w-5" />
                          Stop Stream
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-5 w-5" />
                          Start Stream
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={audioControls.toggleMute}
                      disabled={!audioState.isStreaming}
                      className={`${audioState.isMuted ? 'bg-glory-red/10 border-glory-red text-glory-red' : ''}`}
                    >
                      {audioState.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-medium">{listenerCount}</span>
                    <span className="text-sm text-muted-foreground">listeners</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Controls */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Audio Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Volume: {volume[0]}%</Label>
                    <Slider
                      value={volume}
                      onValueChange={handleVolumeChange}
                      max={200}
                      step={1}
                      className="w-full"
                      disabled={!audioState.isStreaming}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gain Boost: {gain[0]}%</Label>
                    <Slider
                      value={gain}
                      onValueChange={handleGainChange}
                      max={200}
                      step={1}
                      className="w-full"
                      disabled={!audioState.isStreaming}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="limiter" 
                      checked={true}
                      onCheckedChange={audioControls.enableLimiter}
                    />
                    <Label htmlFor="limiter">Auto Limiter</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="normalizer" 
                      checked={true}
                      onCheckedChange={audioControls.enableNormalizer}
                    />
                    <Label htmlFor="normalizer">Voice Normalizer</Label>
                  </div>
                </div>

                {audioState.error && (
                  <div className="p-3 bg-glory-red/10 border border-glory-red/20 rounded-lg">
                    <p className="text-sm text-glory-red font-medium">
                      {audioState.error}
                    </p>
                    <p className="text-xs text-glory-red/80 mt-1">
                      Please check your microphone permissions and try again.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stream Link */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Share Your Stream
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={streamUrl}
                    readOnly
                    className="bg-surface-elevated border-border font-mono text-sm"
                  />
                  <Button 
                    onClick={copyStreamLink}
                    variant="outline"
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Share this link with your congregation to let them tune in.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Audio Monitoring */}
          <div className="space-y-6">
            {/* Audio Level Meter */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-lg">Audio Monitor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AudioLevelMeter level={audioState.audioLevel} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <div className="flex items-center gap-2">
                      {audioState.isClipping ? (
                        <AlertTriangle className="h-4 w-4 text-glory-red" />
                      ) : audioState.isStreaming ? (
                        <CheckCircle className="h-4 w-4 text-glory-green" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={`font-medium ${audioStatus.color}`}>
                        {audioStatus.text}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <div>Level: {Math.round(audioState.audioLevel)}%</div>
                    <div>Peak: {Math.round(Math.max(audioState.audioLevel, 0))}%</div>
                  </div>

                  {audioState.isStreaming && !audioState.isConnected && (
                    <div className="p-2 bg-glory-amber/10 border border-glory-amber/20 rounded text-xs text-glory-amber">
                      Connecting to streaming server...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-lg">Stream Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Quality:</span>
                  <span className="text-sm font-medium">320kbps AAC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Latency:</span>
                  <span className="text-sm font-medium">~2s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Uptime:</span>
                  <span className="text-sm font-medium">
                    {audioState.isStreaming ? "0:00" : "--:--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Peak Listeners:</span>
                  <span className="text-sm font-medium">{listenerCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Quick Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-reconnect</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recording</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Chat enabled</span>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroadcasterDashboard;
