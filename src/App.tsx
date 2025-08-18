import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthRoute } from './auth/authroute';
import './index.css';
import '../src/styles/styles.css';
import { Islogout, UserRole } from './auth/authentication';
import Notfound from './pages/notfound';
import Wrapper from './pages/wrapper';
import Inventory from './pages/inventory/inventory';
import AddUser from './pages/users/user';
import Settings from './pages/users/Settings';
import Home from './pages/card/home';
// import Hometime from './pages/time';
import Homs from './pages/homs';
import Refill from './pages/inventory/Refill';
import Machinc from './Machine/Machinc';
import Drugs from './pages/drugs/drugs';
import SelectMachine from './Machine/selectmachine';
import Testtools from './testtools';
import DispensingReport from './pages/report/Report';


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
            element: <SelectMachine />
          },
          {
            path: "/Home",
            element: <Home />
          },
          {
            element: <UserRole />,
            children: [{
              path: "Refill",
              element: <Refill />
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
            // {
            //   path: "Hometime",
            //   element: <Hometime />
            // },
            {
              path: "Machinc",
              element: <Machinc />
            },
            {
              path: "Homs",
              element: <Homs />
            },
            {
              path: "Drugs",
              element: <Drugs />
            },
            {
              path: "Refill",
              element: <Refill />
            },
            {
              path: "DispensingReport",
              element: <DispensingReport />
            },
            {
              path: "Testtools",
              element: <Testtools />
            },
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