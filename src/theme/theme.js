export const VARIANT = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  NEGATIVE: 'negative',
  POSITIVE: 'positive',
  WARNING: 'warning',
  INFO: 'info',
  NTRL_LIGHT: 'ntrl_light',
  NTRL_LIGHTER: 'ntrl_lighter',
  NTRL_LIGHTEST: 'ntrl_lightest',
  NTRL_DARK: 'ntrl_dark',
  NTRL_DARKER: 'ntrl_darker',
  NTRL_DARKEST: 'ntrl_darkest',
  WHITE: 'white',
  BLACK: 'black',
  TRANSPARENT: 'transparent',
}

export const DEVICE_SIZE = {
  MOBILE_S: '320px',
  MOBILE_M: '375px',
  MOBILE_L: '425px',
  TABLET: '768px',
  LAPTOP: '1024px',
  LAPTOP_L: '1440px',
  DESKTOP: '2560px',
}

const colors = {
  primary: {
    main: '#5B13F4',
    contrast: '#ffffff',
  },
  secondary: {
    main: '#52cca5',
    contrast: '#ffffff',
  },
  negative: {
    main: '#CD1900',
    contrast: 'white',
  },
  positive: {
    main: '#61C200',
    contrast: 'white',
  },
  warning: {
    main: 'orange',
    contrast: 'white',
  },
  info: {
    main: 'blue',
    contrast: 'white',
  },
  white: {
    main: '#ffffff',
    contrast: '#002426',
  },
  black: {
    main: '#002426',
    contrast: '#ffffff',
  },
  ntrl_light: {
    main: '#cccccc',
    contrast: '#ffffff',
  },
  ntrl_lighter: {
    main: '#f4f4f4',
    contrast: '#ffffff',
  },
  ntrl_lightest: {
    main: '#fafafa',
    contrast: '#ffffff',
  },
  ntrl_dark: {
    main: '#2c364c',
    contrast: '#ffffff',
  },
  ntrl_darker: {
    main: '#c4c4c4',
    contrast: '#ffffff',
  },
  ntrl_darkest: {
    main: '#424242',
    contrast: '#ffffff',
  },
  transparent: {
    main: 'transparent',
    contrast: 'transparent',
  },
}

export const theme = {
  name: 'default',
  space: 1,
  colors,
  font: {
    fontFamily: {
      default: 'Space Grotesk, sans-serif',
    },
  },
  components: {
    card: {
      padding: '12px',
      borderRadius: '12px',
    },
    logo: {
      sizes: {
        m: {
          'font-size': '24px',
        },
        l: {
          'font-size': '32px',
        },
      },
    },
    text: {
      fontSizes: {
        xs: {
          'font-size': '10px',
          'line-height': '1.2',
        },
        s: {
          'font-size': '12px',
          'line-height': '1.33',
        },
        sm: {
          'font-size': '14px',
          'line-height': '20px',
        },
        m: {
          'font-size': '16px',
          'line-height': '28px',
        },
        ml: {
          'font-size': '18px',
          'line-height': '1.25',
        },
        l: {
          'font-size': '20px',
          'line-height': '1.29',
        },
        xl: {
          'font-size': '24px',
          'line-height': '32px',
        },
        xxl: {
          'font-size': '40px',
          'line-height': '52px',
        },
      },
    },
    icon: {
      sizes: {
        s: {
          width: '12px',
          height: '12px',
        },
        m: {
          width: '24px',
          height: '24px',
        },
        l: {
          width: '48px',
          height: '48px',
        },
        xl: {
          width: '66px',
          height: '66px',
        },
        xxl: {
          width: '80px',
          height: '80px',
        },
      },
    },
    input: {
      fontSize: '14px',
      backgroundColor: 'transparent',
      color: colors.ntrl_darkest.main,
      placeholder: {
        fontSize: '14px',
        fontWeight: 500,
        color: colors.ntrl_light.main,
      },
      padding: '12px 18px',
      border: {
        style: 'solid',
        width: '1px',
        color: colors.ntrl_light.main,
        radius: '3px',
        activeColor: colors.secondary.main,
      },
      helpText: {
        fontSize: '12px',
        fontWeight: 300,
        color: colors.ntrl_light.main,
      },
    },
    button: {
      fontSize: '14px',
      height: '45px',
      padding: '0 18px',
      border: {
        style: 'solid',
        width: '1px',
        radius: '3px',
      },
      activeOpacity: 0.7,
      disabledOpacity: 0.5,
    },
    table: {
      border: {
        style: 'solid',
        width: '1px',
        color: 'transparent',
        radius: '3px',
      },
      head: {
        backgroundColor: colors.white.main,
      },
      cell: {
        padding: '26px 20px',
        border: {
          style: 'solid',
          rightWidth: 0,
          bottomWidth: '1px',
          color: colors.ntrl_light.main,
        },
      },
    },
    navItem: {
      sizes: {
        m: {
          padding: '0',
        },
        l: {
          padding: '20px 16px',
        },
      },
    },
  },
}
