# Advanced Security Setup - GitHub Secrets + Actions

## 🎯 When to use this:

- You want a **public repository** (open source)
- You want **maximum security**
- You don't mind a slightly more complex setup

## 🔧 Setup Steps:

### 1. Create Public Repository
1. Go to GitHub → New Repository
2. **Repository name**: `testrail-viewer`
3. **Select "Public"** 🌍
4. Add README file
5. Create repository

### 2. Upload Files (Without Real Credentials)
Upload all files with **placeholder credentials** in `script.js`:

```javascript
const CONFIG = {
    TESTRAIL_URL: 'https://fugroroadware.testrail.com',
    API_USER: 'PLACEHOLDER_USER',      // ⚠️ Will be replaced
    API_KEY: 'PLACEHOLDER_KEY',        // ⚠️ Will be replaced
    // ... rest of config
};
```

### 3. Create GitHub Secrets
1. **Go to repository Settings**
2. **Secrets and variables** → **Actions**
3. **Click "New repository secret"**
4. **Add these 3 secrets**:

| Secret Name | Secret Value |
|-------------|--------------|
| `TESTRAIL_URL` | `https://fugroroadware.testrail.com` |
| `TESTRAIL_USER` | `your.generic.user@fugroroadware.com` |
| `TESTRAIL_API_KEY` | `your_real_api_key_here` |

### 4. Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
    
    - name: Replace credentials in script.js
      run: |
        sed -i "s|https://fugroroadware.testrail.com|${{ secrets.TESTRAIL_URL }}|g" script.js
        sed -i "s/PLACEHOLDER_USER/${{ secrets.TESTRAIL_USER }}/g" script.js
        sed -i "s/PLACEHOLDER_KEY/${{ secrets.TESTRAIL_API_KEY }}/g" script.js
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

### 5. Enable GitHub Pages
1. **Repository Settings** → **Pages**
2. **Source**: Select "GitHub Actions"
3. **Save**

### 6. Trigger Deployment
1. **Make any small change** to a file (like README.md)
2. **Commit and push** to main branch
3. **GitHub Actions will run** and deploy with real credentials

## 🌐 Result:

- ✅ **Repository is public** → Anyone can see source code
- ✅ **Credentials are hidden** → Only placeholders in source
- ✅ **Site has real credentials** → GitHub Actions replaced them
- ✅ **Automatic deployments** → Every push updates the site

## 🔍 How It Works:

1. **You push code** with placeholder credentials
2. **GitHub Actions runs** when you push to main
3. **Actions replaces placeholders** with real secrets
4. **Actions deploys** the modified code to GitHub Pages
5. **Users access site** with real credentials (but can't see them)

## 🎯 Example:

**In your repository (public)**:
```javascript
API_KEY: 'PLACEHOLDER_KEY',  // ← Anyone can see this
```

**On your live site (after Actions)**:
```javascript
API_KEY: 'your_real_key_123',  // ← This works, but hidden in source
```

## 🔐 Security Benefits:

1. ✅ **Repository can be public** (open source)
2. ✅ **Real credentials never committed** to git history
3. ✅ **Automatic deployment** with credential injection
4. ✅ **Maximum transparency** - people can see your code
5. ✅ **Easy to share and contribute** - it's open source

## ⚠️ Complexity:

- Requires understanding of GitHub Actions
- More moving parts to troubleshoot
- Need to manage secrets in GitHub interface

---

## 🎯 My Recommendation:

For your use case, **go with the Private Repository approach** (SECURITY_SETUP.md). It's:
- ✅ **Simpler to set up**
- ✅ **Easier to maintain**
- ✅ **Secure enough** for internal company use
- ✅ **No GitHub Actions complexity**

Use this advanced setup only if you want to open-source your solution! 🚀
