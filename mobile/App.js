// Paste into Expo Snack with react-native-webview 13.16.1 and
// react-native-safe-area-context added as dependencies. No laptop install required.
// This is a native preview shell around the shared responsive frontend.
import React, { useState } from 'react';
import { Platform, View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const PREVIEW_URL = 'https://sai-dheeraj-237.github.io/gully/';

export default function App() {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        {failed ? (
          <View style={styles.center}>
            <Text style={styles.title}>Your gully is a little quiet.</Text>
            <Text style={styles.body}>We couldn’t load the preview. Check your connection and try again.</Text>
            <Pressable accessibilityRole="button" style={styles.button} onPress={() => { setFailed(false); setAttempt(v => v + 1); }}>
              <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
          </View>
        ) : Platform.OS === 'web' ? (
          React.createElement('iframe', { key: attempt, src: PREVIEW_URL, title: 'Gully frontend preview', allow: 'microphone', style: { flex: 1, width: '100%', height: '100%', border: 0 } })
        ) : (
          <WebView
            key={attempt}
            source={{ uri: PREVIEW_URL }}
            style={styles.root}
            originWhitelist={['https://sai-dheeraj-237.github.io']}
            onShouldStartLoadWithRequest={request => request.url.startsWith(PREVIEW_URL)}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction
            onError={() => setFailed(true)}
            onHttpError={event => { if (event.nativeEvent.statusCode >= 400) setFailed(true); }}
            renderLoading={() => <View style={styles.center}><ActivityIndicator size="large" color="#e96740" /></View>}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f5ef' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 18 },
  title: { fontSize: 24, fontWeight: '700', color: '#292b28', textAlign: 'center' },
  body: { fontSize: 14, lineHeight: 23, color: '#818079', textAlign: 'center' },
  button: { backgroundColor: '#e96740', padding: 15, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
