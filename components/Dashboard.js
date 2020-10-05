import dynamic from 'next/dynamic'
import React from 'react';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import Typography from '@material-ui/core/Typography';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';

import Link from 'next/link'
import CssStyle from './cssStyle/CssStyle';
//import { selectShipmentNoticeNumber } from '../features/formDialog/formDialogSlice';
import StockDialog from './StockDialog';
import FinishDialog from './FinishDialog';

//import { Route, Link, Switch, HashRouter } from "react-router-dom"
import { useDispatch } from 'react-redux';
import { Button } from '@material-ui/core';
import { red, grey } from '@material-ui/core/colors';
import LocalShippingSharpIcon from '@material-ui/icons/LocalShippingSharp';
import { doFinishDialogOpen } from '../lib/formDialogSlice';
import { saveLocationList } from '../lib/stockTableSlice'
import axios from 'axios';
function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link href="//material-ui.com/">
        <a>VP</a>
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography >
  );
}

const ColorAppBar = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(red[600]),
    backgroundColor: red[600],
    '&:hover': {
      backgroundColor: red[600],
    },
  },
}))(AppBar);

const ColorBtn = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText(grey[200]),
    backgroundColor: grey[200],
    '&:hover': {
      backgroundColor: red[200],
    },
  },
}))(Button);


const drawerWidth = 840;//menu寬度

const useStyles = CssStyle(1000);

/**
 * ---------------主視窗----------------
 */
