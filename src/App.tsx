
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Defaulayout from './pages/Defaulayout';

function App() {
  return (
    <div className="App">
      <Routes>
      <Route path="/*" element={<Defaulayout />} /> 
    </Routes>
    </div>
  );
}

export default App;
