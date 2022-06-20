import { AppBar, Box, Container, Toolbar, Typography, Stack, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import './App.css';
const speciesGroupChipMapping = {
  // colours: default primary secondary error info success warning
  "Animals": "primary",
  "Mammals": "success",
  "Birds": "success",
  "Arthropods": "success",
  "Plants": "danger",
  "Angiosperms": "success",
  "Fungi": "info"
}
const columns = [
  {
    field: 'id', 
    headerName: 'Record ID', 
    width: 120
  },
  { field: "scientificName",
    headerName: "Scientific Name",
    width: 200
  },
  { field: "vernacularName",
    headerName: "Vernacular Name",
    width: 180
  },
  { field: "speciesGroups",
    headerName: "Species Groups",
    width: 180,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        { params.value.map( (sg) => 
          <Chip label={sg} color={speciesGroupChipMapping[sg]} size="small" variant="outlined" />
        )}
      </Stack>
    ),
  },
  { field: "dataResourceName",
    headerName: "DataResource",
    width: 180
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

const query = "state:%22Australian+Capital+Territory%22+AND+country:Australia";

function App() {
  const [pageState, setPageState] = useState({
    isLoading: false,
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    sort: "score",
    order: "desc"
  })

  useEffect(() => {
    const fetchData = async () => {
      console.log('ON')
      setPageState(old => ({ ...old, isLoading: true }))
      const startIndex = (pageState.page * pageState.pageSize) - pageState.pageSize
      const response = await fetch(`https://biocache-ws.ala.org.au/ws/occurrences/search?q=${query}&pageSize=${pageState.pageSize}&start=${startIndex}&sort=${pageState.sort}&order=${pageState.order}`)
      const json = await response.json()
      const records = json.occurrences.map(({ uuid: id, ...rest }) => ({
        id,
        ...rest
      }));
      setPageState(old => ({ ...old, isLoading: false, data: records, total: json.totalRecords }))
    }
    fetchData()
  }, [pageState.page, pageState.pageSize, pageState.sort, pageState.order])


  return <Box>
    <AppBar>
      <Toolbar>
        <Typography variant="h5" component="div">
          Biocache React Demo
        </Typography>
      </Toolbar>
    </AppBar>
    <Container style={{ marginTop: 100, marginBottom: 100 }}>
      <DataGrid
        autoHeight
        rows={pageState.data}
        rowCount={pageState.total}
        loading={pageState.isLoading}
        rowsPerPageOptions={[10, 25, 50, 70, 100]}
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