export default function Dashboard() {


  React.useEffect(() => {
    //localStorage.clear();
    async function fetchData(num) {
      await getLocationList(num);
    }

    // localStorage.setItem("fresh","vfresh.org");
    // localStorage.getItem("fresh");
    if (localStorage.getItem("location") === undefined || localStorage.getItem("location") == null) {
      //判斷庫位儲位管理碼相關物件是否為空,如為空跳出輸入視窗
      //並執行getLocationList 儲存物件至cookie
      let num = prompt('請輸入當前庫位編號');
      //庫位編號

      fetchData(num);

    } else {
      console.log(
        "已有庫位資料:" + JSON.parse(localStorage.getItem("location"))[0].inaaId.inaa001);
      setWarehouseNo(JSON.parse(localStorage.getItem("location"))[0].inaaId.inaa001);
    }
    // if (cookies.location === undefined || cookies.location.length == 0) {
    //   //判斷庫位儲位管理碼相關物件是否為空,如為空跳出輸入視窗
    //   //並執行getLocationList 儲存物件至cookie
    //   let num = prompt('請輸入當前庫位編號');
    //   //庫位編號

    //   fetchData(num);

    // } else {
    //   setWarehouseNo(cookies.location[0].inaaId.inaa001);
    // }

  });
  const [warehouseNo, setWarehouseNo] = React.useState('');
  //const [cookies, setCookie, removeCookie] = useCookies([]);

  //忘記為何要動態載入
  const ShipmentNoticeTable = dynamic(
    () => import('./tables/ShipmentNoticeTable'),
    { ssr: false }
  )
  //const selectIsDrOpen = useSelector(selectIsDrawerOpen);
  const classes = useStyles();
  const dispatch = useDispatch();
  //const selectShipmentNoticeNum = useSelector(selectShipmentNoticeNumber);
  const [open, setOpen] = React.useState(false);

  const handleCokie = () => {
    //removeCookie('location');
    localStorage.removeItem('location');
    setWarehouseNo("");
    window.location.reload();
  }

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const handleFinishDialogOpen = () => {
    dispatch(doFinishDialogOpen());
  }

  const testShiro = () => {
    let url =
      `shiro/login?username='55666&password='wtf'`;
    axios.post(url, JSON.stringify({
      username: '55666',
      password: '123',

    }), {
      headers: { "Content-Type": "application/json" }
    }).then((response) => { console.log(response) });



  }

  const testShiroRole = () => {
    let url =
      `shiro/testRole`;
    axios.get((url)).then((response) => { console.log(response) });



  }


  const getLocationList = async (inaa001) => {
    if (inaa001.length == 0) {
      alert('你輸入的庫位為空,請將頁面重新整理並輸入庫位');
      window.location.reload();
      return false;
    }
    let locationData;
    //只取大於0 && 有批號的資料
    let url =
      `kanbanApi/getInaa007ByInaa001?inaa001=${inaa001}`;

    fetch(url)
      .then((response) => {

        //response.json()
        if (response.ok) {
          //this.setState({ isLoading: false });

          return response.json();
        }
        let msg = "";

        switch (response.status) {
          case 500:
            msg =
              "錯誤碼:500 請檢查 API service server,URL= " +
              url +
              " 來源無回應; 可能是該出貨日期查無資料導致.";

            break;
          case 404:
            msg = "錯誤碼:檢查 請檢察API URL,出現404錯誤";
            break;
          default:
            msg = "錯誤碼:" + response.status + " 請檢察API URL,出現404錯誤";
            break;
        }
        //this.setState({InvoiceInfos: []});
        throw new Error(msg);
      })
      .then(
        (data) => {
          if (data.length == 0) {
            alert("該庫位編號不存在");

            window.location.reload();
          } else {
            //console.log(data);
            locationData = data;
            //console.log(locationData);
            //setCookie('location', locationData, { path: '/' });
            localStorage.setItem("location", JSON.stringify(locationData));

            dispatch(saveLocationList(locationData));
            console.log('-----getLocationList取得庫位資訊後置入localStorage.setItem("location","")------');
            setWarehouseNo(inaa001);
            //window.location.reload();
            //return locationData;
          }

        }

      ).catch((error) => {
        console.log(error.message);

        //alert(error.message);
      });

  };
  return (
    <div className={classes.root}>

      <ColorAppBar color="secondary" position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>

        <Toolbar className={classes.toolbar}>
          <Grid container direction="row" justify="space-between" alignItems="center" spacing={3}>
            <Grid item xs={12} md={4} lg={4}>
              <Typography component="h1" variant="h5" color="inherit" noWrap className={classes.title}>
                檢貨輔助工具 庫位編號:{warehouseNo}
              </Typography>
            </Grid>
            <Grid item xs={12} md={2} lg={2}>
              <ColorBtn onClick={handleCokie} color="primary" variant="contained" fullWidth={true}>
                重設庫位
              </ColorBtn>
            </Grid>
            <Grid item xs={12} md={3} lg={3}>
              <ColorBtn endIcon={<LocalShippingSharpIcon />} onClick={handleFinishDialogOpen} color="primary" variant="contained" fullWidth={true}>
                檢貨結果預覽
              </ColorBtn>
            </Grid>
            <Grid item xs={12} md={1} lg={1}>
              <ColorBtn endIcon={<LocalShippingSharpIcon />} onClick={testShiro} color="primary" variant="contained" fullWidth={true}>
                test
              </ColorBtn>
            </Grid>
            <Grid item xs={12} md={1} lg={1}>
              <ColorBtn endIcon={<LocalShippingSharpIcon />} onClick={testShiroRole} color="primary" variant="contained" fullWidth={true}>
                test role
          </ColorBtn>
            </Grid>
          </Grid>
        </Toolbar>
      </ColorAppBar>

      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={12} lg={12}>

              <ShipmentNoticeTable />
            </Grid>
          </Grid>
          <Box pt={4}>
            <Copyright />
          </Box>
        </Container>

      </main>
      <div hidden={true}>
        <StockDialog />
        <FinishDialog />
      </div>
    </div>
  );
}




class Introd extends React.Component {
  render() {
    return <p>這裡是理念介紹</p>
  }
}

class His extends React.Component {
  render() {
    return <p>這裡是歷史沿革</p>
  }
}

class NoPage extends React.Component {
  render() {
    return <p>頁面維護中...</p>
  }
}