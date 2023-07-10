import * as vue from 'vue';
import {
  YApp,
  YButton,
  YCard,
  YCardBody,
  YCardFooter,
  YCardHeader,
  YCheckbox,
  YChip,
  YDataTable,
  YDataTableServer,
  YDialog,
  YDividePanel,
  YDropdown,
  YExpandHTransition,
  YExpandVTransition,
  YFieldInput,
  YForm,
  YInput,
  YInputCheckbox,
  YLayer,
  YList,
  YListItem,
  YMenu,
  YPagination,
  YProgressBar,
  YSnackbar,
  YSpinnerRing,
  YSwitch,
  YTable,
  YTooltip,
  YTreeView,
  YTreeViewNode,
  YSelect,
} from 'yuyeon/types/components';

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    // @define-components
    YApp: typeof YApp;
    YButton: typeof YButton;
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
    YSpinnerRing: typeof YSpinnerRing;
    YTooltip: typeof YTooltip;
    YExpandVTransition: typeof YExpandVTransition;
    YExpandHTransition: typeof YExpandHTransition;
    YDividePanel: typeof YDividePanel;
    YList: typeof YList;
    YListItem: typeof YListItem;
    YTreeView: typeof YTreeView;
    YTreeViewNode: typeof YTreeViewNode;
    YDataTable: typeof YDataTable;
    YTable: typeof YTable;
    YDataTableServer: typeof YDataTableServer;
    YMenu: typeof YMenu;
    YPagination: typeof YPagination;
    YInputCheckbox: typeof YInputCheckbox;
    YCheckbox: typeof YCheckbox;
    YSwitch: typeof YSwitch;
    YDropdown: typeof YDropdown;
    YSelect: typeof YSelect;
  }
}
