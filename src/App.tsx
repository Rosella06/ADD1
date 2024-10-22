import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthRoute } from './auth/authroute';
import './index.css';
import '../src/styles/styles.css';
import { Islogout, UserRole } from './auth/authentication';
import Notfound from './pages/notfound';
import Wrapper from './pages/wrapper';
import Drugs from './pages/drugs/drugs';
import Inventory from './pages/inventory/inventory';
import AddUser from './pages/users/user';
import Settings from './pages/users/Settings';
import Home from './pages/card/home';
import Stock from './pages/inventory/Stock';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthRoute />,
    children: [
      {
        path: "/",
        element: <Wrapper />,
        children: [
          {
            path: "/",
            element: <Home />
          },
          {
            element: <UserRole />,
            children: [{
              path: "drugs",
              element: <Drugs />
            },
            {
              path: "inventory",
              element: <Inventory />
            },
            {
              path: "adduser",
              element: <AddUser />
            },
            {
              path: "settings",
              element: <Settings />
            },
            {
              path: "Stock",
              element: <Stock />
            }
            ]
          }

        ]
      }
    ]
  },
  {
    path: "/login",
    element: <Islogout />
  },
  {
    path: "*",
    element: <Notfound />
  }
]);

const App = () => {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
