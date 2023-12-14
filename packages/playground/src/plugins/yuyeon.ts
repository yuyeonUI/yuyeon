import { init } from "yuyeon";
import { ko } from "yuyeon/locales";
import PrevSvg from '@/assets/prev.svg?component';
import ConversionStatusChip from "@/components/ConversionStatusChip.vue";

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
      prev: {
        component: PrevSvg,
        props: {
          style: 'height: 100px'
        }
      },
      conversionStatusChip: {
        component: ConversionStatusChip,
        props: {
          status: 'TEST'
        }
      }
    }
  },
  credit: true,
});

export default yuyeon;
