import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useMatch } from "react-router-dom";
import { message, Button } from "antd";
import { LeftOutlined, RightOutlined, MenuOutlined } from "@ant-design/icons";
import tronLogo from "../assets/images/tron.svg";
import "../assets/styles/header.css";
import {
  setTronObj,
  setCurrentAccount,
  setConnectStatus,
} from "../store/rootReducer";
