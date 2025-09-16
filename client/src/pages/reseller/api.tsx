import ResellerLayout from "@/layouts/reseller-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Webhook, Shield, CreditCard } from "lucide-react";

export default function ResellerApi() {
  return (
    <ResellerLayout>
      <h2 className="text-2xl font-semibold mb-6">API Reference</h2>
      
      <Card className="overflow-hidden mb-6">
        <CardHeader className="px-6 py-4 border-b border-gray-200">
          <CardTitle className="text-base font-medium">Key Verification Endpoint</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <h4 className="text-lg font-medium mb-2">Request</h4>
          <div className="bg-muted/40 p-4 rounded-md mb-4">
            <pre className="font-mono text-sm overflow-x-auto">
{`POST /api/verify
Content-Type: application/json

{
  "key": "YOUR_LICENSE_KEY",
  "deviceId": "UNIQUE_DEVICE_IDENTIFIER",
  "game": "GAME_NAME"
}`}
            </pre>
          </div>
          
          <h4 className="text-lg font-medium mb-2">Response</h4>
          <div className="bg-muted/40 p-4 rounded-md">
            <pre className="font-mono text-sm overflow-x-auto">
{`{
  "valid": true,
  "expiry": "2023-12-31",
  "deviceLimit": 2,
  "currentDevices": 1,
  "message": "License valid"
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-gray-200">
          <CardTitle className="text-base font-medium">Integration Guide</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ol className="list-decimal pl-5 space-y-4">
            <li className="text-sm text-gray-800">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-primary mr-2 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium block mb-1">Generate a Unique Device ID</span>
                  <p>Create a unique identifier for each device that won't change between app updates.
                  This can be a combination of hardware IDs, device name, or other persistent identifiers.</p>
                </div>
              </div>
            </li>
            <li className="text-sm text-gray-800">
              <div className="flex items-start">
                <CreditCard className="h-5 w-5 text-primary mr-2 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium block mb-1">Store the License Key</span>
                  <p>Securely store the license key in your application after validation.
                  Consider encrypting the key or using a secure storage mechanism appropriate for the platform.</p>
                </div>
              </div>
            </li>
            <li className="text-sm text-gray-800">
              <div className="flex items-start">
                <Webhook className="h-5 w-5 text-primary mr-2 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium block mb-1">Implement Verification</span>
                  <p>Add verification on app startup to ensure the license is still valid.
                  Handle offline scenarios gracefully by allowing a certain time window between verifications.</p>
                </div>
              </div>
            </li>
            <li className="text-sm text-gray-800">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary mr-2 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium block mb-1">Handle Errors</span>
                  <p>Implement appropriate user messaging for invalid or expired licenses.
                  Provide clear instructions for users to renew or troubleshoot their license issues.</p>
                </div>
              </div>
            </li>
          </ol>
          
          <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-muted">
            <h5 className="font-medium mb-2">Sample Implementation</h5>
            <pre className="font-mono text-sm overflow-x-auto">
{`// Example JavaScript Implementation
async function verifyLicense(licenseKey, deviceId, game) {
  try {
    const response = await fetch('https://yourdomain.com/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: licenseKey,
        deviceId: deviceId,
        game: game
      }),
    });
    
    const data = await response.json();
    
    if (data.valid) {
      // License is valid, proceed with application
      console.log('License valid until:', data.expiry);
      return true;
    } else {
      // License invalid
      console.error('License error:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </ResellerLayout>
  );
}
