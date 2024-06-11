const path = require('path');
const os = require('os');
const fs = require('fs');
const { app, BrowserWindow, Menu, dialog } = require('electron');
const { autoUpdater } = require("electron-updater");
require('dotenv').config();

const isDev = process.env.NODE_ENV === 'develop';
const isMac = process.platform === 'darwin';
const appVersion = app.getVersion();

/* AutoUpdate flags*/
autoUpdater.requestHeaders = {"PRIVATE-TOKEN": "YOUR_TOKEN"};
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

const gotTheLock = app.requestSingleInstanceLock();
let mainWindow;

/* Main Window settings */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: isDev ? 1280 : 1000,
    height: 600,
    title: 'title',
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
    },
  });
  mainWindow.maximize();
  mainWindow.loadFile('index.html');

  /* Show devtools automatically if in development*/
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

/* Menu template for dev */
const menu = [
  ...(isDev
    ? [
      {
        label: 'Developer',
        submenu: [
          { role: 'reload' },
          { role: 'forcereload' },
          { type: 'separator' },
          { role: 'toggledevtools' },
        ],
      },
    ]
    : []),
];

/* When the app is ready, create the window*/
app.on('ready', () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  /* Remove variable from memory */
  mainWindow.on('closed', () => (mainWindow = null));
});

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    /* Someone tried to start a second instance, focus our window */
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
    }
  })

  /* Create myWindow, load the rest of the application, etc. */
  app.on('ready', () => {
  })
};

/* Quit when all windows are closed */
app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});

/* Open a window if none are open (macOS) */
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

/* New Update Available */

/*Check for update*/
autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on('error', (error) => {
  dialog.showMessageBoxSync({
    type: 'info',
    title: 'Update error',
    message: `${error}`
  });
});
  
autoUpdater.on('update-available', () => {
  let response = dialog.showMessageBoxSync({
    type: 'info',
    title: 'Found Updates',
    message: 'Found updates, do you want to update app now? Update needs around 70 mb of internet data',
    buttons: ['Update', 'Later']
  });

  if (response === 0) {
    autoUpdater.downloadUpdate();
  };
});

autoUpdater.on('update-not-available', () => {
  console.log('Current version is up-to-date.')
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application will be quit for update...'
  });

  autoUpdater.quitAndInstall();
});
