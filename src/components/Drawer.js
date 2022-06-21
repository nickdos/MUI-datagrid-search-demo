import * as React from 'react';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Divider from '@mui/material/Divider';

export default function SwipeableTemporaryDrawer({ drawerState, toggleDrawer, recordState }) {

  const anchor = "right";

  return (
    <div>
      <React.Fragment key={anchor}>
        <SwipeableDrawer
              anchor={anchor}
              open={drawerState}
              onClose={toggleDrawer}
              onOpen={toggleDrawer} >
            <Box
                sx={{ width: "50%", margin: "10px" }}
                role="presentation"
                spacing={2}
            //onClick={toggleDrawer}
            //onKeyDown={toggleDrawer}
            >
                <h3>Ocurrence Record {recordState}</h3>
                <Divider />
                <div>Record details go here</div>
            </Box>
        </SwipeableDrawer>
      </React.Fragment>
    </div>
  );
}
