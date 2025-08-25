# 🚀 TestRail Case Viewer

A simple, responsive web viewer for TestRail test cases. Perfect for sharing specific test cases with stakeholders who don't have direct TestRail access.

## ✨ Features

- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Clean Interface** - Bootstrap-based UI with TestRail styling
- 🖼️ **Image Support** - Properly displays TestRail attachments
- 🔗 **Direct Links** - Share cases via URL: `?case=123456`
- ⚡ **Fast Loading** - Optimized for quick case display

## 🌐 Live Demo

**Production:** `https://main.amplifyapp.com/?case=373696`

## 📁 Project Structure

```
testrailviewer/
├── src/                    # 🎯 Main application files
│   ├── index.html         # Main viewer interface  
│   ├── script.js          # JavaScript functionality
│   └── style.css          # Styling and responsive design
├── local-dev/             # 💻 Local development files
│   ├── backend.js         # Local Express server
│   ├── package.json       # Node.js dependencies
│   └── .env              # Local environment variables
├── docs-backup/           # 📄 Demo and documentation
└── amplify.yml           # ⚙️ AWS Amplify configuration
```

## 🚀 Deploy with AWS Amplify

### Quick Deploy:
1. **Fork this repository**
2. **Connect to Amplify:** https://console.aws.amazon.com/amplify/
3. **Select GitHub** as source
4. **Choose your fork** of this repository
5. **Deploy automatically!**

### Configuration:
Add these environment variables in Amplify Console:
```
TESTRAIL_URL=https://your-company.testrail.com
TESTRAIL_API_USER=your.user@company.com
TESTRAIL_API_KEY=your-api-key
```

## 💻 Local Development

For local development with TestRail API:

```bash
cd local-dev/
npm install
npm start
# Visit: http://localhost:3000/?case=123456
```

## 🎯 Usage

### Direct Case Access:
```
https://your-amplify-url.com/?case=373696
```

### Supported Parameters:
- `case=ID` - TestRail case ID to display

## 📱 Responsive Design

- **Desktop:** Full layout with sidebar navigation
- **Tablet:** Collapsed navigation, optimized spacing  
- **Mobile:** Stack layout, touch-friendly interface

## 🔧 Technical Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Styling:** Bootstrap 5.1.3
- **Hosting:** AWS Amplify
- **API:** TestRail REST API v2

## 📋 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+  
- ✅ Safari 14+
- ✅ Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues or questions:
- 📧 Open an issue in this repository
- 📖 Check the documentation in `/docs-backup/`

---

**Made with ❤️ for better TestRail case sharing**
