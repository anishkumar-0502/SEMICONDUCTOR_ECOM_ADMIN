/**
=========================================================
* Soft UI Dashboard PRO React - v4.0.3
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-pro-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/**
 * The base colors for the Soft UI Dashboard PRO React.
 * You can add new colors using this file.
 * You can customize the colors for the entire dashboard using this file.
 */

const colors = {
  background: {
    default: "#f8f9fa",
  },

  text: {
    main: "#67748e",
    focus: "#67748e",
  },

  transparent: {
    main: "transparent",
  },

  white: {
    main: "#ffffff",
    focus: "#ffffff",
  },

  black: {
    light: "#141414",
    main: "#000000",
    focus: "#000000",
  },

  primary: {
    main: "#cb0c9f",
    focus: "#ad0a87",
  },

  secondary: {
    main: "#8392ab",
    focus: "#96a2b8",
  },

  // Custom theme color
  info: {
    main: "#22c55e",   // solid green - you can change this to your preferred color
    focus: "#16a34a",  // darker hover state - adjust this to be darker than your main color
  },

  success: {
    main: "#82d616",
    focus: "#95dc39",
  },

  warning: {
    main: "#fbcf33",
    focus: "#fcd652",
  },

  error: {
    main: "#ea0606",
    focus: "#c70505",
  },

  light: {
    main: "#e9ecef",
    focus: "#e9ecef",
  },

  dark: {
    main: "#344767",
    focus: "#344767",
  },

  grey: {
    100: "#f8f9fa",
    200: "#e9ecef",
    300: "#dee2e6",
    400: "#ced4da",
    500: "#adb5bd",
    600: "#6c757d",
    700: "#495057",
    800: "#343a40",
    900: "#212529",
  },

  // ✅ Gradients (fixed duplicates, added green properly)
  gradients: {
    primary: {
      main: "#7928ca",
      state: "#ff0080",
    },

    secondary: {
      main: "#627594",
      state: "#a8b8d8",
    },

    info: {
      main: "#22c55e", // gradient green start
      state: "#16a34a", // gradient green end
    },

    success: {
      main: "#17ad37",
      state: "#98ec2d",
    },

    warning: {
      main: "#f53939",
      state: "#fbcf33",
    },

    error: {
      main: "#ea0606",
      state: "#ff667c",
    },

    light: {
      main: "#ced4da",
      state: "#ebeff4",
    },

    dark: {
      main: "#141727",
      state: "#3a416f",
    },
  },

  socialMediaColors: {
    facebook: { main: "#3b5998", dark: "#344e86" },
    twitter: { main: "#55acee", dark: "#3ea1ec" },
    instagram: { main: "#125688", dark: "#0e456d" },
    linkedin: { main: "#0077b5", dark: "#00669c" },
    pinterest: { main: "#cc2127", dark: "#b21d22" },
    youtube: { main: "#e52d27", dark: "#d41f1a" },
    vimeo: { main: "#1ab7ea", dark: "#13a3d2" },
    slack: { main: "#3aaf85", dark: "#329874" },
    dribbble: { main: "#ea4c89", dark: "#e73177" },
    github: { main: "#24292e", dark: "#171a1d" },
    reddit: { main: "#ff4500", dark: "#e03d00" },
    tumblr: { main: "#35465c", dark: "#2a3749" },
  },

  // ✅ Alerts use the new green too
  alertColors: {
    primary: {
      main: "#7928ca",
      state: "#d6006c",
      border: "#efb6e2",
    },

    secondary: {
      main: "#627594",
      state: "#8ca1cb",
      border: "#dadee6",
    },

    info: {
      main: "#22c55e",
      state: "#16a34a",
      border: "#bbf7d0", // soft green border
    },

    success: {
      main: "#17ad37",
      state: "#84dc14",
      border: "#daf3b9",
    },

    warning: {
      main: "#f53939",
      state: "#fac60b",
      border: "#fef1c2",
    },

    error: {
      main: "#ea0606",
      state: "#ff3d59",
      border: "#f9b4b4",
    },

    light: {
      main: "#ced4da",
      state: "#d1dae6",
      border: "#f8f9fa",
    },

    dark: {
      main: "#141727",
      state: "#2c3154",
      border: "#c2c8d1",
    },
  },

  badgeColors: {
    primary: { background: "#f883dd", text: "#a3017e" },
    secondary: { background: "#e4e8ed", text: "#5974a2" },
    info: { background: "#bbf7d0", text: "#15803d" }, // soft green badge
    success: { background: "#cdf59b", text: "#67b108" },
    warning: { background: "#fef5d3", text: "#fbc400" },
    error: { background: "#fc9797", text: "#bd0000" },
    light: { background: "#ffffff", text: "#c7d3de" },
    dark: { background: "#8097bf", text: "#1e2e4a" },
  },

  inputColors: {
    borderColor: { main: "#d2d6da", focus: "#22c55e" },
    boxShadow: "#bbf7d0", // subtle green shadow
    error: "#fd5c70",
    success: "#22c55e",
  },

  sliderColors: {
    thumb: { borderColor: "#d9d9d9" },
  },

  circleSliderColors: {
    background: "#d3d3d3",
  },

  tabs: {
    indicator: { boxShadow: "#ddd" },
  },
};

export default colors;
