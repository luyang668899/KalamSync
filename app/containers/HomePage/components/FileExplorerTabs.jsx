import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import FileExplorer from './FileExplorer';
import { styles } from '../styles/FileExplorerTabs';
import { DEVICE_TYPE } from '../../../enums';

class FileExplorerTabs extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tabs: [
        {
          id: 'tab-1',
          title: 'Local',
          deviceType: DEVICE_TYPE.local,
          path: '/',
        },
        {
          id: 'tab-2',
          title: 'Android',
          deviceType: DEVICE_TYPE.mtp,
          path: '/',
        },
      ],
      activeTab: 'tab-1',
    };
  }

  handleTabChange = (event, newValue) => {
    this.setState({ activeTab: newValue });
  };

  handleAddTab = () => {
    const newTabId = `tab-${Date.now()}`;
    this.setState((prevState) => ({
      tabs: [
        ...prevState.tabs,
        {
          id: newTabId,
          title: `New Tab`,
          deviceType: DEVICE_TYPE.local,
          path: '/',
        },
      ],
      activeTab: newTabId,
    }));
  };

  handleCloseTab = (tabId) => {
    this.setState((prevState) => {
      const newTabs = prevState.tabs.filter((tab) => tab.id !== tabId);
      let newActiveTab = prevState.activeTab;
      
      if (newActiveTab === tabId) {
        newActiveTab = newTabs.length > 0 ? newTabs[0].id : null;
      }
      
      return {
        tabs: newTabs,
        activeTab: newActiveTab,
      };
    });
  };

  render() {
    const { classes } = this.props;
    const { tabs, activeTab } = this.state;

    return (
      <div className={classes.root}>
        <div className={classes.tabsContainer}>
          <Tabs
            value={activeTab}
            onChange={this.handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            className={classes.tabs}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                label={
                  <div className={classes.tabLabel}>
                    {tab.title}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        this.handleCloseTab(tab.id);
                      }}
                      className={classes.closeButton}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                }
                value={tab.id}
              />
            ))}
            <Tab
              icon={<AddIcon />}
              onClick={this.handleAddTab}
              className={classes.addTab}
            />
          </Tabs>
        </div>
        <div className={classes.content}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={classnames(classes.tabContent, {
                [classes.activeContent]: tab.id === activeTab,
              })}
            >
              {tab.id === activeTab && (
                <FileExplorer
                  hideColList={tab.deviceType === DEVICE_TYPE.mtp ? [] : []}
                  deviceType={tab.deviceType}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(FileExplorerTabs);