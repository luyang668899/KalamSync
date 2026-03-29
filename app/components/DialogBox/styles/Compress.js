import { createStyles, makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(() =>
  createStyles({
    textField: {
      margin: '16px 0',
    },
    errorMessage: {
      color: 'red',
      marginTop: 8,
      fontSize: '0.875rem',
    },
  })
);
