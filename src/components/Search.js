import { AppBar, Box, Container, Toolbar, Typography, Stack, Chip, TextField, Snackbar, IconButton, SvgIcon } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DataGrid } from '@mui/x-data-grid'
import { Fragment, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
// import ArgaLogo from './ArgaLogo';
import logo from "../ARGA-logo-notext.png";
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

const columnsDefinitions = (fqUpdate) => {
  const columns = [
    {
      field: 'id',
      headerName: "ID",
      width: 100,
      sortable: false
    },
    {
      field: 'dynamicProperties_ncbi_assembly_accession', 
      headerName: 'NCBI Accession', 
      width: 145,
      sortable: false,
      //valueGetter: ({ value }) => ".." + value?.slice(-4)
    },
    { field: "raw_scientificName",
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
      width: 250,
      sortable: false,
      // valueGetter: ({ value }) => value.join(" | ")
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          { params.value?.map( (grp) => 
            <Chip 
              key={grp}
              label={grp} 
              color={grp in speciesGroupChipMapping ? speciesGroupChipMapping[grp] : "default" } 
              data-fieldname="speciesGroup"
              onClick={fqUpdate}
              size="small" 
              variant="outlined"
            />
          )}
        </Stack>
      )
    },
    { field: "dynamicProperties_ncbi_refseq_category",
      headerName: "RefSeq Category",
      width: 120
    },
    { field: "dynamicProperties_ncbi_genome_rep",
      headerName: "Genome Representation",
      width: 100  
    },
    {
      field: "eventDate",
      headerName: "Event Date",
      type: 'dateTime',
      valueGetter: ({ value }) => value && new Date(value).toISOString().substring(0,10),
      width: 120
    }
  ]

  return columns
}

function Search() {
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
    sort: "score",
    order: "desc",
    q: "",
    fq: ""
  });

  const [recordState, setRecordState] = useState({
    isLoading: false,
    data: [],
    id: ''
  });

  const [drawerState, setDrawerState] = useState(false);
  const [snackState, setSnackState] = useState(false);

 // const { search } = useLocation();
  const [searchParams] = useSearchParams();

  const serverUrlPrefix = "http://localhost:8080/solr/biocache";

  const fqUpdate = (e) => {
    //console.log("fqUpdate", e.currentTarget, e.currentTarget.getAttribute('data-fieldname'))
    const fq = `${e.currentTarget.getAttribute('data-fieldname')}:${e.target.textContent}`;
    setPageState(old => ({ ...old, fq: fq, page: 1 }));
    e.stopPropagation();
    e.preventDefault();
  }

  const columns = columnsDefinitions(fqUpdate)
  const columnDataFields = columns.map((el) => el.field)
  console.log("columnDataFields", columnDataFields);

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
  }, [ recordState.id ]);

  useEffect(() => {
    const fetchData = async () => {
      //console.log('fetchData ON');
      setPageState(old => ({ ...old, isLoading: true }));
      const startIndex = (pageState.page * pageState.pageSize) - pageState.pageSize;
      const response = await fetch(`${serverUrlPrefix}/select?q=${pageState.q || '*:*'}&fq=${pageState.fq}&fl=${columnDataFields.join(',')}&rows=${pageState.pageSize}&start=${startIndex}&sort=${pageState.sort}+${pageState.order}`);
      const json = await response.json();
      setPageState(old => ({ ...old, isLoading: false, data: json.response.docs, total: json.response.numFound }));
    }
    fetchData()
  }, [ pageState.page, pageState.pageSize, pageState.sort, pageState.order, pageState.q, pageState.fq ]);

  useEffect(() => {
    if (searchParams.get('q')) {

      setPageState(old => ({ ...old, q: searchParams.get('q') }));
    }
  }, [searchParams]);

  const searchKeyPress = (e) => {
    if (e.key === "Enter") {
      //console.log('Input value', e.target.value);
      setPageState(old => ({ ...old, q: e.target.value, fq:'', page: 1 }));
      datagridRef.current.focus()
      e.preventDefault();
    }
  }

  const rowClicked = (e) => {
    //console.log("row was clicked - id =",e.id, e.target, e.currentTarget);
    setRecordState(old => ({ ...old, id: e.id }));
  }

  const toggleDrawer = () => {
    //console.log("toggleDrawer", drawerState);
    drawerState && setRecordState(old => ({ ...old, id: "" })); // so clicking on same record makeas drawer open
    setDrawerState(!drawerState);
  }

  const stepRecord = (id, direction) => {
    //console.log("stepRecord", id, direction);
    if (id && direction) {
      const idList = pageState.data.map(it => it.id);
      //console.log("idList", idList);
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
        <Toolbar sx={{ height: 80, fontFamily: "Arial" }}>
          {/* <SvgIcon style={{ height: 90, width: 282 }}> //  transform: 'scale(2.5)'
            <ArgaLogo />
          </SvgIcon> */}
          <img src={logo} alt="ARGA logo" style={{ height: 70, marginRight: 10  }} />
          <Typography variant="span" sx={{ fontSize: "15px", lineHeight: '16px', marginRight: 5 }} >Australian<br/>Reference<br/>Genome<br/>Atlas</Typography>
          <Typography variant="h5"  sx={{ fontWeight: 600 }}>
            React Demo
          </Typography>
        </Toolbar>
      </AppBar>
      <Container style={{ marginTop: 75, marginBottom: 50  }} maxWidth="lg">
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
            value={pageState.q}
            onChange={e => setPageState(old => ({ ...old, q: e.target.value, fq:'', page: 1 })) }   //(e.target.value)}
            //onKeyPress={searchKeyPress} 
          />
        </Box>
        
        <DataGrid
          autoHeight
          disableSelectionOnClick
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
          columnVisibilityModel={{ id: false }}
          onRowClick={rowClicked}
          //onSelectionModelChange={(ids) => { console.log("ids", ids, "e", e) }}
          //isRowSelectable={(params) => false}
          isColumnSelectable={(params) => {console.log("isColumnSelectable", params)}}
        />
      </Container>
    </Box>
  );
}

export default Search;
