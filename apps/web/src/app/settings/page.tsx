"use client"

import { Layout } from "@/components/layout/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Save,
  History,
  Monitor,
  Mouse,
  Keyboard,
  X,
  Plus,
} from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"

// Mock data
const mockHistory = [
  {
    id: 1,
    date: new Date(2024, 0, 15),
    sensitivity: 0.35,
    dpi: 800,
    tags: ["ranked", "main"],
  },
  {
    id: 2,
    date: new Date(2024, 0, 10),
    sensitivity: 0.38,
    dpi: 800,
    tags: ["testing"],
  },
  {
    id: 3,
    date: new Date(2024, 0, 5),
    sensitivity: 0.40,
    dpi: 800,
    tags: ["old"],
  },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Game Settings
    sensitivity: "0.35",
    scopedSensitivity: "1.0",
    dpi: "800",
    
    // Windows Settings
    windowsSensitivity: "6",
    windowsAcceleration: false,
    
    // Hardware
    mouseDevice: "Logitech G Pro X Superlight",
    mousepad: "Artisan Zero",
    keyboardDevice: "Wooting 60HE",
    
    // Display
    screenResolution: "1920x1080",
    aspectRatio: "16:9",
    displayScaling: "100%",
    displayMode: "Fullscreen",
    
    // Additional
    rawInputBuffer: true,
    innerDeadzone: "0.0",
    outerDeadzone: "1.0",
    comment: "",
  })

  const [tags, setTags] = useState<string[]>(["main", "ranked"])
  const [newTag, setNewTag] = useState("")

  const handleSave = () => {
    console.log("Saving settings:", settings)
    // API call would go here
  }

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings Management</h1>
            <p className="text-muted-foreground">
              Configure your gaming setup and track changes over time.
            </p>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>

        {/* Settings Form */}
        <Tabs defaultValue="game" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="game">Game</TabsTrigger>
            <TabsTrigger value="hardware">Hardware</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Game Settings */}
          <TabsContent value="game" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sensitivity Settings</CardTitle>
                <CardDescription>
                  Configure your in-game sensitivity and DPI settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sensitivity">Sensitivity</Label>
                    <Input
                      id="sensitivity"
                      type="number"
                      step="0.01"
                      value={settings.sensitivity}
                      onChange={(e) => setSettings({ ...settings, sensitivity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scopedSensitivity">Scoped Sensitivity</Label>
                    <Input
                      id="scopedSensitivity"
                      type="number"
                      step="0.01"
                      value={settings.scopedSensitivity}
                      onChange={(e) => setSettings({ ...settings, scopedSensitivity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dpi">Mouse DPI</Label>
                    <Input
                      id="dpi"
                      type="number"
                      value={settings.dpi}
                      onChange={(e) => setSettings({ ...settings, dpi: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>eDPI (Effective DPI)</Label>
                    <div className="text-2xl font-bold">
                      {(parseFloat(settings.sensitivity) * parseFloat(settings.dpi)).toFixed(0)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Windows Settings</CardTitle>
                <CardDescription>
                  Your Windows mouse settings affect in-game performance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="windowsSensitivity">Windows Sensitivity (1-11)</Label>
                    <Select
                      value={settings.windowsSensitivity}
                      onValueChange={(value) => setSettings({ ...settings, windowsSensitivity: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(11)].map((_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mouse Acceleration</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.windowsAcceleration}
                        onCheckedChange={(checked) => 
                          setSettings({ ...settings, windowsAcceleration: checked })
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {settings.windowsAcceleration ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Settings</CardTitle>
                <CardDescription>
                  Tags and notes for this configuration.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                    />
                    <Button onClick={handleAddTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Notes</Label>
                  <Textarea
                    id="comment"
                    placeholder="Add any notes about this configuration..."
                    value={settings.comment}
                    onChange={(e) => setSettings({ ...settings, comment: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hardware Settings */}
          <TabsContent value="hardware" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gaming Peripherals</CardTitle>
                <CardDescription>
                  Track your hardware setup for consistent performance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mouseDevice">
                      <Mouse className="inline h-4 w-4 mr-2" />
                      Mouse
                    </Label>
                    <Input
                      id="mouseDevice"
                      value={settings.mouseDevice}
                      onChange={(e) => setSettings({ ...settings, mouseDevice: e.target.value })}
                      placeholder="e.g., Logitech G Pro X Superlight"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mousepad">
                      <Monitor className="inline h-4 w-4 mr-2" />
                      Mousepad
                    </Label>
                    <Input
                      id="mousepad"
                      value={settings.mousepad}
                      onChange={(e) => setSettings({ ...settings, mousepad: e.target.value })}
                      placeholder="e.g., Artisan Zero"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keyboardDevice">
                      <Keyboard className="inline h-4 w-4 mr-2" />
                      Keyboard
                    </Label>
                    <Input
                      id="keyboardDevice"
                      value={settings.keyboardDevice}
                      onChange={(e) => setSettings({ ...settings, keyboardDevice: e.target.value })}
                      placeholder="e.g., Wooting 60HE"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Display Settings */}
          <TabsContent value="display" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Display Configuration</CardTitle>
                <CardDescription>
                  Your display settings can affect input lag and visibility.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Resolution</Label>
                    <Select
                      value={settings.screenResolution}
                      onValueChange={(value) => setSettings({ ...settings, screenResolution: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                        <SelectItem value="2560x1440">2560x1440 (2K)</SelectItem>
                        <SelectItem value="3840x2160">3840x2160 (4K)</SelectItem>
                        <SelectItem value="1280x960">1280x960 (4:3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Display Mode</Label>
                    <Select
                      value={settings.displayMode}
                      onValueChange={(value) => setSettings({ ...settings, displayMode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fullscreen">Fullscreen</SelectItem>
                        <SelectItem value="Windowed">Windowed</SelectItem>
                        <SelectItem value="Borderless">Borderless Window</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Settings History</CardTitle>
                <CardDescription>
                  View and restore previous configurations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockHistory.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                    >
                      <div>
                        <div className="font-medium">
                          {format(record.date, "PPP")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Sens: {record.sensitivity} • DPI: {record.dpi} • eDPI: {record.sensitivity * record.dpi}
                        </div>
                        <div className="flex gap-1 mt-1">
                          {record.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <History className="h-4 w-4 mr-2" />
                          Restore
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}