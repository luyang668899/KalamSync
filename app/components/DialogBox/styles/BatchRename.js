import { createStyles, makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(() =>
  createStyles({
    formControl: {
      margin: '16px 0',
      minWidth: 120,
      width: '100%',
    },
    select: {
      marginTop: 8,
    },
    textField: {
      margin: '8px 0',
    },
    errorMessage: {
      color: 'red',
      marginTop: 8,
      fontSize: '0.875rem',
    },
  })
);
