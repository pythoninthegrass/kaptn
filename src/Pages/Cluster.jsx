import React, { useState, useEffect } from 'react';
import SideNav from '../components/Sidebar';
import Grid from '@mui/system/Unstable_Grid';
import SetupButtons from '../components/SetupButtons';
import Button from '@mui/material/Button';

function Cluster(apiKey) {
  const [uid, setUid] = useState();
  const now = new Date().getTime();
  const from = new Date(now - 60 * 60 * 1000).getTime();


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
        {/* <iframe
        className="frame"
        src={url}
        width="100%"
        height="100%"
        title="embed cluster"
      ></iframe> */}
        <SideNav />
        <SetupButtons />
      </Grid>
    </>
  );
}

export default Cluster;
