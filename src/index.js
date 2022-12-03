import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';

import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Dashboard, Guide, Root } from './components/routes';
import { ConnectionProvider } from './context/connectionContext';
import { rootLoader } from './components/routes/Root';
import { dashboardLoader } from './components/routes/Dashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    loader: rootLoader,
    children: [
      {
        path: 'guide',
        element: <Guide />,
      },
      {
        path: 'dashboard/:pcode',
        element: <Dashboard />,
        loader: dashboardLoader,
      },
    ],
  },
]);
ReactDOM.render(
  <React.StrictMode>
    <ConnectionProvider>
      <RouterProvider router={router} />
    </ConnectionProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
