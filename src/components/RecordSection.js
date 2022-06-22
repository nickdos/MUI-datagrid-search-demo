import * as React from 'react';
import { TableContainer, Table, TableBody, TableRow, TableCell, Paper } from '@mui/material';

function getFieldValue(field, data) {
  let value = "foo bar";
  let realValue = findValueForKey(data.processed, field) || findValueForKey(data.raw, field) || "N/A";
  console.log("realValue", realValue);
  return realValue.toString();
}

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


export default function RecordSection({recordData, fieldList}) {
  console.log("recordData", recordData, fieldList);
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableBody>
        {fieldList.map((field) => (
          <TableRow key={field}>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>{field}</TableCell>
            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>{getFieldValue(field, recordData)}</TableCell>
          </TableRow>
        ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}