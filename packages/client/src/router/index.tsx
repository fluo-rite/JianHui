import { createHashRouter } from "react-router-dom";
import DataCount from "~/pages/dataCount";
import Editor from "~/pages/editor";
import Home from "~/pages/index";
import LoginOrRegister from "~/pages/loginOrRegister";
import Pages from "~/pages/pages";
import Preview from "~/pages/preview";

export const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
    children: [
      {
        path: "/login_or_register",
        element: <LoginOrRegister />,
      },
      {
        path: "/pages",
        element: <Pages />,
      },
      {
        path: "/editor/:pageId",
        element: <Editor />,
      },
      {
        path: "/dataCount/:pageId",
        element: <DataCount />,
      },
      {
        path: "/preview/:pageId",
        element: <Preview />,
      },
    ],
  },
]);
