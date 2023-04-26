import * as vue from 'vue';
import {
  YBtn,
  YChip,
  YInput,
  YFieldInput,
  YForm,
  YCard,
  YCardBody,
  YCardHeader,
  YCardFooter,
  YDialog,
  YLayer,
  YSnackbar,
  YProgressBar,
  YRingSpinner,
} from 'yuyeon/types/components';

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    // @define-components
    YBtn: typeof YBtn;
    YChip: typeof YChip;
    YInput: typeof YInput;
    YFieldInput: typeof YFieldInput;
    YForm: typeof YForm;
    YCard: typeof YCard;
    YCardBody: typeof YCardBody;
    YCardHeader: typeof YCardHeader;
    YCardFooter: typeof YCardFooter;
    YDialog: typeof YDialog;
    YLayer: typeof YLayer;
    YSnackbar: typeof YSnackbar;
    YProgressBar: typeof YProgressBar;
    YRingSpinner: typeof YRingSpinner;
  }
}
