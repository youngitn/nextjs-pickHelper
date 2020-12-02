import React, { useState, useRef } from "react";


import TextField from '@material-ui/core/TextField';
import { useSelector, useDispatch } from 'react-redux';
import { saveShipmentNoticeData, doShipmentNoticeNum, selectShipmentNoticeNum, selectShipmentNoticeData } from '../../lib/shipmentNoticeTableSlice';
import { preWork, doDataCheck } from '../../lib/shipmentNoticeTableSlice';
import Grid from '@material-ui/core/Grid';


import {

    withStyles,
    makeStyles,

} from '@material-ui/core/styles';
import axios from 'axios';


import { getStockInfoList, doMaterialNum, doOrderNum, selectOrderNum, selectStockNum, numExists, saveStockInfoFromShipNoticeData, saveStockData, selectStockHandelRecords, saveStockHandelRecords } from '../../lib/stockTableSlice';
import { selectDialogType, setCurrentDialogType } from "../../lib/formDialogSlice"
import linq from "linq";
import { useSnackbar } from 'notistack';
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
export default function LastCartonInputField() {

    const classes = useStyles();
    const shipmentNoticeData = useSelector(selectShipmentNoticeData);
    const dispatch = useDispatch();
    const [xmdg005, setXmdg005] = useState('');
    const [xmdg028, setXmdg028] = useState('');

    const stockHandelRecs = useSelector(selectStockHandelRecords);
    const dialogType = useSelector(selectDialogType);
    const orderlNumber = useSelector(selectOrderNum);
    const materielNumber = useSelector(selectStockNum);
    //料號
    const [melNum, setMelNum] = useState(materielNumber);
    const [orderNum, setOrderNum] = useState(orderlNumber);
    const targetInputField = useRef(null);
    const shipDateInputField = useRef(null);
    const { enqueueSnackbar } = useSnackbar();
    React.useEffect(() => { });


    const getShipData = (xmdg005, xmdg028) => {
        //if (e.key === 'Enter') {
        //alert(xmdg005);
        if (_.isEmpty(xmdg005) || _.isEmpty(xmdg028)) {
            alert('請輸入客戶編號或出貨日期');
        } else {
            let url =
                `/kanbanApi/getTobePickedShippingInfoListByXmdg005AndXmdg028?xmdg005=${xmdg005}&xmdg028=${xmdg028}&page=1&per_page=1`;
            axios.get(url).then((response) => {
                console.log(response)
                let tempData = preWork(response.data.data);
                tempData = doDataCheck(tempData);
                console.log(tempData);
                dispatch(saveShipmentNoticeData(tempData));

            });

        }



    }

    //料號輸入後按下ENTER
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

    const handleXmdg005KeyPress = (e) => {
        if (e.key === 'Enter') {
            //alert(e.target.value)
            let input = e.target.value.split('_');
            let v = input[3];
            setXmdg005(v);
            shipDateInputField.current.focus();
        }
    }

    const handleXmdg028KeyPress = (e) => {
        //if (e.key === 'Enter') {
        getShipData(xmdg005, e.target.value);
        targetInputField.current.focus();
        //}
    }

    const handleXmdg005Change = (e) => {
       
        setXmdg005(e.target.value);
    }

    const handleXmdg028Change = (e) => {
        setXmdg028(e.target.value);
        handleXmdg028KeyPress(e);
    }

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

    return (
        <div>
            <Grid container direction="row" justify="center" alignItems="center" spacing={3}>
                <Grid item xs={12} sm={4} md={4} lg={3}>
                    <h2>客戶編號:<ValidationTextField
                        className={classes.margin}
                        label="請輸入客戶編號"
                        required
                        // inputRef={shipNoticeNumNumInput}
                        autoFocus
                        value={xmdg005}
                        variant="outlined"

                        id="custNumInputField"
                        onInput={(e) => handleXmdg005Change(e)}
                        onKeyPress={handleXmdg005KeyPress}
                        onFocus={(e)=>{e.target.value='';setXmdg005('')}}
                    /></h2>
                </Grid>
                <Grid item xs={12} sm={4} md={4} lg={3}>
                    <h2>出貨日期:<ValidationTextField
                        className={classes.margin}

                        required

                        value={xmdg028}
                        variant="outlined"
                        type="date"
                        id="shipDateInputField"
                        inputRef={shipDateInputField}
                        onInput={(e) => handleXmdg028Change(e)}
                        //onFocus={(e)=>{e.target.value=''}}
                    //onKeyPress={handleXmdg028KeyPress}
                    // onFocus={handleFocus}
                    /></h2>
                </Grid>
                <Grid item xs={12} sm={4} md={4} lg={4}>
                    <h2>料號+訂單號:<ValidationTextField
                        className={classes.margin}
                        label="料號+訂單號"
                        required
                        //autoFocus
                        value={melNum}
                        variant="outlined"
                        fullWidth={true}
                        id="targetInputField"
                        inputRef={targetInputField}
                        onChange={(e) => setMelNum(e.target.value)}
                        onKeyPress={handleMelNumField}
                        onFocus={(e)=>{e.target.value='',setMelNum('')}}
                    /></h2>

                </Grid>
            </Grid>
        </div>
    );
}