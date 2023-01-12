import { Layout } from "antd";
import AppHeader from "./Header";
import { Outlet, useMatch } from "react-router-dom";
import QuestionList from "./QuestionList";
import '../assets/styles/main.css';

const Main = () => {
  const match = useMatch("/questions/:questionId");

  return (
    <Layout>
      <AppHeader />
      <div className="main flex">
        {match ? <Outlet /> : <QuestionList />}
      </div>
    </Layout>
  );
};

export default Main;
