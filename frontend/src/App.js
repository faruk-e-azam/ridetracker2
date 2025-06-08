import { BrowserRouter } from 'react-router-dom';
import './App.css';
import AppRouter from './router/AppRouter';
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </div>
  );
}

export default App
