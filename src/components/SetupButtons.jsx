import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';

function SetupButtons() {
  const [key, setKey] = useState('');
  const [uid, setUid] = useState('');
  const now = new Date().getTime();
  const from = new Date(now - 60 * 60 * 1000).getTime();

  const handleClick = () => {
    fetch('/prom-graf-setup/promsetup').then((res) => console.log(res));
  };

  const handleGrafClick = () => {
    fetch('/prom-graf-setup/grafana').then((res) => console.log(res));
  };

  const handleForwardPort = () => {
    fetch('/prom-graf-setup/forwardports').then((res) => console.log(res));
  };

  const handleCluster = () => {
    fetch('/api/key')
      .then((res) => res.json())
      .then((data) => setKey(data));

    fetch('/api/uid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: key,
        dashboard: 'Kubernetes / API server',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setUid(data)});
     
  };

  const url = `http://localhost:3000/d/${uid}/kubernetes-api-server?orgId=1&refresh=10s&from=${from}&to=${now}&kiosk=true`

  return (
    <>
    <Box className = 'main-container'>
    <Box
        className='button-container'
        sx={{ display: 'flex', justifyContent: 'space-between', width: '92%', outline:'1px red solid' }}
      >
        <Box>
          <Typography>
            {' '}
            1. Neet to set up Prometheus in your cluster?{' '}
          </Typography>
          <Button onClick={handleClick}> Set up Prometheus </Button>
        </Box>

        <Box>
          <Typography> 2. Need to set up Grafana in your cluster? </Typography>
          <Button onClick={handleGrafClick}>Set up Grafana</Button>
        </Box>

        <Box>
          <Typography> 3. Need to forward ports to see metrics? </Typography>
          <Button onClick={handleForwardPort}>Start port forwarding...</Button>
        </Box>

        <Box>
          <Typography> 4. Show me my cluster </Typography>
          <Button onClick={handleCluster}>cluster time</Button>
        </Box>
       
      </Box>
    </Box>
    <iframe
      className='frame'
      src={url}
      width="90%"
      height="100%"
      title="embed cluster"

    ></iframe>
      
      
    </>
  );
}

export default SetupButtons;
