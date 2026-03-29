export const styles = (theme) => ({
  root: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.palette.background.paper,
    border: '1px solid',
    borderColor: theme.palette.divider,
    borderRadius: theme.shape.borderRadius,
  },
  tabContainer: {
    display: 'flex',
    padding: theme.spacing(1),
  },
  tabButton: {
    margin: theme.spacing(0.5),
  },
  content: {
    maxHeight: 400,
    overflow: 'auto',
  },
  list: {
    padding: 0,
  },
  taskItem: {
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.divider,
  },
});