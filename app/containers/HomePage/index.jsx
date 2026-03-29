import React, { PureComponent, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import FileExplorerTabs from './components/FileExplorerTabs';
import { styles } from './styles';
import Onboarding from '../Onboarding';

class Home extends PureComponent {
  render() {
    const { classes: styles } = this.props;

    return (
      <Fragment>
        <Onboarding />
        <div className={styles.root}>
          <FileExplorerTabs />
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, null)(withStyles(styles)(Home));
