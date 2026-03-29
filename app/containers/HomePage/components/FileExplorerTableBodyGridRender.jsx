import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
// eslint-disable-next-line import/no-relative-packages
import prettyFileIcons from '../../../vendors/pretty-file-icons';
import { springTruncate } from '../../../utils/funcs';
import { FILE_EXPLORER_GRID_TRUNCATE_MAX_CHARS } from '../../../constants';
import { styles } from '../styles/FileExplorerTableBodyGridRender';
import { imgsrc } from '../../../utils/imgsrc';

class FileExplorerTableBodyGridRender extends PureComponent {
  RenderFileIcon = () => {
    const {
      classes: styles,
      item,
      _eventTarget,
      tableData,
      onContextMenuClick,
    } = this.props;

    // Check if the file is an image
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(item.name);
    // Check if the file is a video
    const isVideo = /\.(mp4|avi|mov|wmv|flv|mkv|webm)$/i.test(item.name);
    // Check if the file is a document
    const isDocument = /\.(pdf|txt|doc|docx|rtf)$/i.test(item.name);

    if (isImage) {
      return (
        <div className={styles.fileTypeIconWrapper}>
          <img
            src={item.path}
            alt={item.name}
            className={classNames(styles.fileTypeIcon, styles.imageThumbnail)}
            onContextMenu={(event) =>
              onContextMenuClick(
                event,
                { ...item },
                { ...tableData },
                _eventTarget
              )
            }
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className={styles.fileTypeIconWrapper}>
          <div className={styles.videoThumbnailWrapper}>
            <video
              className={classNames(styles.fileTypeIcon, styles.imageThumbnail)}
              poster={this.getVideoThumbnail(item.path)}
              onContextMenu={(event) =>
                onContextMenuClick(
                  event,
                  { ...item },
                  { ...tableData },
                  _eventTarget
                )
              }
            >
              <source src={item.path} type="video/mp4" />
            </video>
            <div className={styles.videoPlayIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      );
    }

    if (isDocument) {
      return (
        <div className={styles.fileTypeIconWrapper}>
          <div className={styles.documentThumbnailWrapper}>
            {this.getDocumentPreview(item)}
          </div>
        </div>
      );
    }

    const fileIcon = prettyFileIcons.getIcon(item.name, 'svg');

    return (
      <div className={styles.fileTypeIconWrapper}>
        <img
          src={imgsrc(`file-types/${fileIcon}`)}
          alt={item.name}
          className={classNames(styles.fileTypeIcon)}
          onContextMenu={(event) =>
            onContextMenuClick(
              event,
              { ...item },
              { ...tableData },
              _eventTarget
            )
          }
        />
      </div>
    );
  };

  getDocumentPreview = (item) => {
    const { classes: styles } = this.props;
    
    // For now, return a placeholder with file type
    const fileExtension = item.name.split('.').pop().toUpperCase();
    
    return (
      <div className={classNames(styles.fileTypeIcon, styles.documentThumbnail)}>
        <div className={styles.documentContent}>
          <div className={styles.documentExtension}>{fileExtension}</div>
          <div className={styles.documentName}>{item.name.substring(0, 10)}...</div>
        </div>
      </div>
    );
  };

  getVideoThumbnail = (videoPath) => {
    // For now, return a placeholder
    // In a real implementation, we would generate a thumbnail from the video
    return imgsrc(`file-types/video.svg`);
  };

  RenderFolderIcon = () => {
    const {
      classes: styles,
      item,
      _eventTarget,
      tableData,
      onContextMenuClick,
    } = this.props;

    return (
      <div className={styles.fileTypeIconWrapper}>
        <img
          src={imgsrc(`FileExplorer/folder-blue.svg`)}
          alt={item.name}
          className={classNames(styles.fileTypeIcon)}
          onContextMenu={(event) =>
            onContextMenuClick(
              event,
              { ...item },
              { ...tableData },
              _eventTarget
            )
          }
        />
      </div>
    );
  };

  render() {
    const {
      classes: styles,
      isSelected,
      item,
      deviceType,
      _eventTarget,
      tableData,
      onContextMenuClick,
      onTableClick,
      onTableDoubleClick,
    } = this.props;
    const { RenderFileIcon, RenderFolderIcon } = this;

    const fileName = springTruncate(
      item.name,
      FILE_EXPLORER_GRID_TRUNCATE_MAX_CHARS
    );

    return (
      <div
        draggable="true"
        className={classNames(styles.itemWrapper, {
          [styles.itemSelected]: isSelected,
        })}
        onDoubleClick={(event) => onTableDoubleClick(item, deviceType, event)}
        onContextMenu={(event) =>
          onContextMenuClick(event, { ...item }, { ...tableData }, _eventTarget)
        }
        onDragStart={(event) => {
          if (!isSelected) {
            onTableClick(item.path, deviceType, event, true, true);
          }
        }}
      >
        <label>
          <Checkbox
            className={styles.itemCheckBox}
            checked={isSelected}
            onClick={(event) =>
              onTableClick(item.path, deviceType, event, true, true)
            }
          />
          {item.isFolder ? <RenderFolderIcon /> : <RenderFileIcon />}
          <div className={styles.itemFileNameWrapper}>
            <Typography
              variant="caption"
              className={styles.itemFileName}
              onContextMenu={(event) =>
                onContextMenuClick(
                  event,
                  { ...item },
                  { ...tableData },
                  _eventTarget
                )
              }
            >
              {fileName.isTruncated ? (
                <Tooltip title={fileName.text}>
                  <div className={styles.truncate}>
                    {fileName.truncatedText}
                  </div>
                </Tooltip>
              ) : (
                fileName.text
              )}
            </Typography>
          </div>
        </label>
      </div>
    );
  }
}

export default withStyles(styles)(FileExplorerTableBodyGridRender);
