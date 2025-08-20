# GitHub Setup Guide

This guide will walk you through setting up the TestRail Case Viewer on GitHub Pages.

## 📋 Step 1: Create Repository

1. **Go to GitHub** and sign in to your account
2. **Click "New Repository"** (green button on the left)
3. **Repository name**: `testrail-viewer` (or any name you prefer)
4. **Description**: `TestRail Case Viewer for Jira Integration`
5. **Visibility**: 
   - ✅ **Private** (recommended if you'll add API credentials)
   - ❌ Public (only if you won't commit real credentials)
6. ✅ **Add a README file**
7. **Click "Create repository"**

## 📁 Step 2: Upload Files

### Option A: Web Interface (Easier)

1. **In your new repository**, click "uploading an existing file"
2. **Drag and drop** or select these files:
   - `index.html`
   - `script.js`
   - `style.css` 
   - `demo.html`
   - `README.md`
   - `.gitignore`
3. **Commit message**: `Add TestRail Case Viewer files`
4. **Click "Commit changes"**

### Option B: Git Commands (Advanced)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/testrail-viewer.git
cd testrail-viewer

# Copy your files to this folder
# Then commit and push
git add .
git commit -m "Add TestRail Case Viewer files"
git push origin main
```

## ⚙️ Step 3: Configure API Credentials

### Option A: Direct Edit (Private Repos Only)

1. **Click on `script.js`** in your repository
2. **Click the pencil icon** (edit)
3. **Find these lines** around line 4-8:
   ```javascript
   TESTRAIL_URL: 'https://fugroroadware.testrail.com',
   API_USER: 'test.user@fugroroadware.com',
   API_KEY: 'YOUR_API_KEY_HERE',
   ```
4. **Replace with your values**:
   ```javascript
   TESTRAIL_URL: 'https://your-company.testrail.com',
   API_USER: 'your.generic.user@your-company.com',
   API_KEY: 'your_actual_api_key_here',
   ```
5. **Scroll down** and click "Commit changes"

### Option B: GitHub Secrets (Public Repos - Safer)

1. **Go to repository Settings** → **Secrets and variables** → **Actions**
2. **Click "New repository secret"**
3. **Add these secrets**:
   - Name: `TESTRAIL_URL`, Value: `https://your-company.testrail.com`
   - Name: `TESTRAIL_USER`, Value: `your.generic.user@your-company.com`
   - Name: `TESTRAIL_API_KEY`, Value: `your_actual_api_key`

4. **Create `.github/workflows/deploy.yml`**:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
       - uses: actions/checkout@v3
       - name: Replace credentials
         run: |
           sed -i "s|https://fugroroadware.testrail.com|${{ secrets.TESTRAIL_URL }}|g" script.js
           sed -i "s/test.user@fugroroadware.com/${{ secrets.TESTRAIL_USER }}/g" script.js
           sed -i "s/YOUR_API_KEY_HERE/${{ secrets.TESTRAIL_API_KEY }}/g" script.js
       - name: Deploy to GitHub Pages
         uses: peaceiris/actions-gh-pages@v3
         with:
           github_token: ${{ secrets.GITHUB_TOKEN }}
           publish_dir: ./
   ```

## 🌐 Step 4: Enable GitHub Pages

1. **Go to repository Settings**
2. **Scroll down to "Pages"** section
3. **Source**: Select "Deploy from a branch"
4. **Branch**: Select "main" (or "gh-pages" if using GitHub Actions)
5. **Folder**: Select "/ (root)"
6. **Click "Save"**

### If using GitHub Actions (Option B):
- **Source**: Select "GitHub Actions"
- The workflow will automatically deploy

## 🔗 Step 5: Get Your URL

After a few minutes, your site will be available at:
```
https://YOUR_USERNAME.github.io/testrail-viewer/
```

### Test URLs:
- **Demo**: `https://YOUR_USERNAME.github.io/testrail-viewer/demo.html`
- **Real case**: `https://YOUR_USERNAME.github.io/testrail-viewer/?case=373696`

## 🎯 Step 6: Get TestRail API Key

1. **Login to TestRail** with your generic user account
2. **Go to**: User Profile → **My Settings** → **API Keys**
3. **Click "Generate API Key"**
4. **Copy the key** and paste it in your configuration

## ✅ Step 7: Test Everything

1. **Open the demo**: `https://YOUR_USERNAME.github.io/testrail-viewer/demo.html`
   - Should work immediately
   
2. **Test with real case**: `https://YOUR_USERNAME.github.io/testrail-viewer/?case=YOUR_CASE_ID`
   - Replace `YOUR_CASE_ID` with an actual case ID from your TestRail

## 🔧 Step 8: Use in Jira

Now you can create links in Jira like:

### In Issue Descriptions:
```markdown
Test Case: [C373696](https://YOUR_USERNAME.github.io/testrail-viewer/?case=373696)
```

### In Comments:
```
See test case: https://YOUR_USERNAME.github.io/testrail-viewer/?case=373696
```

### As Custom URL Field:
Create a custom field in Jira with the pattern:
```
https://YOUR_USERNAME.github.io/testrail-viewer/?case={case_id}
```

## 🚨 Troubleshooting

### Site shows 404
- **Wait 5-10 minutes** after enabling Pages
- **Check the Pages section** in Settings for build status

### "Authentication error" 
- **Check API credentials** in script.js
- **Verify the generic user** has TestRail access
- **Confirm API Key** is correct and active

### "Connection error"
- **CORS issue**: Contact TestRail admin to enable CORS
- **Network**: Check if TestRail URL is accessible from internet

### Case not loading
- **Verify case ID** exists in TestRail
- **Check user permissions** for the case
- **Look at browser console** for error details (F12)

## 🔒 Security Best Practices

1. ✅ **Use private repository** if containing real credentials
2. ✅ **Use GitHub Secrets** for public repositories
3. ✅ **Create dedicated generic user** with minimal permissions
4. ✅ **Regularly rotate API keys**
5. ❌ **Never commit real credentials** to public repos

## 🎉 You're Done!

Your TestRail Case Viewer is now live and ready to use in Jira! 

**Your viewer URL**: `https://YOUR_USERNAME.github.io/testrail-viewer/`

### Example Usage in Jira:
```
Test case for this issue: [C373696](https://YOUR_USERNAME.github.io/testrail-viewer/?case=373696)
```

Anyone clicking this link will see the formatted test case without needing TestRail access! 🚀
