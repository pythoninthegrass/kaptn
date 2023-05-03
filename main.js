const path = require('path');
const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const electronBrowserWindow = require('electron').BrowserWindow;
const electronIpcMain = require('electron').ipcMain;
const nodePath = require('path');
const { exec, spawnSync, spawn } = require('child_process');
// const redis = require('./redis');

const isDev = process.env.NODE_ENV === 'development';

/******** MAIN WINDOW SETUP ********/

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: 'Kaptn',
    titleBarStyle: 'hidden',
    width: 1200,
    height: 700,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:4444/');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, render the html build file
    mainWindow.loadURL(`file://${path.join(__dirname, '/dist/index.html#/')}`);
  }
}

/******** EVENT LISTENERS ********/

// Listen to post_command event
ipcMain.on('post_command', (event, arg) => {
  const { command, currDir } = arg;

  exec(` ${command}`, { cwd: currDir }, (err, stdout, stderr) => {
    // Handle failed command execution
    if (err) {
      return err;
    }
    // Handle successful command execution but returned error (stderr)
    if (stderr) {
      return event.sender.send('post_command', stderr);
    }
    // Handle successful command execution with no errors
    return event.sender.send('post_command', stdout);
  });
});

// Listen to prom_setup event
ipcMain.on('prom_setup', (event, arg) => {
  // This command adds chart repository to helm
  spawnSync(
    'helm repo add prometheus-community https://prometheus-community.github.io/helm-charts',
    { stdio: 'inherit', shell: true }
  );

  // Update helm
  spawnSync('helm repo update', { stdio: 'inherit', shell: true });

  // Install helm chart
  spawnSync(
    'helm install prometheus666 prometheus-community/kube-prometheus-stack',
    { stdio: 'inherit', shell: true }
  );

  return event.sender.send('prom_setup', 'Prom setup complete');
});

// Listen to graf_setup event
ipcMain.on('graf_setup', (event, arg) => {
  let podName;
  const getFunc = exec('kubectl get pods', (err, stdout, stderr) => {
    if (err) {
      console.log(`exec error: ${err}`);
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
    }

    const output = stdout.split('\n');
    output.forEach((pod) => {
      if (pod.includes('prometheus666-grafana')) {
        [podName] = pod.split(' ');
      }
    });
    console.log(podName);
  });

  getFunc.once('close', () => {
    spawnSync('kubectl apply -f prometheus666-grafana.yaml', {
      studio: 'inherit',
      shell: true,
    });
    spawnSync(`kubectl delete pod ${podName}`, {
      stdio: 'inherit',
      shell: true,
    });
    return event.sender.send('graf_setup', 'Grafana setup complete');
  });
});

// Listen to forward_ports event
ipcMain.on('forward_ports', (event, arg) => {
  const ports = spawn(
    `kubectl port-forward deployment/prometheus666-grafana 3000`,
    {
      shell: true,
    }
  );

  ports.stderr.on('data', (data) => {
    console.log(`grafana port forwarding error: ${data}`);
  });

  ports.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    return event.sender.send('prom_setup', 'Port forward complete');
  });
});

// Listen to retrieve_key event
ipcMain.on('retrieve_key', (event, arg) => {
  const cacheKey = 'api_key';

  // Helper function to retrieve the API key
  const getAPIKey = async () => {
    try {
      // const cachedValue = await redis.get(cacheKey);
      // // Return the cached API key if it exists
      // if (cachedValue !== null) {
      //   // Send the cached response
      //   return event.sender.send('retrieve_key', cachedValue);
      // }
      // If the API key is not in the cache, fetch it from the API
      const response = await fetch('http://localhost:3000/api/auth/keys', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          Authorization:
            'Basic ' + Buffer.from('admin:prom-operator').toString('base64'),
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: Math.random().toString(36).substring(7),
          role: 'Admin',
          secondsToLive: 86400,
        }),
      });

      const data = await response.json();

      // Send the fetched response
      return event.sender.send('retrieve_key', data.key);
    } catch (error) {
      console.log(error);
    }
  };

  getAPIKey();
});

// Listen to retrieve_uid event
ipcMain.on('retrieve_uid', (event, arg) => {
  const { key, dashboard } = arg;
  console.log(arg)
  console.log(key)
  console.log(dashboard)

  // Helper function to retrieve the UID key
  const getUID = async () => {
    try {
      // const cachedValue = await redis.get(dashboard);

      // // Return the cached UID if it exists
      // if (cachedValue !== null) {
      //   return event.sender.send('retrieve_uid', cachedValue);
      // }

      // If the UID is not in the cache, fetch it from the API
      let response = await fetch(
        `http://localhost:3000/api/search?query=${encodeURIComponent(
          dashboard
        )}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        }
      );

      let data = await response.json();

      // Send the fetched response
      const uid = data[0].uid;
      return event.sender.send('retrieve_uid', uid);
    } catch (error) {
      console.log(error);
    }
  };

  getUID();
});

/******** MAIN WINDOW LOAD ********/

// Load the main window
app.whenReady().then(() => {
  createMainWindow();
});
