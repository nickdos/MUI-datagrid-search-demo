import { CssBaseline } from '@mui/material';
import {ThemeProvider} from "@mui/material/styles"
import './App.css';
import Search from './components/Search';
import theme from './components/theme';

function App() {

  return <ThemeProvider theme={theme}>
    <CssBaseline />
    <Search />
  </ThemeProvider>
}

export default App;
