import * as React from 'react';
import { SwipeableDrawer, Typography, Divider, Box, Grid, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Collapse } from '@mui/material';
import { TravelExploreOutlined, ExpandMore, ExpandLess } from '@mui/icons-material/';
import RecordAccordion from './RecordAccordion';
import RecordSection from './RecordSection';

export default function RecordDrawer({ drawerState, toggleDrawer, recordState }) {
  const [open, setOpen] = React.useState(true);
  console.log("RecordDrawer -> recordState", recordState);
  
  const handleClick = () => {
    setOpen(!open);
  };

  const anchor = "right";
  const fieldListMap = {
    "Summary": ["scientificName","dataResourceName", "basisOfRecord"],
    "Record": ["institutionName","collectionName", "dataResourceName", "basisOfRecord", "miscProperties"],
    "Taxon": ["scientificName", "scientificNameAuthorship" ,"taxonConceptID", "classificationObj", "kingdom","phylum","class", "order", "family", "genus", "matchType" ],
    "Location": ["country", "countryCode", "stateProvinve", "basislocalityOfRecord", "decimalLatitude", "decimalLongitude", "geodeticDatum"],
    "Occurrence": ["occurrenceID", "institutionCode", "collectionCode", "catalogNumber", "recordNumber", "preparations", "recordedBy"]
  };

  return (
    <div>
      <React.Fragment key={anchor}>
        <SwipeableDrawer
          anchor={anchor}
          open={drawerState}
          onClose={toggleDrawer}
          onOpen={toggleDrawer}
        >
          <List sx={{ width: '100%', maxWidth: 900, bgcolor: 'background.paper' }}>
            <ListItem alignItems="flex-start">
              <ListItemIcon>
                <TravelExploreOutlined />
              </ListItemIcon>
              <ListItemText
                primary="Occurrence Record"
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body"
                      color="text.primary"
                    >
                      {recordState.uuid} 
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
            <Divider variant="" component="" />
            { Object.keys(fieldListMap).map((section) => (
              <React.Fragment key={section}>
                <ListItemButton onClick={handleClick} >
                  <ListItemIcon>{open ? <ExpandLess /> : <ExpandMore />}</ListItemIcon>
                  <ListItemText>{section}</ListItemText>
                </ListItemButton>
                <Collapse in={open} timeout="auto" unmountOnExit>
                  {/* <Typography>{fieldListMap[section].join("|")}</Typography> */}
                  <RecordSection recordData={recordState.data} fieldList={fieldListMap[section]}/>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
        </SwipeableDrawer>
      </React.Fragment>
    </div>
  );
}
