import React, { useState, useEffect } from "react";
import MUIDataTable from "mui-datatables";

import TextField from '@material-ui/core/TextField';
import { useSelector, useDispatch } from 'react-redux';
import { saveStockHandelRecords, saveStockData, doMaterialNum, selectStockNum, selectStockData, selectStockInfoFromShipNoticeData, selectStockHandelRecords } from '../../lib/stockTableSlice';
import { selectShipmentNoticeData, saveShipmentNoticeData } from '../../lib/shipmentNoticeTableSlice';
import { selectIsStockDialogOpen, doStockDialogOpen, doStockDialogClose, } from '../../lib/formDialogSlice';
import {
    //fade,
    //ThemeProvider,
    withStyles,
    makeStyles,
    //createMuiTheme,
} from '@material-ui/core/styles';
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Typography from "@material-ui/core/Typography";
import linq from "linq";
import Grid from '@material-ui/core/Grid';
import MuiAlert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import StockTableColumns from '../tableColumns/StockTableColumns';

import ControlPointIcon from '@material-ui/icons/ControlPoint';

import { useSnackbar } from 'notistack';

import _ from 'lodash';
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

/**
 *
 *
 * @export
 * @returns
 */
export default function StockTable() {
    const classes = useStyles();
    const stockInfoData = useSelector(selectStockData);
    const materielNumber = useSelector(selectStockNum);

    //來自出通單要傳遞到stockTable的物料資訊 主要是出貨數量的值
    const selectStockInfoFromShipData = useSelector(selectStockInfoFromShipNoticeData);
    const [stockInfoFromShipNoticeData, setStockInfoFromShipNoticeData] = useState(
        selectStockInfoFromShipData
    );

    //出通單資料
    const shipmentNoticeData = useSelector(selectShipmentNoticeData);

    //存貨數量紀錄表
    const stockHandelRecords = useSelector(selectStockHandelRecords);

    const [stockHandelRecs, setStockHandelRecs] = useState(stockHandelRecords);

    //檢貨結果預覽中所異動的庫存資料
    const [stockInfoDataToFinishTable, setStockInfoDataToFinishTable] = useState([]);

    //警告
    const [muiAlertSeverity, setMuiAlertSeverity] = useState("info");
    //出通單號
    const [num, setNum] = useState(materielNumber);

    //庫存資訊查詢結果
    const [data, setData] = useState(stockInfoData);
    //異動數量總和
    const [shipQtySum, setShipQtySum] = useState(0);

    const dispatch = useDispatch();


    const handleFocus = (e) => {
        e.target.select();
    }

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {

        stockQtySum(data);

    }, [data])
    /**
     * 確認該料號是否存在出通單明細中
     * @param {*料號} num 
     */
    const numExists = (num) => {
        //console.log(shipmentNoticeData);
        let shipNoticeData = linq.from(shipmentNoticeData)
            .where(`$.xmdh006 === '${num}' && $.shipQty === 0`)
            .select("{shipQty:$.xmdh017,seq:$.xmdhseq}").toArray();

        console.log(shipNoticeData);
        // var newArray = shipmentNoticeData.filter((el) => {
        //     if (el.xmdh006 === num) {
        //         return el;
        //     }
        // });
        return shipNoticeData;
    }

    /**
     * call 後端API取得資料
     * @param {*} num 
     */
    const getStockInfoList = async (num) => {


        if (!num) {
            enqueueSnackbar('料號不可為空', {
                variant: 'warning',
            });
            //alert('料號不可為空')
            return false;
        }
        //console.log(numExists(num)[0]);
        let stockInfoFromShipNoticeData = numExists(num);
        // if (stockInfoFromShipNoticeData.length === 0) {
        //     enqueueSnackbar('出通單不存在此料號', {
        //         variant: 'warning',
        //     });
        //     //alert('出通單不存在此料號')
        //     setData([]);
        //     return false;
        // }
        setStockInfoFromShipNoticeData(stockInfoFromShipNoticeData[0]);

        //只取大於0 && 有批號的資料
        let url =
            `kanbanApi/getStock?search=where:inag001@${num},and:inag008!=0,and:inag006:VP,`;

        await fetch(url)
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
                    //console.log(data);
                    let d = preWork(data);
                    //d =  doDataCheck(d);
                    setData(d);
                    dispatch(saveStockData(d));
                }

            ).catch((error) => {
                console.log(error.message);
                setData([]);
                dispatch(saveStockData([]));
                //alert(error.message);
            });
    };


    /**
     * data前置作業 增加id shipQty屬性
     * @param {*} data 
     */
    const preWork = (data) => {
        // console.log(data[0].inayl[1].inayl003)
        const prData = data.map((x, index) => {
            x.id = index;
            x.shipQty = 0;
            return x;
        });

        return prData;
    }

    /**
     * 指定按下enter後執行資料查詢by料號
     * 配合條碼機運作機制
     * @param {*} e 
     */
    const handleTextField = (e) => {
        if (e.key === 'Enter') {

            dispatch(doMaterialNum(num));
            console.log('--->' + materielNumber);


            getStockInfoList(e.target.value);


        }
    }

    /**
     * 處理stockInfoDataTable
     * 1.改變出貨數量的reRender
     * 2.動態計算shipQty的sum,並更新到state
     * @param {*} e 
     */
    const handleShipQty = (e) => {

        let v = Number(e.target.value);
        //無法修改現有的故新建一個stockInfoData
        //除了修改的欄位其他皆複製

        const newData = data.map((x, index) => {
            let obj = {};

            if (v === 0) {
                v = 0;
            }

            if (x.id == e.target.dataset.objid) {

                obj.shipQty = v;
                linq.from(columns).forEach(
                    (c) => {
                        if (c.name != 'shipQty')
                            obj[c.name] = x[c.name];
                    }
                )
                //stockInfoDataToShipNoticeTableArray.push(obj);

            } else {
                obj = x;
            }
            return obj;
        });



        //庫存出貨量總和
        //動態計算shipQty的sum,並更新到state
        // let nowShipQtySum = linq.from(newData).sum("$.shipQty")

        // setShipQtySum(nowShipQtySum);

        // if (nowShipQtySum > stockInfoFromShipNoticeData.shipQty) {
        //     setMuiAlertSeverity("error");

        // } else {
        //     setMuiAlertSeverity("info");

        // }
        stockQtySum(newData);
        //執行畫面變更
        setData(newData);

        //同步更新store資料
        dispatch(saveStockData(newData));
    }

    //存貨數量異動 總和計算與狀態生效
    const stockQtySum = (data) => {


        //儲存已設置出貨數量的庫存資料到出通單屬性中會在finshTable顯示
        setStockInfoDataToFinishTable(linq.from(data).where("$.shipQty != 0").toArray());

        let nowShipQtySum = linq.from(data).sum("$.shipQty");

        //儲存狀態總和並讓UI異動生效
        setShipQtySum(nowShipQtySum);

        //判斷數量是否過量 跳出警告
        if (nowShipQtySum > stockInfoFromShipNoticeData.shipQty) {
            setMuiAlertSeverity("error");

        } else {
            setMuiAlertSeverity("info");

        }
    }



    //判斷目前資料是否存在 如無則新增
    const checkRecordIsExistInStockHandelRecords = (nowStockInfoItems) => {
        let copy = [...stockHandelRecs];

        nowStockInfoItems.forEach(element => {


            let target = _.find(stockHandelRecs, function (rec) {

                return (
                    rec.inag001 == element.inag001 &&
                    rec.inag004 == element.inag004 &&
                    rec.inag005 == element.inag005 &&
                    rec.inag006 == element.inag006 
                );

            });
            console.log('-------------target--------------');
            console.log(target);
            if (target) {
                console.log('存在');
                _.remove(copy, function (n) {
                    return n.inag001 == target.inag001 &&
                        n.inag004 == target.inag004 &&
                        n.inag005 == target.inag005 &&
                        n.inag006 == target.inag006 
                });
                let newRec = {};
                newRec.inag001 = target.inag001;
                newRec.inag004 = target.inag004;
                newRec.inag005 = target.inag005;
                newRec.inag006 = target.inag006;
                newRec.inag008 = target.inag008;
                newRec.shipQty = parseInt(element.shipQty) + parseInt(target.shipQty);
                copy.push(newRec);
                //return true
            } else {
                console.log('不存在');


                //可能會包含id屬性
                copy.push(element);



            }
        });

        setStockHandelRecs(copy);
        dispatch(saveStockHandelRecords(copy));
        console.log('------------儲存和push拷貝後的stockHandelRecords---------------');
        console.log(stockHandelRecs);
        //return false;
        //_.map(stockHandelRecords, processRecord);
    }

    //回寫shipmentNoticeTable資料
    //重新產生一份DATA
    const passToShipNoticeTable = () => {
        //TODO:需紀錄該 儲位+庫位+批號+料號=PK 的數量總和,該總和需在取得庫存資訊後先扣掉才顯示在stockTable   
        if (shipQtySum > stockInfoFromShipNoticeData.shipQty) {
            enqueueSnackbar('已超過需出貨量', {
                variant: 'warning',
            });
            return false;
        }

        console.log('**************已取得有設定數量的庫存資訊之array obj*******************');
        console.log(stockInfoDataToFinishTable);


        //檢查該紀錄是否已存在store中 如存在做shipQty數量總和
        //checkStockHandelRecords(stockInfoDataToFinishTable);
        checkRecordIsExistInStockHandelRecords(stockInfoDataToFinishTable);


        if (stockInfoDataToFinishTable.length === 0) {

            enqueueSnackbar('數量錯誤', {
                variant: 'warning',
            });
            return false;
        }
        let keys = Object.keys(shipmentNoticeData[0]);
        const newShipData = shipmentNoticeData.map((x, index) => {
            let obj = {};



            //console.log(keys);
            if (x.xmdhseq === stockInfoFromShipNoticeData.seq) {

                obj.shipQty = shipQtySum;

                linq.from(keys).forEach(
                    (c) => {
                        //console.log(c);
                        if (c !== 'shipQty')
                            obj[c] = x[c];
                    }
                );
                obj.stockToShipDatas = stockInfoDataToFinishTable;
            } else {
                obj = x;
            }
            return obj;
        });

        //同步更新出通單資料
        dispatch(saveShipmentNoticeData(newShipData));
        dispatch(doStockDialogClose());
        dispatch(saveStockData([]));
        dispatch(doMaterialNum(''));
        enqueueSnackbar('數量已設置', {
            variant: 'success',
        });
        //doStockDialogClose();

    }

    const options = {
        selectableRowsHeader: true,
        selectToolbarPlacement: 'none',
        download: false,
        print: false,
        filter: false,
        viewColumns: false,
        selectableRows: 'none',
        expandableRows: true,
        expandableRowsHeader: false,
        expandableRowsOnClick: true,
        rowsPerPage: 30,
        search: true,
        tableBodyHeight: '400px',
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

        customRowRender: (data, dataIndex, rowIndex) => {
            let style = {};

            if (data[6] !== 0) {
                style.backgroundColor = "green";
            }
            if (data[4] - data[6] < 0) {
                style.backgroundColor = "red";
            }

            return (
                <TableRow style={style} key={'ROW' + rowIndex}>

                    <TableCell />
                    <TableCell>
                        <Typography>{data[0]}</Typography>
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
                        <Typography>{data[4] - data[6]}</Typography>
                    </TableCell>
                    <TableCell>
                        <Typography>{data[5] - data[6]}</Typography>
                    </TableCell>
                    <TableCell>
                        <Typography><input type='number' data-objid={data[7]} value={data[6]} onChange={handleShipQty}></input></Typography>
                    </TableCell>
                    <TableCell>
                        <Typography><input type='hidden' value={data[7]} onChange={() => { }}></input></Typography>
                    </TableCell>
                </TableRow>
            );
        }
    };
    const columns = StockTableColumns;

    return (

        <div>

            <Grid container direction="row" justify="center" alignItems="center" spacing={3}>

                <Grid item md={6} lg={3}>

                    <ValidationTextField
                        className={classes.margin}
                        label="請輸入料號"
                        required
                        autoFocus
                        onFocus={handleFocus}
                        value={num}
                        variant="outlined"
                        defaultValue="Success"
                        id="metlNumber-outlined-input"
                        onChange={(e) => setNum(e.target.value)}
                        onKeyPress={(e) => handleTextField(e)}
                    />
                </Grid>
                <Grid item xs={12} md={3} lg={3}>
                    <MuiAlert variant="filled" elevation={6} severity={muiAlertSeverity} >
                        {//項次:{stockInfoFromShipNoticeData.seq}<br />
                        }
                        預計出貨數量:{stockInfoFromShipNoticeData.shipQty}
                        <hr />
                        已設置出貨數量:{shipQtySum}
                    </MuiAlert>

                </Grid>
                <Grid item xs={12} md={3} lg={4}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={(e) => passToShipNoticeTable(e)}
                        endIcon={<ControlPointIcon></ControlPointIcon>}
                    >
                        確定出貨數量
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={(e) => { console.log(stockHandelRecs) }}
                        endIcon={<ControlPointIcon></ControlPointIcon>}
                    >
                        test
                    </Button>
                </Grid>
            </Grid>
            <Grid container spacing={3}>
                <Grid item xs={12} >
                    <MUIDataTable
                        title={"料號庫存資訊"}
                        data={data}
                        columns={columns}
                        options={options}
                    />
                </Grid>

            </Grid>

        </div>

    );
}