import { AppBar, Box, Container, Toolbar, Typography, Stack, Chip, TextField, Snackbar, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DataGrid } from '@mui/x-data-grid'
import { Fragment, useEffect, useState, useRef } from 'react';
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
    field: 'dynamicProperties_ncbi_assembly_accession', 
    headerName: 'NCBI Accession', 
    width: 150,
    sortable: false,
    //valueGetter: ({ value }) => ".." + value?.slice(-4)
  },
  { field: "scientificName",
    headerName: "Scientific Name",
    minWidth: 220,
    renderCell: (params) => (
      <span key={params.value}>
        { params.value?.trim().split(/\s+/).length > 1 ? <em>{params.value}</em> : params.value }
      </span>
    )
  },
  { field: "vernacularName",
    headerName: "Vernacular Name",
    width: 160
  },
  { field: "speciesGroup",
    headerName: "Species Groups",
    width: 200,
    sortable: false,
    // valueGetter: ({ value }) => value.join(" | ")
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        { params.value?.map( (sg) => 
          <Chip label={sg} color={sg in speciesGroupChipMapping ? speciesGroupChipMapping[sg] : "default" } size="small" variant="outlined" key={sg}/>
        )}
      </Stack>
    )
  },
  { field: "dynamicProperties_ncbi_refseq_category",
    headerName: "RefSeq Category",
    width: 170
  },
  { field: "dynamicProperties_ncbi_genome_rep",
    headerName: "Genome Representation",
    width: 120  
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
    id: ''
  });

  const [drawerState, setDrawerState] = useState(false);
  const [snackState, setSnackState] = useState(false);

  //const serverUrlPrefix = "https://biocache-ws.ala.org.au/ws/occurrences";
  const serverUrlPrefix = "http://localhost:8983/solr/biocache";

  useEffect(() => {
    if (recordState.id) {
      const fetchRecord = async () => {
        //console.log('updateRecordData ON');
        setRecordState(old => ({ ...old, isLoading: true }));
        const resp = await fetch(`${serverUrlPrefix}/select?q=id:${recordState.id}`);
        const json = await resp.json();
        setRecordState(old => ({ ...old, isLoading: false, data: json.response?.docs[0] }));
        setDrawerState(true);
      }
      fetchRecord()
    }
  }, [recordState.id ]);

  useEffect(() => {
    const fetchData = async () => {
      //console.log('fetchData ON');
      setPageState(old => ({ ...old, isLoading: true }));
      const startIndex = (pageState.page * pageState.pageSize) - pageState.pageSize;
      const response = await fetch(`${serverUrlPrefix}/select?q=${pageState.query}&fq=&rows=${pageState.pageSize}&start=${startIndex}&sort=${pageState.sort}+${pageState.order}`);
      const json = await response.json();
      setPageState(old => ({ ...old, isLoading: false, data: json.response.docs, total: json.response.numFound }));
    }
    fetchData()
  }, [pageState.page, pageState.pageSize, pageState.sort, pageState.order, pageState.query]);

  const searchKeyPress = (e) => {
    if (e.key === "Enter") {
      console.log('Input value', e.target.value);
      setPageState(old => ({ ...old, query: e.target.value, page: 1 }));
      datagridRef.current.focus()
      e.preventDefault();
    }
  }

  const rowClicked = (e) => {
    //console.log("row was clicked - id =", e.id);
    setRecordState(old => ({ ...old, id: e.id }));
  }

  const toggleDrawer = () => {
    console.log("toggleDrawer", drawerState);
    drawerState && setRecordState(old => ({ ...old, id: "" })); // so clicking on same record makeas drawer open
    setDrawerState(!drawerState);
  }

  const stepRecord = (id, direction) => {
    console.log("stepRecord", id, direction);
    if (id && direction) {
      const idList = pageState.data.map(it => it.id);
      console.log("idList", idList);
      const idPosition = idList.indexOf(id);
      const newidPosition = (direction === 'next') ? idPosition + 1 : idPosition - 1;
      if (idList[newidPosition] !== undefined) {
        setRecordState(old => ({ ...old, id: idList[newidPosition] }));
      } else {
        console.log("First or last record reached");
        setSnackState(true);
      }
    }
  }

  const handleSnackClose = () => {
    setSnackState(false);
  };

  const snackbarAction = (
    <Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleSnackClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Fragment>
  );

  const datagridRef = useRef(null);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar>
        <Toolbar>
          <Typography variant="h5" component="div">
            ARGA React Demo
          </Typography>
        </Toolbar>
      </AppBar>
      <Container style={{ marginTop: 65, marginBottom: 50  }} maxWidth="lg">
        <RecordDrawer drawerState={drawerState} toggleDrawer={toggleDrawer} recordState={recordState} stepRecord={stepRecord} />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={snackState}
          onClose={handleSnackClose}
          autoHideDuration={4000}
          action={snackbarAction}
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
          rowHeight={40}
          ref={datagridRef}
          style={{ backgroundColor: 'white' }}
          //getRowId={(row) => row.id}
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
            setPageState(old => ({ ...old, sort: sortModel[0]?.field || 'score', order: sortModel[0]?.sort || 'desc', page: 1}))
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
