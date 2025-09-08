
// msalConfig.js
// Basic MSAL configuration for use with @azure/msal-browser and @azure/msal-react
import { PublicClientApplication } from 'https://cdn.jsdelivr.net/npm/@azure/msal-browser@3.18.0/+esm';


// For public repo, use placeholder values. Copy this file to msalConfig.local.js and fill with real values on the server.
const clientId = 'YOUR_CLIENT_ID_HERE';
const tenantId = 'YOUR_TENANT_ID_HERE';

const msalConfig = {
    auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri: window.location.origin,
    },
    cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
    },
};

const msalInstance = new PublicClientApplication(msalConfig);

export { msalConfig, msalInstance };
