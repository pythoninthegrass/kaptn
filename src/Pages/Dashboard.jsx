import React from 'react';
import { useState, useEffect } from 'react';
import {
  Button,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Autocomplete,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/system';
import Grid from '@mui/system/Unstable_Grid';
import OutlinedInput from '@mui/material/OutlinedInput';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import SideNav from '../components/Sidebar';
import CommandLine from '../components/CommandLine.jsx';
import Terminal from '../components/Terminal.jsx';
import SetupButtons from '../components/SetupButtons';

function Dashboard() {
  const [verb, setVerb] = useState('');
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [currDir, setCurrDir] = useState('NONE SELECTED');
  const [userInput, setUserInput] = useState('');
  const [command, setCommand] = useState('');
  const [tool, setTool] = useState('');
  const [response, setResponse] = useState([]);

  // Flag list options
  const flagList = ['-o wide', '--force'];

  // Set flag list state
  const handleFlags = (event) => {
    const {
      target: { value },
    } = event;
    setFlags(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    );
  };

  // Set current directory state
  const handleUploadDirectory = (event) => {
    let path = event.target.files[0].path.split('');
    while (path[path.length - 1] !== '/') {
      path.pop();
    }
    let absPath = path.join('');
    console.log('path is ', absPath);
    setCurrDir(absPath);
  };

  // Set the command state based on current inputs
  useEffect(() => {
    let newCommand = '';
    if (tool !== '') newCommand += tool;
    if (verb !== '') newCommand += ' ' + verb;
    if (type !== '') newCommand += ' ' + type;
    if (name !== '') newCommand += ' ' + name;
    if (userInput !== '') newCommand += ' ' + userInput;
    setCommand(newCommand);
  });

  // Post the command to the server
  const postCommand = async (command, currDir) => {
    console.log('currDir', currDir);
    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: command, currDir: currDir }),
      });
      const cliResponse = await response.json();
      console.log('the server responded: ', cliResponse);
      return cliResponse;
    } catch (e) {
      console.log(e);
      setError(true);
    }
  };

  // Handle the command input submit event
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('enter button clicked');
    if (currDir === 'NONE SELECTED')
      return alert('Please choose working directory');
    console.log('command ', command);

    const getCliResponse = async () => {
      const cliResponse = await postCommand(command, currDir);
      // Filter for errors
      if (cliResponse.err) alert('Invalid command. Please try again');
      // Update response state with the returned CLI response
      else {
        const newResponseState = [
          ...response,
          { command: command, response: cliResponse },
        ];
        setResponse(newResponseState);
      }
    };

    // Invoke a fetch request to the server
    getCliResponse();
  };

  // Clear the input box
  const handleClear = (e) => {
    e.preventDefault();
    console.log('clear button clicked');
    setUserInput('');
  };

  // Command list options
  const commandList = [
    { label: 'get', year: 1994 },
    { label: 'apply', year: 1972 },
    { label: 'create', year: 1974 },
    { label: 'patch', year: 1974 },
    { label: 'logs', year: 1974 },
  ];

  // Type options
  const types = [
    { label: 'node' },
    { label: 'nodes' },
    { label: 'pod' },
    { label: 'pods' },
    { label: 'configmap' },
    { label: 'deployment' },
    { label: 'events' },
    { label: 'secret' },
    { label: 'service' },
    { label: 'services' },
  ];

  return (
    <>
      <Grid
        id='dashboard'
        container
        disableEqualOverflow='true'
        width={'100vw'}
        height={'95vh'}
        sx={{ pt: 3, pb: 3 }}
      >
        {/* ----------------SIDE BAR---------------- */}
        <SideNav spacing={2} />

        {/* ----------------MAIN CONTENT---------------- */}
        <Grid
          id='main-content'
          width='75%'
          height='95%'
          xs={10}
          // spacing={1}
          disableEqualOverflow='true'
          container
          direction='column'
          wrap='nowrap'
          justifyContent='space-around'
          alignItems='center'
        >
          {/* ----------------TERMINAL---------------- */}
          <Terminal response={response} />

          {/* ----------------BELOW TERMINAL---------------- */}
          <Grid
            id='below-terminal'
            container
            xs={4}
            height={'35%'}
            sx={{ pt: 1 }}
            justifyContent='center'
            alignItems='center'
            alignContent='space-between'
            width='100%'
          >

            {/* ----------------CHOOSE DIRECTORY---------------- */}
            <Grid
              id='directory'
              container
              width='100%'
              alignItems='flex-end'
              justifyContent='center'
              sx={{ borderBottom: 1 }}
            >
              <Grid id='directory-item' sx={{ pr: 2 }}>
                <p>WORKING DIRECTORY:</p>
              </Grid>
              <Grid id='directory-item' sx={{ pr: 2 }}>
                <p>{currDir}</p>
              </Grid>
              <Grid id='directory-item'>
                <Button
                  variant='contained'
                  component='label'
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #68617f',
                    width: '170px',
                    marginBottom: '10px',
                    fontSize: '9px',
                    letterSpacing: '1.5px',
                  }}
                >
                  CHOOSE DIRECTORY
                  <input
                    type='file'
                    directory=''
                    webkitdirectory=''
                    hidden
                    onChange={handleUploadDirectory}
                  />
                </Button>
              </Grid>
            </Grid>

            {/* ----------------INPUT BOXES---------------- */}
            <Grid
              id='inputs'
              container
              width='100%'
              justifyContent='space-around'
              alignItems='center'
            >
              <p>INPUTS:</p>
              <Grid id='kubectl' xs={2}>
                <Autocomplete
                  defaultValue={'kubectl'}
                  disablePortal
                  options={['kubectl']}
                  onInputChange={(e, newInputValue) => {
                    setTool(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label='kubectl' />
                  )}
                />
              </Grid>
              <Grid id='command' xs={2}>
                <Autocomplete
                  disablePortal
                  id='combo-box-demo'
                  options={commandList}
                  onInputChange={(e, newInputValue) => {
                    setVerb(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label='Commands' />
                  )}
                />
              </Grid>
              <Grid id='type' xs={2}>
                <Autocomplete
                  disablePortal
                  id='combo-box-demo'
                  options={types}
                  onInputChange={(e, newInputValue) => {
                    setType(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label='Types' />
                  )}
                />
              </Grid>
              <Grid id='name' xs={2}>
                <form
                  onChange={(e) => {
                    setName(e.target.value);
                    console.log(name);
                  }}
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                  value={name}
                >
                  <TextField
                    id='outlined-basic'
                    label='Name'
                    variant='outlined'
                  />
                </form>
              </Grid>
              <Grid id='flag' xs={2}>
                <FormControl>
                  <InputLabel id='demo-multiple-checkbox-label'>
                    Flags (optional)
                  </InputLabel>
                  <Select
                    labelId='demo-multiple-checkbox-label'
                    id='demo-multiple-checkbox'
                    multiple
                    value={flagList}
                    onChange={handleFlags}
                    input={<OutlinedInput label='Flags (optional)' />}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {flagList.map((name) => (
                      <MenuItem key={name} value={name}>
                        <Checkbox checked={flagList.indexOf(name) > -1} />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* ----------------COMMAND LINE---------------- */}
            <CommandLine
              width='100%'
              handleSubmit={handleSubmit}
              postCommand={postCommand}
              setUserInput={setUserInput}
              userInput={userInput}
              command={command}
              handleClear={handleClear}
            />
            
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default Dashboard;
