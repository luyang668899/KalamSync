import { variables, mixins } from '../../../styles/js';
import { commonThemes } from '../../../styles/js/mixins';

// Styles for App/index.jsx component
export const styles = (theme) => {
  return {
    root: {},
    noProfileError: {
      textAlign: `center`,
      ...mixins({ theme }).center,
      ...mixins({ theme }).absoluteCenter,
    },
  };
};

export const getColorPalette = (appThemeColor = 'primary') => {
  const lightPrimaryColor = '#fff';
  const darkPrimaryColor = '#242424';
  
  // Theme color options
  const secondaryColors = {
    primary: '#007af5',
    secondary: '#9c27b0',
    teal: '#009688',
    purple: '#673ab7',
    orange: '#ff9800',
    green: '#4caf50'
  };

  const lightSecondaryColor = secondaryColors[appThemeColor];
  const darkSecondaryColor = secondaryColors[appThemeColor];

  const snackbarError = `#f33950`;

  return {
    get light() {
      return {
        primary: {
          main: lightPrimaryColor,
          contrastText: '#000',
        },
        secondary: {
          main: lightSecondaryColor,
          contrastText: '#fff',
        },
        background: {
          default: darkPrimaryColor,
          paper: lightPrimaryColor,
        },
        snackbar: {
          error: snackbarError,
        },
        btnTextColor: '#fff',
        fileColor: '#000',
        tableHeaderFooterBgColor: `#fbfbfb`,
        lightText1Color: `rgba(0, 0, 0, 0.50)`,
        fileExplorerThinLineDividerColor: `rgba(0, 0, 0, 0.12)`,
        fileDrop: `${lightSecondaryColor}33`,
        disabledBgColor: `#f3f3f3`,
        nativeSystemColor: `#ececec`,
        contrastPrimaryMainColor: darkPrimaryColor,
      };
    },
    get dark() {
      return {
        primary: {
          main: darkPrimaryColor,
          contrastText: '#fff',
        },
        secondary: {
          main: darkSecondaryColor,
          contrastText: '#fff',
        },
        background: {
          default: darkPrimaryColor,
          paper: darkPrimaryColor,
        },
        text: {
          primary: '#fff',
          secondary: 'rgba(255, 255, 255, 0.65)',
          disabled: 'rgba(255, 255, 255, 0.4)',
        },
        snackbar: {
          error: snackbarError,
        },
        action: {
          active: 'rgba(255, 255, 255, 0.65)',
          hover: 'rgba(255, 255, 255, 0.2)',
          selected: 'rgba(255, 255, 255, 0.16)',
          disabled: 'rgba(255, 255, 255, 0.3)',
          disabledBackground: 'rgba(255, 255, 255, 0.12)',
        },
        divider: `rgba(255, 255, 255, 0.12)`,
        btnTextColor: '#fff',
        fileColor: '#d5d5d5',
        tableHeaderFooterBgColor: `#313131`,
        lightText1Color: `rgba(255, 255, 255, 0.50)`,
        fileExplorerThinLineDividerColor: `rgba(255, 255, 255, .12)`,
        fileDrop: `${darkSecondaryColor}33`,
        disabledBgColor: `rgba(255, 255, 255, 0.15)`,
        nativeSystemColor: `#323232`,
        contrastPrimaryMainColor: lightPrimaryColor,
      };
    },
  };
};

export const getCurrentThemePalette = (appThemeMode, appThemeColor) => {
  return getColorPalette(appThemeColor)[appThemeMode];
};

export const materialUiTheme = ({ ...args }) => {
  const { appThemeMode, appThemeColor = 'primary', appFontSize = 'medium', appLayout = 'default' } = args;

  const palette = getCurrentThemePalette(appThemeMode, appThemeColor);

  // Font size options
  const fontSizeMap = {
    small: 12,
    medium: 14,
    large: 16
  };

  return {
    palette: {
      ...palette,
    },
    typography: {
      useNextVariants: true,
      fontSize: fontSizeMap[appFontSize],
      fontFamily: [
        'Roboto',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
    },

    overrides: {
      MuiCssBaseline: {
        '@global': {
          html: {
            '--app-bg-color': palette.background.paper,
            '--app-secondary-main-color': palette.secondary.main,
            '--app-native-system-color': palette.nativeSystemColor,
            ...commonThemes.noselect,
          },
          // Layout-specific styles
          '.app-layout-compact': {
            '--app-spacing': '4px',
          },
          '.app-layout-expanded': {
            '--app-spacing': '16px',
          },
        },
      },
    },
  };
};
