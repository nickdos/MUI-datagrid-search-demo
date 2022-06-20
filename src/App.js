import { AppBar, Box, Container, Toolbar, Typography, Stack, Chip, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import './App.css';

const speciesGroupChipMapping = {
  // colours: default primary secondary error info success warning
  "Animals": "primary",
  "Mammals": "success",
  "Birds": "success",
  "Amphibians": "info",
  "Reptiles": "error",
  "Insects": "secondary",
  "Arthropods": "success",
  "Crustaceans": "warning",
  "Fishes": "info",
  "Plants": "danger",
  "Angiosperms": "success", 
  "Gymnosperms": "warning",
  "Dicots": "secondary",
  "Monocots": "secondary",
  "Fungi": "info"
}
const columns = [
  {
    field: 'uuid', 
    headerName: 'Record ID', 
    minWidth: 80,
    valueGetter: ({ value }) => value.slice(-8)
  },
  { field: "scientificName",
    headerName: "Scientific Name",
    minWidth: 200,
    renderCell: (params) => (
      params.value.trim().split(/\s+/).length > 1 ? <em>{params.value}</em> : params.value 
      //<em>{params.value}</em>
    )
  },
  { field: "vernacularName",
    headerName: "Vernacular Name",
    width: 180
  },
  { field: "speciesGroups",
    headerName: "Species Groups",
    width: 270,
    // valueGetter: ({ value }) => value.join(" | ")
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        { params.value.map( (sg) => 
          <Chip label={sg} color={speciesGroupChipMapping[sg]} size="small" variant="outlined" />
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
    width: 175
  },
  {
    field: "eventDate",
    headerName: "Event Date",
    type: 'dateTime',
    valueGetter: ({ value }) => value && new Date(value).toISOString().substring(0,10),
    width: 150
  }
]

function App() {
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    sort: "score",
    order: "desc",
    query: "*:*"
  })

  useEffect(() => {
    const fetchData = async () => {
      console.log('ON');
      setPageState(old => ({ ...old, isLoading: true }));
      const startIndex = (pageState.page * pageState.pageSize) - pageState.pageSize;
      const response = await fetch(`https://biocache-ws.ala.org.au/ws/occurrences/search?q=${pageState.query}&pageSize=${pageState.pageSize}&start=${startIndex}&sort=${pageState.sort}&order=${pageState.order}`);
      const json = await response.json();
      setPageState(old => ({ ...old, isLoading: false, data: json.occurrences, total: json.totalRecords }));
    }
    fetchData()
  }, [pageState.page, pageState.pageSize, pageState.sort, pageState.order, pageState.query]);

  const searchKeyPress = (e) => {
    if (e.key === "Enter") {
      console.log('Input value', e.target.value);
      setPageState(old => ({ ...old, query: e.target.value }));
      e.preventDefault();
    }
  }

  return <Box>
    <AppBar>
      <Toolbar>
        <Typography variant="h5" component="div">
          Biocache React Demo
        </Typography>
      </Toolbar>
    </AppBar>
    <Container style={{ marginTop: 100, marginBottom: 100 }}>
      <Box
        sx={{
         // width: 500,
          margin: '15px 0',
          maxWidth: '800%',
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
        columns={columns}
      />
    </Container>
  </Box>
}

export default App;
