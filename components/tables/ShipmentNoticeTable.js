import React, { useState, useRef } from "react";
import MUIDataTable from "mui-datatables";

import TextField from '@material-ui/core/TextField';
import { useSelector, useDispatch } from 'react-redux';
import { saveShipmentNoticeData, doShipmentNoticeNum, selectShipmentNoticeNum, selectShipmentNoticeData, preWork, doDataCheck } from '../../lib/shipmentNoticeTableSlice';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AntTab from '../AntTab';
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import { useSnackbar } from 'notistack';
import {
    makeStyles,
} from '@material-ui/core/styles';

import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Typography from "@material-ui/core/Typography";
import shipNoticeColumns from '../tableColumns/ShipNoticeDataTableColumns';

import { getStockInfoList, doMaterialNum, doOrderNum, selectOrderNum, selectStockNum, numExists, saveStockInfoFromShipNoticeData, saveStockData, selectStockHandelRecords, saveStockHandelRecords } from '../../lib/stockTableSlice';

import linq from "linq";
import LastCartonInputField from "../input/LastCartonInputField";
import ValidationTextFieldStyle from "../cssStyle/ValidationTextFieldStyle"
import { selectDialogType, setCurrentDialogType } from "../../lib/formDialogSlice"

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    margin: {
        margin: theme.spacing(1),
    },
    demo1: {
        backgroundColor: theme.palette.background.paper,
    },


}));

/**
 *出通單明細
 *
 * @export
 * @returns
 */
