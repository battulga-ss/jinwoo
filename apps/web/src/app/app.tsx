import { Route, Routes } from 'react-router-dom';
import Auth from '../pages/auth';
import Profile from '../pages/profile';
import Quests from '../pages/quests';
import Admin from '../pages/admin';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/quests" element={<Quests />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;
