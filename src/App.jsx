import { useState } from 'react'
import FrontPage from './Components/FrontPage/FrontPage';
import VendorDashboard from './Components/VendorDashboard/VendorDash';
import LoginRegister from './Components/LoginRegister/LoginRegister';

function App() {
  // A három lehetséges állapot: 'home', 'login', 'dashboard'
  const [currentView, setCurrentView] = useState('home');

  const navigateTo = (view) => {
    setCurrentView(view);
    window.scrollTo(0, 0); 
  };

  return (
    <div className="App">
      {/* 1. Ha a nézet 'home', a kezdőlapot mutatjuk. 
          Az Account gomb most már a 'login' felé navigál. */}
      {currentView === 'home' && (
        <FrontPage onProfileClick={() => navigateTo('login')} />
      )}
      
      {/* 2. Ha a nézet 'login', a bejelentkező ablak jelenik meg.
          Sikeres belépés után a 'dashboard' felé küldjük a felhasználót. */}
      {currentView === 'login' && (
        <LoginRegister 
          onLoginSuccess={() => navigateTo('dashboard')} 
          onBack={() => navigateTo('home')} 
        />
      )}

      {/* 3. Ha a nézet 'dashboard', a készletkezelő felület látható. */}
      {currentView === 'dashboard' && (
        <VendorDashboard onBackToHome={() => navigateTo('home')} />
      )}
    </div>
  )
}

export default App