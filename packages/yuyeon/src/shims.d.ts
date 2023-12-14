import {
  YAlert,
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
  YDateCalendar,
  YDialog,
  YDividePanel,
  YDivider,
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
  YSelect,
  YSnackbar,
  YSpinnerRing,
  YSwitch,
  YTab,
  YTable,
  YTabs,
  YTextarea,
  YTooltip,
  YTreeView,
  YTreeViewNode,
} from 'yuyeon/types/components';

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    // @define-components
    YApp: typeof YApp;
    YButton: typeof YButton;
    YChip: typeof YChip;
    YInput: typeof YInput;
    YFieldInput: typeof YFieldInput;
    YTextarea: typeof YTextarea;
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
    YAlert: typeof YAlert;
    YTabs: typeof YTabs;
    YTab: typeof YTab;
    YDivider: typeof YDivider;
    YDateCalendar: typeof YDateCalendar;
  }
}
