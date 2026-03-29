import React, { Component, Fragment } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import { styles } from '../styles/BatchRename';

class BatchRename extends Component {
  constructor(props) {
    super(props);

    this.initialState = {
      pattern: '',
      startNumber: 1,
      numberPadding: 1,
      renameType: 'sequential',
      regexPattern: '',
      replaceWith: '',
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

  _handleNumberChange = (event) => {
    const { name, value } = event.target;
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue) && numericValue > 0) {
      this.setState({ [name]: numericValue });
    }
  };

  _handleConfirm = () => {
    const { pattern, startNumber, numberPadding, renameType, regexPattern, replaceWith } = this.state;
    const { onClickHandler, filesCount } = this.props;

    if (renameType === 'sequential' && pattern.trim() === '') {
      this.setState({
        errors: {
          toggle: true,
          message: 'Pattern cannot be empty',
        },
      });
      return;
    }

    if (renameType === 'regex' && regexPattern.trim() === '') {
      this.setState({
        errors: {
          toggle: true,
          message: 'Regular expression pattern cannot be empty',
        },
      });
      return;
    }

    onClickHandler({
      confirm: true,
      pattern,
      startNumber,
      numberPadding,
      renameType,
      regexPattern,
      replaceWith,
    });
  };

  _handleCancel = () => {
    const { onClickHandler } = this.props;
    onClickHandler({ confirm: false });
  };

  render() {
    const { classes, trigger, filesCount } = this.props;
    const { pattern, startNumber, numberPadding, renameType, regexPattern, replaceWith, errors } = this.state;

    return (
      <Dialog
        open={trigger}
        onClose={this._handleCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Batch Rename ({filesCount} files)</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Choose how you want to rename the selected files
          </DialogContentText>

          <FormControl className={classes.formControl}>
            <InputLabel id="rename-type-label">Rename Type</InputLabel>
            <Select
              labelId="rename-type-label"
              id="rename-type"
              value={renameType}
              onChange={this._handleInputChange}
              name="renameType"
              className={classes.select}
            >
              <MenuItem value="sequential">Sequential (with numbers)</MenuItem>
              <MenuItem value="regex">Regular Expression</MenuItem>
            </Select>
          </FormControl>

          {renameType === 'sequential' && (
            <Fragment>
              <TextField
                autoFocus
                margin="dense"
                id="pattern"
                name="pattern"
                label="Pattern"
                type="text"
                fullWidth
                value={pattern}
                onChange={this._handleInputChange}
                placeholder="e.g., photo_"
                className={classes.textField}
              />
              <TextField
                margin="dense"
                id="startNumber"
                name="startNumber"
                label="Start Number"
                type="number"
                fullWidth
                value={startNumber}
                onChange={this._handleNumberChange}
                className={classes.textField}
              />
              <TextField
                margin="dense"
                id="numberPadding"
                name="numberPadding"
                label="Number Padding"
                type="number"
                fullWidth
                value={numberPadding}
                onChange={this._handleNumberChange}
                className={classes.textField}
              />
            </Fragment>
          )}

          {renameType === 'regex' && (
            <Fragment>
              <TextField
                autoFocus
                margin="dense"
                id="regexPattern"
                name="regexPattern"
                label="Regular Expression"
                type="text"
                fullWidth
                value={regexPattern}
                onChange={this._handleInputChange}
                placeholder="e.g., old_"
                className={classes.textField}
              />
              <TextField
                margin="dense"
                id="replaceWith"
                name="replaceWith"
                label="Replace With"
                type="text"
                fullWidth
                value={replaceWith}
                onChange={this._handleInputChange}
                placeholder="e.g., new_"
                className={classes.textField}
              />
            </Fragment>
          )}

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
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(BatchRename);
