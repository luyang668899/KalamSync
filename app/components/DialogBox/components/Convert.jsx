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
import { styles } from '../styles/Convert';

class Convert extends Component {
  constructor(props) {
    super(props);

    this.initialState = {
      outputFormat: 'jpg',
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
    const { outputFormat, outputPath } = this.state;
    const { onClickHandler, filesCount } = this.props;

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
      outputFormat,
      outputPath,
    });
  };

  _handleCancel = () => {
    const { onClickHandler } = this.props;
    onClickHandler({ confirm: false });
  };

  render() {
    const { classes, trigger, filesCount } = this.props;
    const { outputFormat, outputPath, errors } = this.state;

    return (
      <Dialog
        open={trigger}
        onClose={this._handleCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Batch Convert ({filesCount} files)</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Choose the output format and destination for the converted files
          </DialogContentText>

          <FormControl className={classes.formControl}>
            <InputLabel id="output-format-label">Output Format</InputLabel>
            <Select
              labelId="output-format-label"
              id="output-format"
              value={outputFormat}
              onChange={this._handleInputChange}
              name="outputFormat"
              className={classes.select}
            >
              <MenuItem value="jpg">JPG</MenuItem>
              <MenuItem value="png">PNG</MenuItem>
              <MenuItem value="gif">GIF</MenuItem>
              <MenuItem value="tiff">TIFF</MenuItem>
            </Select>
          </FormControl>

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
            placeholder="e.g., /Users/username/Desktop/converted"
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
            Convert
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(Convert);