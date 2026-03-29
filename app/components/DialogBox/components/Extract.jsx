import React, { Component } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/Extract';

class Extract extends Component {
  constructor(props) {
    super(props);

    this.initialState = {
      outputPath: '',
      errors: {
        toggle: false,
        message: null,
      },
    };

    this.state = {
      ...this.initialState,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.trigger !== this.props.trigger) {
      if (this.props.trigger) {
        this.setState({ ...this.initialState });
      }
    }
  }

  _handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  _handleConfirm = () => {
    const { outputPath } = this.state;
    const { onClickHandler, archivePath } = this.props;

    if (outputPath.trim() === '') {
      this.setState({
        errors: {
          toggle: true,
          message: 'Output path cannot be empty',
        },
      });
      return;
    }

    onClickHandler({
      confirm: true,
      outputPath,
    });
  };

  _handleCancel = () => {
    const { onClickHandler } = this.props;
    onClickHandler({ confirm: false });
  };

  render() {
    const { classes, trigger, archivePath } = this.props;
    const { outputPath, errors } = this.state;

    return (
      <Dialog
        open={trigger}
        onClose={this._handleCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Extract Archive</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the output path for extracted files
          </DialogContentText>

          <TextField
            margin="dense"
            id="archivePath"
            label="Archive Path"
            type="text"
            fullWidth
            value={archivePath}
            disabled
            className={classes.textField}
          />

          <TextField
            autoFocus
            margin="dense"
            id="outputPath"
            name="outputPath"
            label="Output Path"
            type="text"
            fullWidth
            value={outputPath}
            onChange={this._handleInputChange}
            placeholder="e.g., /Users/username/Documents/extracted"
            className={classes.textField}
          />

          {errors.toggle && (
            <div className={classes.errorMessage}>
              {errors.message}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={this._handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={this._handleConfirm} color="primary" variant="contained">
            Extract
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(Extract);
