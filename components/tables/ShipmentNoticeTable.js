import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import MUIDataTable from "mui-datatables";

import TextField from '@material-ui/core/TextField';
import { useSelector, useDispatch } from 'react-redux';
import { saveShipmentNoticeData, doShipmentNoticeNum, selectShipmentNoticeNum, selectShipmentNoticeData } from '../../lib/shipmentNoticeTableSlice';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { useSnackbar } from 'notistack';
import {
    fade,
    ThemeProvider,
    withStyles,
    makeStyles,
    createMuiTheme,
} from '@material-ui/core/styles';

import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Typography from "@material-ui/core/Typography";
import shipNoticeColumns from '../tableColumns/ShipNoticeDataTableColumns';

import { getStockInfoList, doMaterialNum, selectStockNum, numExists, saveStockInfoFromShipNoticeData, saveStockData, selectStockHandelRecords, saveStockHandelRecords } from '../../lib/stockTableSlice';
import { useCookies, } from 'react-cookie';
import linq from "linq";

const ValidationTextField = withStyles({
    root: {
        '& input:valid + fieldset': {
            borderColor: 'green',
            borderWidth: 2,
        },
        '& input:invalid + fieldset': {
            borderColor: 'red',
            borderWidth: 2,
        },
        '& input:valid:focus + fieldset': {
            borderLeftWidth: 6,
            padding: '4px !important', // override inline-style
        },
    },
})(TextField);
const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    margin: {
        margin: theme.spacing(1),
    },
}));
export default function ShipmentNoticeTable() {

    const melNumInput = useRef(null);
    const shipNoticeNumNumInput = useRef(null);
    const materielNumber = useSelector(selectStockNum);
    const classes = useStyles();
    const stockHandelRecs = useSelector(selectStockHandelRecords);
    const shipmentNoticeData = useSelector(selectShipmentNoticeData);
    const shipmentNoticeNumber = useSelector(selectShipmentNoticeNum);
    //出通單號
    const [num, setNum] = useState(shipmentNoticeNumber);
    //料號
    const [melNum, setMelNum] = useState(materielNumber);
    //資訊查詢結果
    const [data, setData] = useState(shipmentNoticeData);
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const [cookies, setCookie, removeCookie] = useCookies([]);
    React.useEffect(() => {
        //載入元件時預設
        setData(shipmentNoticeData);
        return () => {
            // componentWillUnmount is here
            setData([]);
        }
    },
        //要監控的值 有變化才render
        [shipmentNoticeData]);

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


    const preWork = (data) => {

        const map1 = data.map((x) => {
            x.shipQty = 0;
            return x;
        });

        return map1;
    }
    const doDataCheck = (data) => {
        const map1 = data.map((x, i) => {

            if (x.shipQty !== 0) {
                x.isCheckOk = 'ok';

            }

            return x;
        });

        return map1;
    }

    //料號輸入後按下ENTER
    const handleMelNumField = (e) => {
        //setData(doDataCheck(data));
        if (e.key === 'Enter') {

            //輸入料號欄顯示料號值
            dispatch(doMaterialNum(melNum));
            if (e.target.value.length === 0) {
                enqueueSnackbar('料號不可為空', {
                    variant: 'warning',
                });
                return false;
            }

            let stockInfoFromShipNoticeData = numExists(e.target.value, shipmentNoticeData);
            if (stockInfoFromShipNoticeData.length === 0) {

                enqueueSnackbar('出通單不存在此料號', {
                    variant: 'warning',
                });
                dispatch(saveStockData([]));
                return false;
            }
            //儲存目前正在編輯的出通單料號資訊{shipQty:出通量,seq:該項目像次 }
            dispatch(saveStockInfoFromShipNoticeData(stockInfoFromShipNoticeData[0]));
            //確認該料號是否慛再現有出通單中,有的話call API 取得料號庫存.
            //FIX:參數傳
            dispatch(getStockInfoList(e.target.value, JSON.parse(localStorage.getItem("location")), stockInfoFromShipNoticeData[0], stockHandelRecs));
        }
    }




    const handleFocus = (e) => {
        e.target.select();
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


    const resetShipQty = (shipNoticeDataRow) => {

        if (shipNoticeDataRow[7] > 0) {

            let thisItemExistQty = shipNoticeDataRow[7];
            let thisExistStocks = [];
            let keys = Object.keys(shipmentNoticeData[0]);
            //***************shipTableData reset shipQty to 0******************* */
            const newProcData = shipmentNoticeData.map((x, index) => {



                if (_.isEqual(x.xmdhseq, shipNoticeDataRow[1])) {

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
                    console.log('--------------測試--------------');
                    console.log(rObj);

                    return rObj
                } else {
                    return x;
                }

            });
            dispatch(saveShipmentNoticeData(newProcData));
            //************************************** */

            //******************************************** */
            console.log('--------------測試2--------------');
            console.log(thisExistStocks);
            let ansers = [];
            keys = Object.keys(thisExistStocks[0]);
            stockHandelRecs.map((rec, index) => {


                let target = findByKeys(rec, thisExistStocks);
                if (!target) {
                    ansers.push(rec);
                } else {
                    let rObj = {};
                    rObj.shipQty = rec.shipQty - target.shipQty;
                    linq.from(keys).forEach(
                        (c) => {
                            //console.log(c);
                            if (c !== 'shipQty' )
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

    const findByKeys = (x, sample) => {
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

        setRowProps: row => {
            if (row[0] === "ok") {
                return {
                    style: { background: "rgba(59, 216, 63, 0.94)" }
                };
            }
        },
        //filterType: "dropdown",
        // responsive,
        // tableBodyHeight,
        // tableBodyMaxHeight
        customRowRender: (data, dataIndex, rowIndex) => {
            let style = {};
            if (data[7] !== 0) {
                style.backgroundColor = "green";
            }
            //console.log(data);
            return (
                <TableRow style={style} key={'' + rowIndex}>


                    <TableCell>
                        <Typography>
                            <Button
                                onClick={() => { resetShipQty(data) }}
                                variant="contained"
                                color="primary">reset</Button>
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
                <Grid item xs={12} md={4} lg={4}>
                    <h2>出通單號:<ValidationTextField
                        className={classes.margin}
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
                <Grid item xs={12} md={4} lg={4}>
                    <h2>料號:<ValidationTextField
                        className={classes.margin}
                        label="請輸入料號"
                        required
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