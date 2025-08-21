# TestRail Case Viewer

A simple web viewer for TestRail test cases, created to allow people without direct access to TestRail to view specific test cases.

## 🚀 Features

- **Complete visualization** of TestRail test cases
- **Responsive interface** and user-friendly
- **Access without login** to TestRail (using generic user API Key)
- **Rich content formatting** (HTML, basic Markdown)
- **Custom fields support**
- **Direct links** to specific cases
- **Print functionality**

## 📋 Prerequisites

1. **TestRail access** with API permissions
2. **Generic user** in TestRail with access to desired projects
3. **API Key** generated for the generic user
4. **GitHub Pages** enabled in repository (optional, for hosting)

## ⚙️ Configuration

### 1. Configure API credentials

Edit the `script.js` file and update the configurations in the `CONFIG` object:

```javascript
const CONFIG = {
    // Your TestRail instance URL
    TESTRAIL_URL: 'https://your-company.testrail.com',
    
    // Generic user credentials
    API_USER: 'generic.user@your-company.com',
    API_KEY: 'YOUR_API_KEY_HERE',
    
    // Priority configurations (adapt according to your configuration)
    PRIORITIES: {
        1: { name: 'Critical', class: 'priority-1' },
        2: { name: 'High', class: 'priority-2' },
        3: { name: 'Medium', class: 'priority-3' },
        4: { name: 'Low', class: 'priority-4' }
    }
};
```

### 2. Get TestRail API Key

1. Login to TestRail with the generic user
2. Go to **Administration** → **Settings** → **API Keys**
3. Click **Add Key**
4. Copy the generated key

### 3. Configure CORS (if necessary)

Depending on your TestRail configuration, it may be necessary to configure CORS to allow browser requests. Contact your TestRail administrator.

## 🔗 How to use

### Direct URL

Access the viewer with the test case ID:

```
https://your-username.github.io/repo-name/?case=373696
```

### Integration with Jira

In Jira, you can create links that point to specific cases:

1. **In issue descriptions**: 
   ```
   Test case: [C373696](https://your-username.github.io/repo-name/?case=373696)
   ```

2. **As custom field**: Configure a URL field in Jira that points to the viewer

3. **In comments**: Paste the direct link to the case

### URL Examples

- Specific case: `?case=373696`
- Case with alternative ID: `?id=373696`

## 📱 Features

### Case Visualization

- **Title and ID** of the case
- **Priority and type** with colors
- **Creation information** and updates
- **Formatted preconditions**
- **Numbered and structured test steps**
- **Expected results**
- **Custom fields** from your TestRail

### Interface

- **Responsive design** works on desktop and mobile
- **Optimized printing** for documentation
- **Loading states** for better UX
- **Error handling** with clear messages
- **Direct link** to original TestRail

## 🔧 Customization

### Custom Fields

Edit the `knownCustomFields` list in `script.js` to include your custom fields:

```javascript
const knownCustomFields = {
    'custom_automation_type': 'Automation Type',
    'custom_test_data': 'Test Data',
    'custom_environment': 'Environment',
    // Add your fields here...
};
```

### Styles

Modify `style.css` to customize:

- Company **colors**
- **Fonts** and sizes
- **Layout** and spacing
- **Priorities** with specific colors

### Priorities

Configure priorities in `CONFIG.PRIORITIES` according to your TestRail configuration.

## 🚀 Deploy

### GitHub Pages

1. Commit the files to the repository
2. Go to **Settings** → **Pages**
3. Select **Deploy from a branch**
4. Choose **main** and **/docs**
5. Click **Save**

Your site will be available at: `https://your-username.github.io/repo-name/`

### Demo

You can view a demo of the TestRail Case Viewer at:
`https://janainarocha.github.io/testrailviewer/`

This demo shows how a test case would be displayed without requiring TestRail API access.

### Other options

- **Netlify**: Connect the GitHub repository
- **Vercel**: Deploy directly from GitHub
- **Own server**: Upload the HTML/CSS/JS files

## 🔒 Security

### ⚠️ IMPORTANT

**DO NOT commit credentials** directly in the code for public repositories!

### Safer options:

1. **Private repository**: Keep the repo private if it contains credentials
2. **Environment variables**: Use GitHub Secrets + GitHub Actions
3. **Backend proxy**: Create an intermediate API that doesn't expose credentials
4. **Netlify Functions**: Use serverless functions for API calls

### Example with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Replace credentials
      run: |
        sed -i "s/YOUR_API_KEY_HERE/${{ secrets.TESTRAIL_API_KEY }}/g" script.js
        sed -i "s/generic.user@your-company.com/${{ secrets.TESTRAIL_USER }}/g" script.js
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

## 🐛 Troubleshooting

### CORS Error

```
Connection error. Please check if TestRail is accessible and CORS is configured.
```

**Solution**: Configure CORS in TestRail or use a backend proxy.

### Error 401 - Unauthorized

```
Authentication error. Please check API credentials.
```

**Solution**: Check if the API Key and email are correct.

### Error 403 - Access denied

```
Access denied. Please check user permissions.
```

**Solution**: Make sure the generic user has permission to view test cases.

### Case not found

```
Test case not found.
```

**Solution**: Check if the ID is correct and if the case exists in TestRail.

## 📄 License

This project is open source. Feel free to modify and distribute as needed.

## 🤝 Contributing

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📞 Support

For questions or issues:

1. Check the **Troubleshooting** section
2. Consult the [TestRail API documentation](http://docs.gurock.com/testrail-api2/start)
3. Open an issue on GitHub

---

**Developed to facilitate access to TestRail test cases** 🧪
