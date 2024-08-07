import { app, BrowserWindow, Menu, MenuItem } from 'electron';
const { spawn } = require('child_process');

const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1200,
  });

  // Start backend server as a child process
  console.log(`Spawing backend server as child process.`)
  const backendServer = spawn('node', ['app/src/backend/server.js', {cwd: __dirname}]);

  backendServer.stdout.on('data', (data) => {
    console.log(`Server stdout: ${data}`);
  })

  backendServer.stderr.on('datta', (data) => {
    console.error(`Server stderr: ${data}`);
  })
  backendServer.on('close', (code) => {
    console.log(`Server child process exited with code ${code}`);
  })

  // and load the index.html of the app.
  mainWindow.loadURL(`http://localhost:3000/`);

  // Application Menu on the top bar
  // Temmplate 

  const Debug = false;

  function getMenuTemplate(){
    if (Debug) {
      return [
        {
          label: 'Menu',
          submenu: [
            {
              label: 'DevTools',
              click: () => {
                mainWindow.webContents.openDevTools();
              }
            },
            {
              label: 'Form',
              click: () => {
                mainWindow.loadURL('http://localhost:3000/enrollment')
              }
            },
            {
              label: 'Main Page',
              click: () => {
                mainWindow.loadURL('http://localhost:3000/')
              }
            },
            {
              label: 'Second Form',
              click: () => {
                mainWindow.loadURL('http://localhost:3000/information1')
              }
            },
            {
              label: 'Third Form',
              click: () => {
                mainWindow.loadURL('http://localhost:3000/information2')
              }
            },
            {
              label: 'Final Form',
              click: () => {
                mainWindow.loadURL('http://localhost:3000/evaluation')
              }
            },
            {
              label: 'View Edit',
              click: () => {
                mainWindow.loadURL('http://localhost:3000/view/edit');
              }
            }
          ]
        }
      ]
    } else {
      return [
        {
          label: 'Menu',
          submenu: [
            {
              label: 'Start Page',
              click: () => {
                mainWindow.loadURL('http://localhost:3000/')
              }
            },
            {
              label: 'Search',
              click: () => {
                mainWindow.loadURL('http://localhost:3000/search')
              }
            },
            {
              label: 'Settings',
              click: () => {
                mainWindow.loadURL('http://localhost:3000/settings')
              }
            }
          ]
        }
      ]
    }
  }
  const template = getMenuTemplate();

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }

});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
