import { AppBar, Box, Container, Toolbar, Typography, Stack, Chip, TextField, Snackbar } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid'
import { useEffect, useState, useRef } from 'react';
import RecordDrawer from './RecordDrawer';

const speciesGroupChipMapping = {
  // available colours: default primary secondary error info success warning
  "Animals": "primary",
  "Mammals": "success",
  "Birds": "error",
  "Amphibians": "info",
  "Reptiles": "error",
  "Insects": "secondary",
  "Arthropods": "success",
  "Crustaceans": "warning",
  "Fishes": "info",
  "Plants": "success",
  "Angiosperms": "error", 
  "Gymnosperms": "warning",
  "Dicots": "secondary",
  "Monocots": "secondary",
  "Fungi": "info"
}

const columns = [
  {
    field: 'uuid', 
    headerName: 'ID', 
    width: 70,
    sortable: false,
    valueGetter: ({ value }) => ".." + value.slice(-4)
  },
  { field: "scientificName",
    headerName: "Scientific Name",
    minWidth: 200,
    renderCell: (params) => (
      <span key={params.value}>
        { params.value.trim().split(/\s+/).length > 1 ? <em>{params.value}</em> : params.value }
      </span>
    )
  },
  { field: "vernacularName",
    headerName: "Vernacular Name",
    width: 180
  },
  { field: "speciesGroups",
    headerName: "Species Groups",
    width: 240,
    sortable: false,
    // valueGetter: ({ value }) => value.join(" | ")
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        { params.value.map( (sg) => 
          <Chip label={sg} color={sg in speciesGroupChipMapping ? speciesGroupChipMapping[sg] : "default" } size="small" variant="outlined" key={sg}/>
        )}
      </Stack>
    )
  },
  { field: "dataResourceName",
    headerName: "DataResource",
    width: 170
  },
  { field: "stateProvince",
    headerName: "State/Territory",
    width: 165  
  },
  {
    field: "eventDate",
    headerName: "Event Date",
    type: 'dateTime',
    valueGetter: ({ value }) => value && new Date(value).toISOString().substring(0,10),
    width: 120
  }
]

function Search() {
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    sort: "score",
    order: "desc",
    query: "*:*"
  });

  const [recordState, setRecordState] = useState({
    isLoading: false,
    data: [],
    uuid: ''
  });

  const [drawerState, setDrawerState] = useState(false);
  const [snackState, setSnackState] = useState(false);

  useEffect(() => {
    if (recordState.uuid) {
      const fetchRecord = async () => {
        //console.log('updateRecordData ON');
        setRecordState(old => ({ ...old, isLoading: true }));
        const resp = await fetch(`https://biocache-ws.ala.org.au/ws/occurrences/${recordState.uuid}`);
        const json1 = await resp.json();
        setRecordState(old => ({ ...old, isLoading: false, data: json1 }));
        setDrawerState(true);
      }
      fetchRecord()
    }
  }, [recordState.uuid ]);

  useEffect(() => {
    const fetchData = async () => {
      //console.log('fetchData ON');
      setPageState(old => ({ ...old, isLoading: true }));
      const startIndex = (pageState.page * pageState.pageSize) - pageState.pageSize;
      const response = await fetch(`https://biocache-ws.ala.org.au/ws/occurrences/search?q=${pageState.query}&fq=country:Australia&pageSize=${pageState.pageSize}&start=${startIndex}&sort=${pageState.sort}&dir=${pageState.order}`);
      const json = await response.json();
      setPageState(old => ({ ...old, isLoading: false, data: json.occurrences, total: json.totalRecords }));
    }
    fetchData()
  }, [pageState.page, pageState.pageSize, pageState.sort, pageState.order, pageState.query]);

  const searchKeyPress = (e) => {
    if (e.key === "Enter") {
      console.log('Input value', e.target.value);
      setPageState(old => ({ ...old, query: e.target.value }));
      datagridRef.current.focus()
      e.preventDefault();
    }
  }

  const rowClicked = (e) => {
    //console.log("row was clicked - UUID =", e.id);
    setRecordState(old => ({ ...old, uuid: e.id }));
  }

  const toggleDrawer = () => {
    console.log("toggleDrawer", drawerState);
    drawerState && setRecordState(old => ({ ...old, uuid: "" })); // so clicking on same record makeas drawer open
    setDrawerState(!drawerState);
  }

  const stepRecord = (uuid, direction) => {
    console.log("stepRecord", uuid, direction);
    if (uuid && direction) {
      const uuidList = pageState.data.map(it => it.uuid);
      console.log("uuidList", uuidList);
      const uuidPosition = uuidList.indexOf(uuid);
      const newUuidPosition = (direction === 'next') ? uuidPosition + 1 : uuidPosition - 1;
      if (uuidList[newUuidPosition] !== undefined) {
        setRecordState(old => ({ ...old, uuid: uuidList[newUuidPosition] }));
      } else {
        console.log("First or last record reached");
        setSnackState(true);
      }
    }
  }

  const handleSnackClose = () => {
    setSnackState(false);
  };

  const datagridRef = useRef(null);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar>
        <Toolbar>
          <Typography variant="h5" component="div">
            Biocache React Demo
          </Typography>
        </Toolbar>
      </AppBar>
      <Container style={{ marginTop: 65, marginBottom: 50  }} maxWidth="lg">
        <RecordDrawer drawerState={drawerState} toggleDrawer={toggleDrawer} recordState={recordState} stepRecord={stepRecord} />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={snackState}
          onClose={handleSnackClose}
          message="No more records to show"
        />
        <Box
          sx={{
          // width: 500,
            margin: '15px 0',
            maxWidth: '100%',
            backgroundColor: 'white'
          }} >
          <TextField 
            fullWidth 
            label="search" 
            id="fullWidth"
            onKeyPress={searchKeyPress} 
          />
        </Box>
        
        <DataGrid
          autoHeight
          ref={datagridRef}
          style={{ backgroundColor: 'white' }}
          getRowId={(row) => row.uuid}
          rows={pageState.data}
          rowCount={pageState.total}
          loading={pageState.isLoading}
          rowsPerPageOptions={[10, 20, 50, 70, 100]}
          pagination
          page={pageState.page - 1}
          pageSize={pageState.pageSize}
          paginationMode="server"
          onPageChange={(newPage) => {
            setPageState(old => ({ ...old, page: newPage + 1 }))
          }}
          onPageSizeChange={(newPageSize) => setPageState(old => ({ ...old, pageSize: newPageSize }))}
          sortingMode="server"
          onSortModelChange={(sortModel) => {
            console.log("onSortModelChange", sortModel);
            setPageState(old => ({ ...old, sort: sortModel[0].field, order: sortModel[0].sort}))
          }}
          columns={columns}
          onRowClick={rowClicked}
          isRowSelectable={(params) => false}
          isColumnSelectable={(params) => false}
        />
      </Container>
    </Box>
  );
}

export default Search;
