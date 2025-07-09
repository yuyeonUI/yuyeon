import {
  YAlert,
  YApp,
  YBadge,
  YButton,
  YCard,
  YCardBody,
  YCardFooter,
  YCardHeader,
  YCheckbox,
  YChip,
  YDataTable,
  YDataTableLayerRow,
  YDataTableLayerRows,
  YDataTableServer,
  YDateCalendar,
  YDatePicker,
  YDialog,
  YDividePanel,
  YDivider,
  YDropdown,
  YExpandHTransition,
  YExpandVTransition,
  YFieldInput,
  YForm,
  YHover,
  YIcon,
  YInput,
  YInputCheckbox,
  YIpv4Field,
  YLayer,
  YList,
  YListItem,
  YMenu,
  YMonthPicker,
  YPagination,
  YProgressBar,
  YProgressRing,
  YSelect,
  YSnackbar,
  YSpinnerRing,
  YSwitch,
  YTab,
  YTable,
  YTabs,
  YTextHighlighter,
  YTextarea,
  YTi,
  YTooltip,
  YTreeView,
  YTreeViewNode,
} from 'yuyeon/components';

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
    YTable: typeof YTable;
    YDataTable: typeof YDataTable;
    YDataTableLayerRows: typeof YDataTableLayerRows;
    YDataTableLayerRow: typeof YDataTableLayerRow;
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
    YIcon: typeof YIcon;
    YDatePicker: typeof YDatePicker;
    YMonthPicker: typeof YMonthPicker;
    YBadge: typeof YBadge;
    YIpv4Field: typeof YIpv4Field;
    YHover: typeof YHover;
    YTi: typeof YTi;
    YTextHighlighter: typeof YTextHighlighter;
    YProgressRing: typeof YProgressRing;
  }
}
