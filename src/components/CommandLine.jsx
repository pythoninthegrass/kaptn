import { InputAdornment, Button, TextField } from '@mui/material';

const CommandLine = (props) => {
  // Add/remove functionality in text box
  const handleChange = (e) => {
    let newUserInput = '';
    if (e.nativeEvent.inputType === 'deleteContentBackward') {
      newUserInput = props.userInput.slice(0, props.userInput.length - 1);
    } else {
      newUserInput =
        props.userInput + e.target.value[e.target.value.length - 1];
    }
    props.setUserInput(newUserInput);
  };

  return (
    <div>
      <form
        onSubmit={props.handleSubmit}
        onChange={(e) => {
          handleChange(e);
        }}
        value={props.command}
      >
        <TextField
          id='outlined-start-adornment'
          sx={{ m: 0, width: '60ch' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>$ </InputAdornment>
            ),
          }}
          value={props.command}
        />
        <Button type='submit' variant='contained'>
          Run
        </Button>
        <Button
          variant='contained'
          onSubmit={(e) => {
            props.command = '';
          }}
        >
          Clear
        </Button>
      </form>
    </div>
  );
};

export default CommandLine;
