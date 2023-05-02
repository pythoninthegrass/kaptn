const apiController = {};
const { Router, Request, Response } = require('express');
const { exec } = require('child_process');
const redis = require('../redis/redis');
const cors = require('cors');

apiController.postCommand = (req, res, next) => {
  const { command, currDir } = req.body;
  console.log(currDir);
  // Exec is a child process in node that asynchronously creates a shell and executes the provided command
  // More info: https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
  exec(` ${command}`, { cwd: currDir }, (err, stdout, stderr) => {
    // Handle failed command execution
    if (err) {
      return next({
        log: 'Exec error in apiController.postCommand: Invalid command',
        status: 500,
        message: { err: 'Invalid command' },
      });
    }
    // Handle successful command execution but returned error (stderr)
    if (stderr) {
      return next({
        log: `Exec error in apiController.postCommand: ${stderr}`,
        status: 500,
        message: { err: stderr },
      });
    }
    // Handle successful command execution with no errors
    console.log(`Response: `, stdout);
    res.locals.cliResponse = stdout;
    return next();
  });
};

apiController.getApi = async (req, res, next) => {
  console.log('in getApi controller')
  const cacheKey = 'api_key';
  try {
    // Try to get the API key from the cache
    const cachedValue = await redis.get(cacheKey);
    if (cachedValue !== null) {
      // Return the cached API key if it exists
      res.locals.key = cachedValue;
      // console.log('cached retrieved', cachedValue);
      return next();
    }
    // If the API key is not in the cache, fetch it from the API
    let response = await fetch('http://localhost:3000/api/auth/keys', {
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
    let data = await response.json();
    res.locals.key = data.key;
    // console.log('reslocalskey', res.locals.key)
    // Cache the API key for 1 hour
    // await redis.set(cacheKey, data.key, 'EX', 3600);
    return next();
  } catch (error) {
    return next(error);
  }
};

apiController.getUid = async (req, res, next) => {
  console.log('received uid request');
  const { key, dashboard } = req.body;
  console.log('dashboard: ', dashboard);
  console.log('key: ', key);

  try {
    const cachedValue = await redis.get(dashboard);
    if (cachedValue !== null) {
      res.locals.uid = cachedValue;
      console.log('uid retrieved', cachedValue);
      return next();
    }
    let response = await fetch(
      `http://localhost:3000/api/search?query=${encodeURIComponent(dashboard)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      }
    );
    let data = await response.json();
    // console.log('data', data);
    console.log('data uid', data[0].uid);

    const uid = data[0].uid;
    res.locals.uid = uid;

    // Get the uid of the first dashboard in the list
    // const uid = data[0].uid;
    // res.locals.uid = uid;
    // console.log('uid not in redis, setting uid', uid);
    // await redis.set(dashboard, uid, 'EX', 3600);

    return next();
  } catch (error) {
    console.log('error fetching uid', error);
    return next(error);
  }
};

module.exports = apiController;
