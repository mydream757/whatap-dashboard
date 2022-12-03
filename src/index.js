import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';

import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App, Dashboard, Root } from './components/routes';
import { ConnectionProvider } from './context/connectionContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'app',
        element: <App />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
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
