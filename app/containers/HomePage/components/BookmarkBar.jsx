import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AddIcon from '@material-ui/icons/Add';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { styles } from '../styles/BookmarkBar';
import fileExplorerController from '../../../data/file-explorer/controllers/FileExplorerController';

class BookmarkBar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      bookmarks: [],
      anchorEl: null,
      bookmarkMenuAnchor: null,
    };
  }

  componentDidMount() {
    this.loadBookmarks();
  }

  loadBookmarks = async () => {
    try {
      const { data, error } = await fileExplorerController.listBookmarks();
      if (!error && data) {
        this.setState({ bookmarks: data });
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  handleAddBookmark = () => {
    const { currentPath, deviceType, storageId } = this.props;
    const bookmarkName = prompt('Enter bookmark name:');
    
    if (bookmarkName && currentPath) {
      this.addBookmark(bookmarkName, currentPath, deviceType, storageId);
    }
  };

  addBookmark = async (name, path, deviceType, storageId) => {
    try {
      await fileExplorerController.addBookmark({ deviceType, path, name, storageId });
      this.loadBookmarks();
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  };

  handleBookmarkClick = (bookmark) => {
    const { onNavigate } = this.props;
    if (onNavigate) {
      onNavigate(bookmark.path, bookmark.deviceType, bookmark.storageId);
    }
  };

  handleBookmarkMenuOpen = (event) => {
    this.setState({ bookmarkMenuAnchor: event.currentTarget });
  };

  handleBookmarkMenuClose = () => {
    this.setState({ bookmarkMenuAnchor: null });
  };

  handleDeleteBookmark = async (bookmarkId) => {
    try {
      await fileExplorerController.deleteBookmark(bookmarkId);
      this.loadBookmarks();
      this.handleBookmarkMenuClose();
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  render() {
    const { classes } = this.props;
    const { bookmarks, bookmarkMenuAnchor } = this.state;

    return (
      <div className={classes.root}>
        <div className={classes.bookmarkList}>
          {bookmarks.map((bookmark) => (
            <Button
              key={bookmark.id}
              variant="contained"
              color="primary"
              size="small"
              className={classes.bookmarkButton}
              onClick={() => this.handleBookmarkClick(bookmark)}
            >
              {bookmark.name}
            </Button>
          ))}
          <IconButton
            color="primary"
            className={classes.addButton}
            onClick={this.handleAddBookmark}
            title="Add Bookmark"
          >
            <AddIcon />
          </IconButton>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(BookmarkBar);