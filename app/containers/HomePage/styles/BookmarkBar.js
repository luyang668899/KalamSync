export const styles = (theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    borderBottom: 1,
    borderColor: 'divider',
    padding: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
  },
  bookmarkList: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  bookmarkButton: {
    margin: 0,
    textTransform: 'none',
    fontSize: '0.875rem',
    padding: '4px 12px',
  },
  addButton: {
    margin: 0,
    padding: 4,
  },
});