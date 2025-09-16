import AdminLayout from "@/layouts/admin-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Check, Code, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CodeSnippetProps {
  title: string;
  code: string;
  language?: string;
}

function CodeSnippet({ title, code }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-muted/30 rounded-md border border-border overflow-hidden w-full">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground truncate">{title}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs flex-shrink-0 ml-2"
          onClick={copyToClipboard}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1 text-green-500" />
              <span className="hidden sm:inline">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </Button>
      </div>
      <div className="p-3 overflow-x-auto">
        <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all sm:break-normal sm:whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

interface ParameterItemProps {
  name: string;
  description: string;
}

function ParameterItem({ name, description }: ParameterItemProps) {
  return (
    <div className="p-3 bg-purple-900/5 rounded-md border border-purple-500/20">
      <div className="mb-2">
        <span className="inline-block font-mono text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded font-medium break-all">
          {name}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

interface TabSectionProps {
  title: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ title, active, onClick }: TabSectionProps) {
  return (
    <button
      className={`flex-1 py-3 px-3 text-sm font-medium rounded-md border transition-all duration-200 ${
        active 
          ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-sm' 
          : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'
      }`}
      onClick={onClick}
    >
      {title}
    </button>
  );
}

interface EndpointSectionProps {
  title: string;
  method: string;
  endpoint: string;
  requestCode: string;
  responseCode: string;
  requestParams: ParameterItemProps[];
  responseParams: ParameterItemProps[];
  note?: string;
}

function EndpointSection({ 
  title, 
  method, 
  endpoint, 
  requestCode, 
  responseCode, 
  requestParams, 
  responseParams,
  note 
}: EndpointSectionProps) {
  const [activeTab, setActiveTab] = useState<'request' | 'response'>('request');

  return (
    <Card className="overflow-hidden border border-purple-500/20">
      <CardHeader className="p-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-b border-border">
        <CardTitle className="text-base font-semibold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-start">
          <Webhook className="h-4 w-4 mr-2 text-purple-400 flex-shrink-0 mt-0.5" />
          <span className="break-words">{title}</span>
        </CardTitle>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
          <span className={`px-2 py-1 text-xs font-mono rounded font-bold flex-shrink-0 ${
            method === 'POST' ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'
          }`}>
            {method}
          </span>
          <code className="text-xs bg-muted/60 px-2 py-1 rounded font-mono text-muted-foreground break-all">
            {endpoint}
          </code>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Mobile-friendly tabs */}
        <div className="flex gap-2 p-4 bg-muted/10">
          <TabButton 
            title="Request" 
            active={activeTab === 'request'} 
            onClick={() => setActiveTab('request')} 
          />
          <TabButton 
            title="Response" 
            active={activeTab === 'response'} 
            onClick={() => setActiveTab('response')} 
          />
        </div>

        <div className="p-4">
          {activeTab === 'request' && (
            <div className="space-y-4">
              <CodeSnippet 
                title="Request Example"
                code={requestCode}
              />
              
              <div>
                <h4 className="text-sm font-semibold text-purple-400 mb-3">Parameters</h4>
                <div className="space-y-3">
                  {requestParams.map((param, index) => (
                    <ParameterItem key={index} {...param} />
                  ))}
                </div>
              </div>
              
              {note && (
                <div className="bg-green-900/10 border border-green-500/20 rounded-md p-3">
                  <h5 className="text-xs font-semibold text-green-400 mb-1">Note</h5>
                  <p className="text-xs text-muted-foreground">{note}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'response' && (
            <div className="space-y-4">
              <CodeSnippet 
                title="Response Example"
                code={responseCode}
              />
              
              <div>
                <h4 className="text-sm font-semibold text-purple-400 mb-3">Response Fields</h4>
                <div className="space-y-3">
                  {responseParams.map((param, index) => (
                    <ParameterItem key={index} {...param} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminApi() {
  const [mainTab, setMainTab] = useState<'post' | 'get' | 'updates'>('post');

  const postEndpoint = {
    title: "Key Verification Endpoint",
    method: "POST",
    endpoint: "/api/verify",
    requestCode: `POST /api/verify
Content-Type: application/json

{
  "key": "YOUR_LICENSE_KEY",
  "deviceId": "UNIQUE_DEVICE_ID", 
  "game": "GAME_NAME"
}`,
    responseCode: `{
  "valid": true,
  "expiry": "2025-12-31",
  "deviceLimit": 2,
  "currentDevices": 1,
  "message": "License valid"
}`,
    requestParams: [
      { name: "key", description: "Your license key string" },
      { name: "deviceId", description: "Unique device identifier (HWID or fingerprint)" },
      { name: "game", description: "Game name (PUBG MOBILE, LAST ISLAND, STANDOFF2)" }
    ],
    responseParams: [
      { name: "valid", description: "Boolean - if the license is valid and active" },
      { name: "expiry", description: "License expiration date in ISO format" },
      { name: "deviceLimit", description: "Maximum devices allowed for this key" },
      { name: "currentDevices", description: "Current registered devices for this key" },
      { name: "message", description: "Human-readable status message" }
    ]
  };

  const getEndpoint = {
    title: "GET Key Verification Endpoint",
    method: "GET",
    endpoint: "/api/verify/:key/:game/:deviceId",
    requestCode: `GET /api/verify/YOUR_LICENSE_KEY/GAME_NAME/UNIQUE_DEVICE_ID`,
    responseCode: `{
  "valid": true,
  "expiry": "2025-12-31", 
  "deviceLimit": 2,
  "currentDevices": 1,
  "canRegister": true,
  "message": "License valid"
}`,
    requestParams: [
      { name: "key", description: "Your license key string" },
      { name: "game", description: "Game name (PUBG MOBILE, LAST ISLAND, STANDOFF2)" },
      { name: "deviceId", description: "Unique device identifier (HWID or fingerprint)" }
    ],
    responseParams: [
      { name: "valid", description: "Boolean - if the license is valid and active" },
      { name: "expiry", description: "License expiration date in ISO format" },
      { name: "deviceLimit", description: "Maximum devices allowed for this key" },
      { name: "currentDevices", description: "Current registered devices for this key" },
      { name: "canRegister", description: "Boolean - if new device can be registered (GET only)" },
      { name: "message", description: "Human-readable status message" }
    ],
    note: "GET endpoint only checks validity but doesn't register device. Use POST to register."
  };

  const onlineUpdatesEndpoint = {
    title: "Online Updates API",
    method: "GET",
    endpoint: "/api/updates",
    requestCode: `GET /api/updates`,
    responseCode: `[
  {
    "id": 1,
    "title": "App Update Available",
    "message": "A new version of the app is available with bug fixes and improvements.",
    "buttonText": "Update Now",
    "linkUrl": "https://yourapp.com/download",
    "isActive": true,
    "createdAt": "2025-09-14T06:00:00.000Z",
    "updatedAt": "2025-09-14T06:00:00.000Z"
  }
]`,
    requestParams: [],
    responseParams: [
      { name: "id", description: "Unique identifier for the update" },
      { name: "title", description: "Update title/headline" },
      { name: "message", description: "Update message content" },
      { name: "buttonText", description: "Text for action button (optional)" },
      { name: "linkUrl", description: "URL to open when button is clicked (optional)" },
      { name: "isActive", description: "Boolean - if the update should be shown to users" },
      { name: "createdAt", description: "ISO timestamp when update was created" },
      { name: "updatedAt", description: "ISO timestamp when update was last modified" }
    ],
    note: "This endpoint returns all currently active updates that should be displayed to app users."
  };

  const implementationExamples = {
    post: `// POST - Verifies and Registers Device
async function verifyKey(key, deviceId, game) {
  const response = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, deviceId, game })
  });
  
  const data = await response.json();
  
  if (data.valid) {
    console.log('Valid until:', data.expiry);
    return true;
  } else {
    console.error('Error:', data.message);
    return false;
  }
}`,
    get: `// GET - Only Checks, No Registration
async function checkKey(key, deviceId, game) {
  const url = \`/api/verify/\${key}/\${game}/\${deviceId}\`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.valid) {
    console.log('Valid until:', data.expiry);
    console.log('Can register:', data.canRegister);
    return data;
  } else {
    console.error('Check failed:', data.message);
    return { isValid: false };
  }
}`,
    updates: `// Fetch Online Updates
async function getOnlineUpdates() {
  const response = await fetch('/api/updates');
  const updates = await response.json();
  
  updates.forEach(update => {
    if (update.isActive) {
      console.log('Update:', update.title);
      console.log('Message:', update.message);
      
      if (update.buttonText && update.linkUrl) {
        console.log('Action:', update.buttonText, '→', update.linkUrl);
        // You can create UI elements with the button and link
      }
    }
  });
  
  return updates;
}`
  };

  return (
    <AdminLayout>
      <div className="min-h-screen w-full">
        <div className="space-y-4 mb-6">
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
            API Documentation
          </h2>
          <p className="text-sm text-muted-foreground">
            Integration guide for verifying license keys
          </p>
        </div>

        {/* Main method selector - Full width on mobile */}
        <div className="mb-6">
          <div className="flex gap-2">
            <TabButton 
              title="POST Method" 
              active={mainTab === 'post'} 
              onClick={() => setMainTab('post')} 
            />
            <TabButton 
              title="GET Method" 
              active={mainTab === 'get'} 
              onClick={() => setMainTab('get')} 
            />
            <TabButton 
              title="Online Updates" 
              active={mainTab === 'updates'} 
              onClick={() => setMainTab('updates')} 
            />
          </div>
        </div>

        <div className="space-y-4">
          {mainTab === 'post' && (
            <>
              <EndpointSection {...postEndpoint} />
              
              <Card className="border border-purple-500/20">
                <CardHeader className="p-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-b border-border">
                  <CardTitle className="text-base font-semibold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center">
                    <Code className="h-4 w-4 mr-2 text-purple-400 flex-shrink-0" />
                    Implementation Example
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <CodeSnippet 
                    title="JavaScript Implementation"
                    code={implementationExamples.post}
                  />
                </CardContent>
              </Card>
            </>
          )}

          {mainTab === 'get' && (
            <>
              <EndpointSection {...getEndpoint} />
              
              <Card className="border border-purple-500/20">
                <CardHeader className="p-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-b border-border">
                  <CardTitle className="text-base font-semibold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center">
                    <Code className="h-4 w-4 mr-2 text-purple-400 flex-shrink-0" />
                    Implementation Example
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <CodeSnippet 
                    title="JavaScript Implementation"
                    code={implementationExamples.get}
                  />
                </CardContent>
              </Card>
            </>
          )}

          {mainTab === 'updates' && (
            <>
              <EndpointSection {...onlineUpdatesEndpoint} />
              
              <Card className="border border-purple-500/20">
                <CardHeader className="p-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-b border-border">
                  <CardTitle className="text-base font-semibold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center">
                    <Code className="h-4 w-4 mr-2 text-purple-400 flex-shrink-0" />
                    Implementation Example
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <CodeSnippet 
                    title="JavaScript Implementation"
                    code={implementationExamples.updates}
                  />
                </CardContent>
              </Card>
            </>
          )}

          {/* Important note - Mobile optimized */}
          <div className="bg-amber-900/10 border border-amber-500/20 rounded-md p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-amber-900/20 p-1 mt-0.5 flex-shrink-0">
                <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-amber-400 mb-1">Important Note</h4>
                <p className="text-xs text-muted-foreground">
                  Replace <code className="bg-amber-900/20 px-1 py-0.5 rounded text-amber-400 text-xs break-all">yourdomain.com</code> with your actual API endpoint. Make sure to implement proper error handling and retry logic in production apps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}