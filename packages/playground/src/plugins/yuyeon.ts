import ConversionStatusChip from "@/components/ConversionStatusChip.vue";
import type { Plugin } from "vue";
import { init } from "yuyeon";
import { ko } from "yuyeon/locales";

const yuyeon = init({
  theme: {
    themes: {
      light: {
        colors: {
          background: "#f1f1f1",
          surface: "#ffffff",
        },
      },
      dark: {
        isDark: true,
        colors: {
          background: "#24262a",
          // surface: "#212121",
        },
      },
    },
  },
  i18n: {
    locale: "ko",
    messages: {
      ko,
    },
  },
  icon: {
    aliases: {
      conversionStatusChip: {
        component: ConversionStatusChip,
        props: {
          status: "TEST",
        },
      },
    },
  },
  credit: true,
}) as unknown as Plugin;

export default yuyeon;
