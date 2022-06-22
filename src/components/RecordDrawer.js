import * as React from 'react';
import { SwipeableDrawer, Typography, Divider, Paper, List, ListItem, ListItemIcon, ListItemText, TableContainer, Table, TableBody } from '@mui/material';
import { TravelExploreOutlined } from '@mui/icons-material/';
import useMediaQuery from '@mui/material/useMediaQuery';
import theme from './theme';
import RecordSection from './RecordSection';

export default function RecordDrawer({ drawerState, toggleDrawer, recordState }) {

  const fieldListMap = {
    "Summary":    ["scientificName","dataResourceName", "basisOfRecord"],
    "Record":     ["institutionName","collectionName", "dataResourceName", "basisOfRecord", "miscProperties"],
    "Taxon":      ["scientificName", "scientificNameAuthorship", "vernacularName", "taxonConceptID", "kingdom", 
                   "phylum", "class", "order", "family", "genus", "matchType" ],
    "Location":   ["country", "countryCode", "stateProvince", "locality", "decimalLatitude", "decimalLongitude", 
                   "geodeticDatum"],
    "Occurrence": ["occurrenceID", "institutionCode", "collectionCode", "catalogNumber", "recordNumber", 
                   "basisOfRecord", "preparations", "recordedBy", "reproductiveCondition", "occurrenceStatus"],
    "Event":      ["eventDate", "datePrecision"],
    "Other":      ["license", "lastModifiedTime", "provenance", "geospatiallyKosher" ]
  };
  const anchor = "right";
  const largeScreen = useMediaQuery(theme.breakpoints.up("sm"))

  return (
      <React.Fragment key={anchor}>
        <SwipeableDrawer 
          PaperProps={largeScreen ? {
            sx: {
                width: 600,
            }
          } : {
              sx: {
                  width: "95%",
              }
          }}
          anchor={anchor}
          open={drawerState}
          onClose={toggleDrawer}
          onOpen={toggleDrawer}
        >
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
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
