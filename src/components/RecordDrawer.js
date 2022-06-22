import * as React from 'react';
import { SwipeableDrawer, Typography, Divider, Paper, List, ListItem, ListItemIcon, ListItemText, TableContainer, Table, TableBody, TableRow, TableCell } from '@mui/material';
import { TravelExploreOutlined, ExpandMore, ExpandLess } from '@mui/icons-material/';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
//import RecordAccordion from './RecordAccordion';
import RecordSection from './RecordSection';

export default function RecordDrawer({ drawerState, toggleDrawer, recordState }) {
  const [open, setOpen] = React.useState(true);
  
  const handleClick = () => {
    setOpen(!open);
  };

  const anchor = "right";
  const fieldListMap = {
    "Summary": ["scientificName","dataResourceName", "basisOfRecord"],
    "Record": ["institutionName","collectionName", "dataResourceName", "basisOfRecord", "miscProperties"],
    "Taxon": ["scientificName", "scientificNameAuthorship", "vernacularName", "taxonConceptID", "kingdom", "phylum", "class", "order", "family", "genus", "matchType" ],
    "Location": ["country", "countryCode", "stateProvince", "locality", "decimalLatitude", "decimalLongitude", "geodeticDatum"],
    "Occurrence": ["occurrenceID", "institutionCode", "collectionCode", "catalogNumber", "recordNumber", "basisOfRecord", "preparations", "recordedBy", "reproductiveCondition", "occurrenceStatus"],
    "Event": ["eventDate", "datePrecision"],
    "Other": ["license", "lastModifiedTime", "provenance", "geospatiallyKosher" ]
  };

  return (
      <React.Fragment key={anchor}>
        <SwipeableDrawer 
          anchor={anchor}
          open={drawerState}
          onClose={toggleDrawer}
          onOpen={toggleDrawer}
        >
          <List sx={{ width: '100%', maxWidth: 600, bgcolor: 'background.paper' }}>
            <ListItem alignItems="flex-start">
              <ListItemIcon>
                <TravelExploreOutlined fontSize="large"/>
              </ListItemIcon>
              <ListItemText
                primary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="h6"
                      color="text.primary"
                    >
                      Occurrence Record 
                    </Typography>
                  </React.Fragment>
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="p"
                      color="text.primary"
                    >
                      {recordState.uuid} 
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
            <Divider variant="" component="" />
            <Paper sx={{ width: '100%' }}>
              <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                  <TableBody>
                    { Object.keys(fieldListMap).map((section) => (
                      <RecordSection key={section} recordData={recordState.data} section={section} fieldList={fieldListMap[section]}/>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </List>
        </SwipeableDrawer>
      </React.Fragment>
  );
}
