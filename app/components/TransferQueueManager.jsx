import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import CancelIcon from '@material-ui/icons/Cancel';
import HistoryIcon from '@material-ui/icons/History';
import QueueIcon from '@material-ui/icons/Queue';
import { styles } from './styles/TransferQueueManager';
import fileExplorerController from '../data/file-explorer/controllers/FileExplorerController';

class TransferQueueManager extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      queue: [],
      history: [],
      activeTab: 'queue', // queue or history
    };
  }

  componentDidMount() {
    this.loadQueue();
    this.loadHistory();
    this.interval = setInterval(() => {
      this.loadQueue();
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  loadQueue = async () => {
    try {
      const { data, error } = await fileExplorerController.getTransferQueue();
      if (!error && data) {
        this.setState({ queue: data });
      }
    } catch (error) {
      console.error('Error loading transfer queue:', error);
    }
  };

  loadHistory = async () => {
    try {
      const { data, error } = await fileExplorerController.getTransferHistory();
      if (!error && data) {
        this.setState({ history: data });
      }
    } catch (error) {
      console.error('Error loading transfer history:', error);
    }
  };

  handlePauseTask = async (taskId) => {
    try {
      await fileExplorerController.pauseTransferTask(taskId);
      this.loadQueue();
    } catch (error) {
      console.error('Error pausing task:', error);
    }
  };

  handleResumeTask = async (taskId) => {
    try {
      await fileExplorerController.resumeTransferTask(taskId);
      this.loadQueue();
    } catch (error) {
      console.error('Error resuming task:', error);
    }
  };

  handleCancelTask = async (taskId) => {
    try {
      await fileExplorerController.cancelTransferTask(taskId);
      this.loadQueue();
      this.loadHistory();
    } catch (error) {
      console.error('Error canceling task:', error);
    }
  };

  handleTabChange = (tab) => {
    this.setState({ activeTab: tab });
    if (tab === 'history') {
      this.loadHistory();
    }
  };

  renderTaskItem = (task) => {
    const { classes } = this.props;

    return (
      <ListItem key={task.id} className={classes.taskItem}>
        <ListItemText
          primary={task.direction === 'upload' ? 'Upload' : 'Download'}
          secondary={
            <div>
              <Typography variant="body2">
                {task.fileList.length} files
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {task.status} - {new Date(task.updatedAt).toLocaleString()}
              </Typography>
            </div>
          }
        />
        <ListItemSecondaryAction>
          {task.status === 'running' && (
            <IconButton
              edge="end"
              aria-label="pause"
              onClick={() => this.handlePauseTask(task.id)}
            >
              <PauseIcon />
            </IconButton>
          )}
          {task.status === 'paused' && (
            <IconButton
              edge="end"
              aria-label="resume"
              onClick={() => this.handleResumeTask(task.id)}
            >
              <PlayArrowIcon />
            </IconButton>
          )}
          {(task.status === 'running' || task.status === 'paused' || task.status === 'queued') && (
            <IconButton
              edge="end"
              aria-label="cancel"
              onClick={() => this.handleCancelTask(task.id)}
            >
              <CancelIcon />
            </IconButton>
          )}
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  render() {
    const { classes } = this.props;
    const { queue, history, activeTab } = this.state;

    return (
      <div className={classes.root}>
        <div className={classes.tabContainer}>
          <Button
            variant={activeTab === 'queue' ? 'contained' : 'outlined'}
            color="primary"
            className={classes.tabButton}
            startIcon={<QueueIcon />}
            onClick={() => this.handleTabChange('queue')}
          >
            Queue ({queue.length})
          </Button>
          <Button
            variant={activeTab === 'history' ? 'contained' : 'outlined'}
            color="primary"
            className={classes.tabButton}
            startIcon={<HistoryIcon />}
            onClick={() => this.handleTabChange('history')}
          >
            History ({history.length})
          </Button>
        </div>
        <Divider />
        <div className={classes.content}>
          {activeTab === 'queue' ? (
            <List className={classes.list}>
              {queue.length > 0 ? (
                queue.map(this.renderTaskItem)
              ) : (
                <ListItem>
                  <ListItemText primary="No tasks in queue" />
                </ListItem>
              )}
            </List>
          ) : (
            <List className={classes.list}>
              {history.length > 0 ? (
                history.map(this.renderTaskItem)
              ) : (
                <ListItem>
                  <ListItemText primary="No transfer history" />
                </ListItem>
              )}
            </List>
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(TransferQueueManager);