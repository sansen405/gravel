// Create a shared dark theme style object that can be imported in other screens
export const darkTheme = {
  colors: {
    background: '#121212',
    surface: '#1e1e1e',
    surfaceHighlight: '#2a2a2a',
    primary: '#ffffff',
    secondary: '#a0a0a0',
    border: '#333333',
    card: '#1e1e1e',
  },
  text: {
    primary: {
      fontFamily: 'Inter-Regular',
      color: '#ffffff',
    },
    secondary: {
      fontFamily: 'Inter-Regular',
      color: '#a0a0a0',
    },
    title: {
      fontFamily: 'Inter-Bold',
      color: '#ffffff',
    },
    subtitle: {
      fontFamily: 'Inter-Regular',
      color: '#a0a0a0',
    },
  },
  components: {
    card: {
      backgroundColor: '#1e1e1e',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    button: {
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 15,
    },
    buttonText: {
      color: '#121212',
      fontFamily: 'Inter-Medium',
      fontSize: 16,
    },
    input: {
      backgroundColor: '#2a2a2a',
      borderRadius: 8,
      padding: 15,
      color: '#ffffff',
      fontFamily: 'Inter-Regular',
    },
  },
}; 