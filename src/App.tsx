import "./App.css";
import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import Notes from "./pages/Notes";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/notes" element={<Notes />} />
    </Routes>
  );
}

export default App;
