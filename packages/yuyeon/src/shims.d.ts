import type {
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
  YDataTableServer,
  YDateCalendar,
  YDatePicker,
  YDividePanel,
  YDivider,
  YExpandHTransition,
  YExpandVTransition,
  YFieldInput,
  YForm,
  YHover,
  YIcon,
  YImg,
  YInput,
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
  YTextarea,
  YTextEllipsis,
  YTextHighlighter,
  YTi,
  YTooltip,
  YTreeView
} from "yuyeon/components";

declare module "vue" {
  export interface GlobalComponents {
    // @define-components
    YApp: YApp;
    YButton: YButton;
    YChip: YChip;
    YInput: YInput;
    YFieldInput: YFieldInput;
    YTextarea: YTextarea;
    YForm: YForm;
    YCard: YCard;
    YCardBody: YCardBody;
    YCardHeader: YCardHeader;
    YCardFooter: YCardFooter;
    YDialog: YDialog;
    YLayer: YLayer;
    YSnackbar: YSnackbar;
    YProgressBar: YProgressBar;
    YSpinnerRing: YSpinnerRing;
    YTooltip: YTooltip;
    YExpandVTransition: YExpandVTransition;
    YExpandHTransition: YExpandHTransition;
    YDividePanel: YDividePanel;
    YList: YList;
    YListItem: YListItem;
    YTreeView: YTreeView;
    YTreeViewNode: YTreeViewNode;
    YTable: YTable;
    YDataTable: YDataTable;
    YDataTableLayerRows: YDataTableLayerRows;
    YDataTableLayerRow: YDataTableLayerRow;
    YDataTableServer: YDataTableServer;
    YMenu: YMenu;
    YPagination: YPagination;
    YInputCheckbox: YInputCheckbox;
    YCheckbox: YCheckbox;
    YSwitch: YSwitch;
    YDropdown: YDropdown;
    YSelect: YSelect;
    YAlert: YAlert;
    YTabs: YTabs;
    YTab: YTab;
    YDivider: YDivider;
    YDateCalendar: YDateCalendar;
    YIcon: YIcon;
    YDatePicker: YDatePicker;
    YMonthPicker: YMonthPicker;
    YBadge: YBadge;
    YIpv4Field: YIpv4Field;
    YHover: YHover;
    YTi: YTi;
    YTextHighlighter: YTextHighlighter;
    YProgressRing: YProgressRing;
    YTextEllipsis: YTextEllipsis;
    YImg: YImg;
  }

  export interface GlobalDirectives {
    vPlateWave: (typeof import("yuyeon/directives"))["PlateWave"];
    vComplementClick: (typeof import("yuyeon/directives"))["ComplementClick"];
  }
}
