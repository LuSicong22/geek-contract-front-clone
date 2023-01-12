import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./assets/styles/App.css";
import Question from "./components/Question";
import Main from "./components/Main";
import { useSelector } from "react-redux";
import PageNotFound from "./components/PageNotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    errorElement: <PageNotFound />,
    children: [
      {
        path: "questions/:questionId",
        element: <Question />,
        errorElement: <PageNotFound />,
      },
      {
        path: "*",
        element: <PageNotFound />,
      },
    ],
  },
]);

function App() {
  console.log(
    "App.js connectStatus=" + useSelector((state) => state.rooter.connectStatus)
  );
  return <RouterProvider router={router} />;
}

export default App;
