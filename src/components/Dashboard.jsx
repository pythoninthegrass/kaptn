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
  IconButton
} from '@mui/material';
import { styled } from '@mui/system';
import Grid from '@mui/system/Unstable_Grid';

import SideNav from './Sidebar';
import CommandLine from './CommandInput.jsx';
import Terminal from './Terminal.jsx';
import Topbar from './Topbar';
import { ColorModeContext, useMode } from '../theme';

import OutlinedInput from '@mui/material/OutlinedInput';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { CssBaseline, ThemeProvider } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';


function Dashboard() {
  const [verb, setVerb] = React.useState('');
  const [type, setType] = React.useState('');
  const [name, setName] = React.useState('');
  const [currDir, setCurrDir] = React.useState('NONE SELECTED');
  const [userInput, setUserInput] = React.useState('');
  const [command, setCommand] = useState('');
  const [tool, setTool] = useState('');
  const [response, setResponse] = useState([]);
  const [theme, colorMode] = useMode();


  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const flagList = ['-o wide', '--force'];

  const handleFlags = (event) => {
    const {
      target: { value },
    } = event;
    setFlags(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    );
  };

  const MyTextField = styled(TextField)({
    color: '#edeaea',
    height: '56px',
    borderRadius: 4,
  });

  const handleUploadDirectory = (event) => {
    let path = event.target.files[0].path.split('');
    while (path[path.length - 1] !== '/') {
      path.pop();
    }
    let absPath = path.join('');
    console.log('path is ', absPath);
    setCurrDir(absPath);
  };

  // Set the correct command based on current inputs
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

  // Handle the CLI submit event
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

  const handleClear = (e) => {
    e.preventDefault();
    console.log('clear button clicked');
    console.log('command ', command);
    setUserInput('');
  };

  const commandList = [
    { label: 'get', year: 1994 },
    { label: 'apply', year: 1972 },
    { label: 'create', year: 1974 },
    { label: 'patch', year: 1974 },
    { label: 'logs', year: 1974 },
  ];

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
        {/* ----------------TERMINAL---------------- */}

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
          <Terminal response={response} />

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
              {/* ------------- TYPE drop down text field -------------------- */}
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
              {/* ---------------------------- FLAGS -------------------------------- */}
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
                    MenuProps={MenuProps}
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
