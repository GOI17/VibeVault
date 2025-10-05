# VibeVault 🎬

A sleek, Netflix-inspired movie discovery and favorites app built with React Native and Expo. Browse movies, create your personal watchlist, and enjoy a cinematic experience on mobile and web.

## 🌟 Features

- **Movie Discovery**: Browse a curated collection of movies with beautiful posters
- **Smart Favorites**: Double-tap any movie to add/remove from your favorites
- **Custom Movie Addition**: Add your own movies with custom details
- **Responsive Design**: Optimized for mobile, tablet, and web platforms
- **Dark Theme**: Netflix-inspired dark UI with red accents
- **Search Functionality**: Find movies by title
- **Grid/List Views**: Switch between grid and list layouts
- **Toast Notifications**: Helpful guidance for user interactions

## 🚀 Live Demo

Check out the live web version: [https://goi17.github.io/VibeVault](https://goi17.github.io/VibeVault)

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) with React Native
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **State Management**: [TanStack Query](https://tanstack.com/query)
- **Styling**: React Native StyleSheet with Themed Components
- **Icons**: [Expo Vector Icons](https://docs.expo.dev/guides/icons/)
- **Forms**: [Formik](https://formik.org/) with validation
- **Notifications**: [React Native Toast Message](https://github.com/calintamas/react-native-toast-message)
- **Async Storage**: For local data persistence

## 📱 Screenshots

*Add screenshots of your app here*

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/goi17/VibeVault.git
   cd VibeVault
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Open the app:
   - **iOS**: Press `i` in the terminal
   - **Android**: Press `a` in the terminal
   - **Web**: Press `w` in the terminal
   - **Expo Go**: Scan the QR code with the Expo Go app

## 📖 Usage

### Adding Movies to Favorites
- Browse movies on the home screen
- Double-tap any movie to add it to your favorites
- The app will show a toast notification guiding you through the process

### Managing Favorites
- Switch to the Favorites tab to view your saved movies
- Double-tap favorites to remove them
- Use the "Add Custom Movie" form to add movies manually

### Custom Movie Addition
- On larger screens: Use the sidebar form
- On mobile: Tap the "+" button to open the modal form
- Fill in movie details and submit

### View Options
- On screens wider than 768px: Toggle between grid and list views
- Responsive design adapts to your device

## 🔧 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint for code quality

## 🚀 Deployment

The app is automatically deployed to GitHub Pages using GitHub Actions.

### Web Deployment
The web version is built and deployed automatically when you push to the main branch.

### Mobile Deployment
- **iOS**: Use `eas build --platform ios`
- **Android**: Use `eas build --platform android`

## 📁 Project Structure

```
VibeVault/
├── app/                    # Main application code
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── (home)/        # Home screen
│   │   ├── favorites/     # Favorites screen
│   │   └── _layout.tsx    # Tab layout
│   ├── search/            # Search functionality
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── DoublePressTouchable.tsx
│   ├── Masonry.tsx       # Movie grid/list component
│   └── Themed*.tsx       # Themed components
├── constants/            # App constants
│   ├── Colors.ts         # Color scheme
│   ├── query.ts          # API queries and mutations
│   └── RQClient.ts       # React Query client
├── hooks/                # Custom hooks
├── assets/               # Images and fonts
└── scripts/              # Utility scripts
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing React Native framework
- [Netflix](https://www.netflix.com/) for design inspiration
- [IMDb](https://www.imdb.com/) for movie data
- All the amazing open-source contributors

## 📞 Support

If you have any questions or issues, please open an issue on GitHub or contact the maintainers.

---

Made with ❤️ and lots of 🎬
# redirect-repo-for-gh-pages