export default function ShipmentNoticeTable() {

    const melNumInput = useRef(null);
    const shipNoticeNumNumInput = useRef(null);
    const materielNumber = useSelector(selectStockNum);
    const orderNumber = useSelector(selectOrderNum);
    const classes = useStyles();
    const ValidationTextFieldClasses = ValidationTextFieldStyle();
    const stockHandelRecs = useSelector(selectStockHandelRecords);
    const shipmentNoticeData = useSelector(selectShipmentNoticeData);
    const shipmentNoticeNumber = useSelector(selectShipmentNoticeNum);
    const sDialogType = useSelector(selectDialogType);
    //出通單號
    const [num, setNum] = useState(shipmentNoticeNumber);
    //料號
    const [melNum, setMelNum] = useState(materielNumber);

    const [orderNum, setOrderNum] = useState(orderNumber);
    //資訊查詢結果
    const [data, setData] = useState(shipmentNoticeData);
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    //這裡的坑要記得 state變數如果要和redux變數連動 請在宣告時 將selector變數設為state的預設值
    //如下---> sDialogType= useSelector(selectDialogType); 改變時用dispatch就好
    const [value, setValue] = React.useState(sDialogType);

    React.useEffect(() => {
        //載入元件時預設
        setData(shipmentNoticeData);
        return () => {
            // componentWillUnmount is here
            setData([]);
        }
    },
        //要監控的值 有變化才rerender
        [shipmentNoticeData]);

    //TAB switch
    const handleChange = (event, newValue) => {
        // console.log(sDialogType+'value='+value);
        dispatch(setCurrentDialogType(newValue));
        //清除ShipmentNoticeData
        dispatch(saveShipmentNoticeData([]));

    };

    const getTobePickedShippingInfoList = async (num) => {

        let url =
            "/kanbanApi/getTobePickedShippingInfoListByXmdgdocno?xmdgdocno=" + num + "&page=1&per_page=1";

        await fetch(url)
            .then((response) => {

                //response.json()
                console.log(response)
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

                    let d = preWork(data.data);
                    d = doDataCheck(d);
                    setData(d);
                    dispatch(saveShipmentNoticeData(d));


                }

            ).catch((error) => {
                console.log(error.message);
                setData([]);
                dispatch(saveShipmentNoticeData([]));

                //alert(error.message);
            });
    };



    //料號+訂單號輸入後按下ENTER
    const handleMelNumField = (e) => {
        //setData(doDataCheck(data));
        let melNumm = e.target.value;
        if (e.key === 'Enter') {

            let inputNum = melNumm.trim();
            let inpArr = [];
            //alert(inputNum.length)
            if (inputNum.length === 0) {
                enqueueSnackbar('料號+訂單號不可為空', {
                    variant: 'warning',
                });
                return false;
            }
            /*********用來check 是否重新輸入條碼************** */
            inpArr = inputNum.split('_');
            if (inpArr.length > 3){
                inputNum = handleMelAndONumChange(inputNum);
            }
            /******************************* */
            setMelNum(inputNum);
            let inputValueArray = inputNum.split('_');


            //輸入料號欄顯示料號值
            dispatch(doMaterialNum(inputValueArray[0]));

            let stockInfoFromShipNoticeData = null;

            if (inputValueArray[1] === undefined) {
                enqueueSnackbar('料號+訂單號 輸入有誤', {
                    variant: 'warning',
                });
                return false;
            } else {

                //取得物料資訊 數量 項次 訂單號碼(對應庫存批號) "{shipQty:$.xmdh017,seq:$.xmdhseq,orderNum:$.xmdh001}"
                stockInfoFromShipNoticeData = numExists(inputValueArray[0], shipmentNoticeData, inputValueArray[1]);
                //批號全域狀態設定
                dispatch(doOrderNum(inputValueArray[1]));

                //批號區域狀態設定
                setOrderNum(inputValueArray[1]);
            }


            if (stockInfoFromShipNoticeData.length === 0) {

                enqueueSnackbar('出通單不存在此料號', {
                    variant: 'warning',
                });
                dispatch(saveStockData([]));
                return false;
            }
            setMelNum(inputValueArray[0]+'_'+inputValueArray[1]);
            //儲存目前正在編輯的出通單料號資訊{shipQty:出通量,seq:該項目像次 }
            dispatch(saveStockInfoFromShipNoticeData(stockInfoFromShipNoticeData[0]));
            //確認該料號是否慛再現有出通單中,有的話call API 取得料號庫存.
            //FIX:參數傳
            console.log(stockInfoFromShipNoticeData[0]);
            dispatch(getStockInfoList(inputValueArray[0], JSON.parse(localStorage.getItem("location")), stockInfoFromShipNoticeData[0], stockHandelRecs, inputValueArray[1]));

        }
    }



    /**
     * 料號+訂單號
     * @param {*} e 
     */
    /**
     * 料號+訂單號
     * @param {*} e 
     */
    const handleMelAndONumChange = (inp) => {
        let input = inp.split('_');
        let melNum = '';
        var num = input[2];
        if (input[2].includes("%")){
            melNum = input[2].split('%');
            num = melNum[0];
        }
        
        let onum = input[4];
        //setMelNum( melNum[0] + '_' + onum);
        return num + '_' + onum;
    }


    const handleFocus = (e) => {
        e.target.select();
        setMelNum('');
    }



    const handleTextField = (e) => {
        // if(!(e.target.value)){
        //     alert('出通單號不可為空');
        // }
        if (e.key === 'Enter') {

            dispatch(doShipmentNoticeNum(num));
            console.log('--->' + shipmentNoticeNumber);

            getTobePickedShippingInfoList(e.target.value);

            if (!e.target.value) {
                enqueueSnackbar('出通單不可為空', {
                    variant: 'warning',
                });
                //alert('出通單不可為空')
                return false;
            } else {
                melNumInput.current.focus();

                //dispatch(doDrawerOpen());
            }


        }
    }


    //重設
    const resetShipQty = (shipNoticeDataRow) => {

        //shipQty > 0
        if (shipNoticeDataRow[7] > 0) {

            let thisItemExistQty = shipNoticeDataRow[7];

            let keys = Object.keys(shipmentNoticeData[0]);
            let thisExistStocks = [];
            //***************shipTableData reset shipQty to 0******************* */
            //ewProcData 重設後的陣列 要取代shipNoticeData ,為接收 return的容器 
            //thisExistStocks 目前的庫存資訊
            const newProcData = shipmentNoticeData.map((x, index) => {


                console.log(x.xmdh001 + '/' + shipNoticeDataRow[8]);
                if (value == 0 && _.isEqual(x.xmdhseq, shipNoticeDataRow[1])) {

                    let rObj = {};
                    rObj.shipQty = 0;
                    thisExistStocks = x['stockToShipDatas'];
                    linq.from(keys).forEach(
                        (c) => {
                            //console.log(c);
                            if (c !== 'shipQty' && c !== 'stockToShipDatas')
                                rObj[c] = x[c];
                        }
                    );


                    return rObj
                }
                console.log(x);
                //客戶模式下 抓同訂單號 同出通單號 同項次 有stockToShipDatas屬性的出通明細做重置
                if (value == 1 && x.xmdh001== shipNoticeDataRow[8] &&  x.xmdhdocno==shipNoticeDataRow[9] && x.xmdhseq==shipNoticeDataRow[1]　&& !_.isUndefined(x.stockToShipDatas)) {
                    console.log('yes');
                    //取得該出通項目已設置的庫存資訊
                    thisExistStocks = x['stockToShipDatas'];
                    return createNewData(keys, x);
                }

                return x;


            });
            dispatch(saveShipmentNoticeData(newProcData));
            //************************************** */

            //******************************************** */
            console.log('--------------測試2--------------');
            console.log(thisExistStocks);
            let ansers = [];
            //取得庫存資訊欄位作為keys
            keys = Object.keys(thisExistStocks[0]);

            //找到存在stockHandelRecs符合要重置的庫存資料,將數量減掉
            //因stockData會去找在stockHandelRecs中的同庫存數量做扣除
            //這邊因為重設數量了 所以要讓stockData中這筆庫存數量加回來
            stockHandelRecs.map((rec, index) => {

                //判斷目前的rec是否為thisExistStocks
                let target = findByKeys(rec, thisExistStocks);
                //不是 就什麼都不做放到ansers
                if (!target) {
                    ansers.push(rec);
                }//是的話 做數量計算 將rec數量減掉重設數量  
                else {
                    //因為無法直接在原始物件做異動,必須建新的物件且放值進去再push到新陣列
                    let rObj = {};
                    rObj.shipQty = rec.shipQty - target.shipQty;
                    //除了shipQty之外 全部值都照舊給
                    linq.from(keys).forEach(
                        (c) => {
                            //console.log(c);
                            if (c !== 'shipQty')
                                rObj[c] = rec[c];
                        }
                    );
                    ansers.push(rObj);
                }



            });
            console.log('--------------測試3--------------');
            console.log(ansers);
            dispatch(saveStockHandelRecords(ansers));



            // let info = {};
            // info.shipQty = shipNoticeDataRow[5];
            // info.seq = shipNoticeDataRow[1];
            // info.type = 'reset';
            // info.settedShipQty = shipNoticeDataRow[6];
            // info.stockToShipDatas =  _.find(shipmentNoticeData, function (o) {
            //     //console.log( o.xmdhseq +'=='+ shipNoticeDataRow[1])
            //     return (''+o.xmdhseq == ''+shipNoticeDataRow[1]);
            // }).stockToShipDatas;
            // console.log(info)
            // //dispatch(saveStockInfoFromShipNoticeData(info));
            // dispatch(getStockInfoList(shipNoticeDataRow[3], cookies.location, info, stockHandelRecs));
        } else {
            alert('該項目無法重置');
        }
    }

    //取名???
    const createNewData = (keys, x) => {
        let rObj = {};
        rObj.shipQty = 0;
        linq.from(keys).forEach(
            (c) => {
                //console.log(c);
                if (c !== 'shipQty' && c !== 'stockToShipDatas')
                    rObj[c] = x[c];
            }
        );
        return rObj
    }

   
    /**
     * 用來做stockHandelRecs中每筆item的比對邏輯
     * @param {*} x stockHandelRecs的每筆item
     * @param {*} sample 要符合的目標對象
     */
    const findByKeys = (x, sample) => {
        //比對欄位屬性
        return _.find(sample, function (o) {
            //console.log(o);
            return (
                o.inag001 == x.inag001 &&
                o.inag004 == x.inag004 &&
                o.inag005 == x.inag005 &&
                o.inag006 == x.inag006
            );
        });
    }


    const options = {
        selectableRowsHeader: false,
        selectToolbarPlacement: 'none',
        download: false,
        print: false,
        filter: false,
        search: false,
        viewColumns: false,
        selectableRows: 'none',
        // expandableRows: true,
        // expandableRowsHeader: false,
        // expandableRowsOnClick: true,

        isRowExpandable: (dataIndex, expandedRows) => {
            // 限制能開啟擴展資訊的筆數 (but allow those already expanded to be collapsed)
            if (expandedRows.data.length > 2 && expandedRows.data.filter(d => d.dataIndex === dataIndex).length === 0) return false;
            return true;
        },

        renderExpandableRow: (rowData, rowMeta) => {

            return (
                <TableRow>
                    <TableCell colSpan={2}>
                        Custom expandable row option. Data: {JSON.stringify(rowData)}
                    </TableCell>

                </TableRow>
            );
        },

        // setRowProps: row => {
        //     if (row[0] === "ok") {
        //         return {
        //             style: { background: "rgba(59, 216, 63, 0.94)" }
        //         };
        //     }
        // },
        //filterType: "dropdown",
        // responsive,
        // tableBodyHeight,
        // tableBodyMaxHeight

        /**
         * 
         * @param data 每列表格資料
         */
        customRowRender: (data, dataIndex, rowIndex) => {
            let style = {};
            if (data[7] > 0) {

                if (data[5] == data[7]) {
                    style.backgroundColor = "green";
                } else if (data[5] > data[7]) {
                    style.backgroundColor = "yellow";
                }
            }

            //console.log(data);
            return (
                <TableRow style={style} key={'' + rowIndex}>
                    <TableCell>
                        <Typography>
                            <Button
                                onClick={() => { resetShipQty(data) }}
                                variant="contained"
                                color="primary">重設</Button>
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography>{data[1]}</Typography>
                    </TableCell>
                    <TableCell>
                        <Typography>{data[2]}</Typography>
                    </TableCell>
                    <TableCell>
                        <Typography>{data[3]}</Typography>
                    </TableCell>
                    <TableCell>
                        <Typography>{data[4]}</Typography>
                    </TableCell>
                    <TableCell>
                        <Typography>{data[5]}</Typography>
                    </TableCell>
                    <TableCell>
                        <Typography>{data[6]}</Typography>
                    </TableCell>
                    <TableCell>
                        <Typography><input type="text" onChange={() => { }} value={data[7]}></input></Typography>
                    </TableCell>


                </TableRow>
            );
        }
    };
    const columns = shipNoticeColumns.ShipNoticeDataTableColumns;

    return (
        <>
            <Grid container direction="row" justify="center" alignItems="center" spacing={3}>
                <Grid item xs={12} md={12} lg={12}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        //variant="scrollable"
                        //scrollButtons="off"
                        centered
                        aria-label="tabs"
                    >
                        <AntTab label='一般' aria-label="一般" />
                        <AntTab label='客戶' aria-label="客戶" />

                    </Tabs>
                </Grid>
            </Grid>
            <Grid container direction="row" justify="center" alignItems="center" spacing={3}>

                <TabPanel value={sDialogType} index={1}>
                    <LastCartonInputField enqueueSnackbar={enqueueSnackbar} />
                </TabPanel>
                <TabPanel value={sDialogType} index={0}>
                    <Grid container direction="row" justify="center" alignItems="center" spacing={3}>
                        <Grid item xs={12} sm={4} md={4} lg={4}>
                            <h2>出通單號:<TextField
                                className={[ValidationTextFieldClasses.ValidationTextField, classes.margin]}
                                label="請輸入出通單號"
                                required
                                inputRef={shipNoticeNumNumInput}
                                autoFocus
                                value={num}
                                variant="outlined"

                                id="shipmentNoticeNumber-outlined-input"
                                onChange={(e) => setNum(e.target.value)}
                                onKeyPress={handleTextField}
                                onFocus={handleFocus}
                            /></h2>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6} lg={6}>
                            <h2>料號+訂單號:<TextField
                                className={[ValidationTextFieldClasses.ValidationTextField, classes.margin]}
                                label="料號+訂單號"
                                required
                                fullWidth={true}
                                //autoFocus
                                value={melNum}
                                variant="outlined"

                                id="melNum"
                                inputRef={melNumInput}
                                onChange={(e) => setMelNum(e.target.value)}
                                onKeyPress={handleMelNumField}
                                onFocus={handleFocus}
                            /></h2>
                        </Grid>
                    </Grid>
                </TabPanel>

                <Grid item xs={12} md={12} lg={12}>
                    <MUIDataTable
                        title={"出通單明細"}
                        data={data}
                        columns={columns}
                        options={options}
                    />
                </Grid>

            </Grid>


        </>
    );
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    );
}