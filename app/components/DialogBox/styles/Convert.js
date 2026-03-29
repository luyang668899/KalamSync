import { createStyles, makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles((theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      width: '100%',
    },
    select: {
      marginBottom: theme.spacing(2),
    },
    textField: {
      marginBottom: theme.spacing(2),
    },
    errorMessage: {
      color: theme.palette.error.main,
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  })
);