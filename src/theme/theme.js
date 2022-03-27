import { transparentize } from 'polished'

export const VARIANT = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  NEGATIVE: 'negative',
  POSITIVE: 'positive',
  WARNING: 'warning',
  INFO: 'info',
  NTRL_LIGHT: 'ntrl_light',
  NTRL_DARK: 'ntrl_dark',
  NTRL_DARKEST: 'ntrl_darkest',
  WHITE: 'white',
  BLACK: 'black',
  TRANSPARENT: 'transparent',
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
    main: '#EA4D60',
    contrast: 'white',
  },
  positive: {
    main: 'green',
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
    main: '#aaafb8',
    contrast: '#ffffff',
  },
  ntrl_dark: {
    main: '#2c364c',
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
          'line-height': '1.29',
        },
        m: {
          'font-size': '16px',
          'line-height': '1.2',
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
          'line-height': '1.18',
        },
        xxl: {
          'font-size': '30px',
          'line-height': '1.2',
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
    buttonIcon: {
      width: '36px',
      height: '36px',
      border: {
        style: 'solid',
        width: '1px',
        radius: '12px',
      },
      hover: {
        backgroundColor: transparentize(0.8, colors.ntrl_light.main),
        opacity: 1,
      },
      disabledOpacity: 0.5,
    },
    table: {
      border: {
        style: 'solid',
        width: '1px',
        color: transparentize(0.8, colors.ntrl_light.main),
        radius: '3px',
      },
      head: {
        backgroundColor: transparentize(0.8, colors.ntrl_light.main),
      },
      cell: {
        padding: '12px',
        border: {
          style: 'solid',
          width: '1px',
          color: transparentize(0.8, colors.ntrl_light.main),
        },
      },
    },
    badge: {
      font: {
        size: '12px',
        weight: '500',
        color: colors.white.main,
      },
    },
  },
}
