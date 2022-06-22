import * as React from 'react';
import { Table, TableBody, TableRow, TableCell, Collapse, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import startCase from "lodash/startCase";

function getFieldValue(field, data) {
  let value = findValueForKey(data.processed, field) || findValueForKey(data.raw, field) || "";

  if (typeof value === 'object' && Object.keys(value).length === 0) {
    value = "";
  } else if (typeof value === 'object') {
    value = JSON.stringify(value);
  } else if (typeof value === 'boolean') {
    value = value.toString();
  } 

  return value;
}

/**
 * Do a deep search for a key in a nested object (JSON doc)
 * 
 * @param {*} obj - nested object
 * @param {*} key = key to find value of (first instance found is returned)
 * @returns value for provided key
 */
function findValueForKey(obj, key) {
  let value = "";

  for (let k in obj) {
    if (k === key) {
      value = obj[k];
    } else if (!value && typeof obj[k] === 'object') {
      value = findValueForKey(obj[k], key);
    }
  }

  return value
}

export default function RecordSection({recordData, section, fieldList}) {
  const [open, setOpen] = React.useState(true);

  return (
    <React.Fragment key="section">
      <TableRow sx={{  backgroundColor: "rgb(240, 240, 240)" }} onClick={() => setOpen(!open)}>
        <TableCell style={{ width: "80%", paddingBottom: 4, paddingTop: 4}}>
          <Typography variant="h6" component="p" style={{fontSize:"1.1em"}}>
            {section}
          </Typography>
        </TableCell>
        <TableCell align="right" style={{ width: "10%", paddingBottom: 4, paddingTop: 4 }}>
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: 0 }} colSpan={2}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Table aria-label="collapsible table">
              <TableBody>
              { fieldList.map((field) => (
                 getFieldValue(field, recordData) ? 
                  (<TableRow key={field} >
                    <TableCell style={{ width: "30%", padding: 5, paddingLeft: 16, verticalAlign: 'top', opacity: 0.8 }} colSpan={6}>{startCase(field)}</TableCell>
                    <TableCell style={{ width: "70%", padding: 5, paddingLeft: 16, verticalAlign: 'top' }} colSpan={6}>{getFieldValue(field, recordData)}</TableCell>
                  </TableRow>) : null
                 ))}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}