import { createSelector } from 'reselect';
import { initialState } from './reducers';
import { getSelectedStorageIdFromState } from './actions';

// 确保 initialState 有默认的 mtpDevices 和 activeMtpDeviceId
if (!initialState.mtpDevices) {
  initialState.mtpDevices = {};
}

if (initialState.activeMtpDeviceId === undefined) {
  initialState.activeMtpDeviceId = null;
}

// 保持向后兼容
if (!initialState.mtpDevice) {
  initialState.mtpDevice = {
    isAvailable: false,
    error: null,
    isLoading: false,
    info: {},
  };
}

const make = (state, __) => (state ? state.Home : {});

export const makeFocussedFileExplorerDeviceType = createSelector(
  make,
  (state) =>
    state
      ? state.focussedFileExplorerDeviceType
      : initialState.focussedFileExplorerDeviceType
);

export const makeToolbarList = createSelector(make, (state) =>
  state ? state.toolbarList : initialState.toolbarList
);

export const makeSidebarFavouriteList = createSelector(make, (state) =>
  state ? state.sidebarFavouriteList : initialState.sidebarFavouriteList
);

export const makeCurrentBrowsePath = createSelector(make, (state) =>
  state ? state.currentBrowsePath : initialState.currentBrowsePath
);

export const makeDirectoryLists = createSelector(make, (state) =>
  state ? state.directoryLists : initialState.directoryLists
);

export const makeMtpDevice = createSelector(make, (state) => {
  if (!state) return initialState.mtpDevice;
  const deviceId = state.activeMtpDeviceId;
  return deviceId ? state.mtpDevices[deviceId] : initialState.mtpDevice;
});

export const makeMtpDevices = createSelector(make, (state) =>
  state ? state.mtpDevices : initialState.mtpDevices
);

export const makeActiveMtpDeviceId = createSelector(make, (state) =>
  state ? state.activeMtpDeviceId : initialState.activeMtpDeviceId
);

export const makeContextMenuList = createSelector(make, (state) =>
  state ? state.contextMenuList : initialState.contextMenuList
);

export const makeMtpStoragesList = createSelector(make, (state) =>
  state ? state.mtpStoragesList : initialState.mtpStoragesList
);

export const makeStorageId = createSelector(make, (state) =>
  state ? getSelectedStorageIdFromState(state) : {}
);

export const makeFileTransferClipboard = createSelector(make, (state) =>
  state ? state.fileTransfer.clipboard : initialState.fileTransfer.clipboard
);

export const makeFileTransferProgess = createSelector(make, (state) =>
  state ? state.fileTransfer.progress : initialState.fileTransfer.progress
);

export const makeFilesDrag = createSelector(make, (state) =>
  state ? state.filesDrag : initialState.filesDrag
);
