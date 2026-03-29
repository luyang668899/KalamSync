export const styles = (theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    height: '100%',
  },
  tabsContainer: {
    borderBottom: 1,
    borderColor: 'divider',
  },
  tabs: {
    minHeight: 48,
  },
  tabLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 120,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
  addTab: {
    minWidth: 48,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    height: 'calc(100% - 48px)',
    overflow: 'auto',
  },
  tabContent: {
    display: 'none',
    height: '100%',
  },
  activeContent: {
    display: 'block',
  },
});