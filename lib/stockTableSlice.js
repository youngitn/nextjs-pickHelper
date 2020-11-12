import { createSlice } from '@reduxjs/toolkit';
import { doStockDialogOpen, } from './formDialogSlice';
import linq from "linq";
import _ from 'lodash';

//記得將slice加到store裡面

//action
export const stockTableSlice = createSlice({
    name: 'stockTable',
    initialState: {
        tableData: [],
        stockNum: '',//料號
        orderNum: '',
        stockAndOrderNun: '',
        shipNoticeData: [],
        stockInfoFromShipNoticeData: {
            shipQty: 0,
            seq: 0
        },
        locationList: [],
        //紀錄已扣除的庫存{}
        stockHandelRecords: [],

    },
    reducers: {
        //將view component丟進來的data放到狀態中(全域)
        doMaterialNum: (state, action) => {

            state.stockNum = action.payload;
        },

        //丟訂單批號狀態(全域)
        doOrderNum: (state, action) => {

            state.orderNum = action.payload;
        },

        //將view component丟進來的data放到狀態中(全域)
        saveStockData: (state, action) => {
            state.tableData = action.payload;
        },

        getShipNoticeData: (state) => {
            return (state.shipNoticeData);
        },
        saveStockInfoFromShipNoticeData: (state, action) => {
            state.stockInfoFromShipNoticeData = action.payload;
        },
        saveStockHandelRecords: (state, action) => {
            state.stockHandelRecords = action.payload;
        },
        saveLocationList: (state, action) => {
            state.locationList = action.payload;
        },
        saveStockAndOrderNun: (state, action) => {
            state.stockAndOrderNun = action.payload;
        }




    },
});


// export const getList = (x) =>
//     dispatch => {

//         setTimeout(() => {
//             dispatch(incrementByAmount(amount));
//         }, 1000);

//     };

/**
 * 確認num是否存在shipNoticeData中,
 * 如存在進行庫存查詢.
 * 之後會代入所在倉庫碼做查詢條件加入過濾
 * 再後續會再加入更多參數讓結果為唯一
 * @param {*} num 料號
 * @param {*} shipNoticeData 出通單明細
 */
export const getStockInfoList = (num, location, stockInfoFromShipNoticeData, stockHandelRecs, orderNum) =>
    dispatch => {

        //只取大於0 && 有批號的資料
        // let url =
        //     `kanbanApi/getStock?search=where:inag001@${num},and:inag008!=0,and:inag006:VP,`;
        let url =
            `kanbanApi/getStock?search=where:inag001@${num},and:inag008!=0,`;


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
                    if (!_.isNaN(data) && !_.isEmpty(data) && _.size(data) > 0) {
                        let newData = dataProcess(preWork(data, stockHandelRecs), location, stockInfoFromShipNoticeData, orderNum);
                        if (_.size(newData) > 0) {
                            dispatch(saveStockData(newData));
                            //dispatch(saveStockData(preWork(data)));
                            dispatch(doStockDialogOpen(newData));
                        } else {
                            alert('查無庫存');
                        }

                    } else {
                        alert('查無庫存');
                    }
                }

            )//.catch((error) => {
        //     console.log(error.message);
        //     dispatch(saveStockData([]));
        //     //alert(error.message);
        // });

    };


/**
 * 1.根據location.inaa001過濾庫存清單庫位.
 * 2.根據location.inaa007過濾庫存清單中所要顯示的儲位是空或非空
 * 3.庫位清單排序並選擇最相近值
 * 
 * @param {array} data 庫存清單資料
 * @param {object} location 庫位儲位管理碼
 * @param {object} stockInfoFromShipNoticeData 出通單數量 
 * @param {object} orderNum 批號(訂單號碼) 
 */
const dataProcess = (data, location, stockInfoFromShipNoticeData, orderNum) => {

    //儲位管理碼
    let storeMgCode = location[0].inaa007;
    let storeCondition = '';
    //庫位碼
    let locCode = location[0].inaaId.inaa001;
    //alert(storeMgCode);

    //根據儲位管理碼給訂條件
    switch (storeMgCode) {
        case '1':
        case '2':
            storeCondition = ' && $.inag005.trim() !== ""';
            break;
        case '5':
            storeCondition = ' && $.inag005.trim() == ""';
            break;
        default:
            break;
    }
    //5 or 1.2

    //alert(orderNum);
    let procData = linq.from(data)
        .where(`$.inag004 === '${locCode}' ${storeCondition} `)
        .toArray();

    let isOrderNumStockExist = false;
    if (linq.from(procData)
        .where(`$.inag006 === '${orderNum}'`)
        .toArray().length > 0) {
        isOrderNumStockExist = true;
        //alert('yes');
    } else {
        alert('該訂單號碼查無對應庫存批號');
    }
    let qty = parseInt(stockInfoFromShipNoticeData.shipQty);
    let temp = 0;
    //let index = 0;
    let flag = true;

    let tar = {};

    //排序
    procData.sort(function (a, b) {
        return b.inag008 - a.inag008;
    });

    //先處理有批號的部分
    if (isOrderNumStockExist) {
        procData.every((item, index, arry) => {
            if (item.inag006 == orderNum) {


                if (item.inag008 < qty) {
                    item.shipQty = Number(item.inag008);

                }
                if (item.inag008 > qty) {
                    item.shipQty = qty;

                }

                if (item.inag008 == qty) {
                    item.shipQty = qty;

                }
                //tar = item;
                qty = qty - item.shipQty;

            }

            return flag;
        });
        return procData;
    } else {
        procData.every((item, index, arry) => {
            if (item.inag008 >= qty) {

                let nx = item.inag008 - qty
                if (nx == 0) {
                    // arry[index - 1].shipQty = 0;
                    // item.shipQty = n;
                    tar = item;
                    flag = false;
                } else {

                    //差距更少
                    if (temp > 0 && temp > nx) {
                        // arry[index - 1].shipQty = 0;
                        // item.shipQty = n;
                        temp = nx;
                        tar = item;

                    }//first run
                    else if (temp === 0) {
                        temp = nx;
                        tar = item;
                    } else {
                        tar = item;
                    }


                }
            } else {
                flag = false;

            }


            //index++;
            return flag;
        });



        if (_.size(procData) == 0) {
            //alert('查無庫存');
            return false;
        }

        //取得所有庫存欄位名稱
        let keys = Object.keys(procData[0]);

        //設定出貨數量到庫存資料列表中
        const newProcData = procData.map((x, index) => {

            if (_.isEqual(x, tar)) {

                let rObj = {};
                rObj.shipQty = qty;

                linq.from(keys).forEach(
                    (c) => {
                        //console.log(c);
                        if (c !== 'shipQty')
                            rObj[c] = x[c];
                    }
                );

                return rObj
            } else {
                return x;
            }

        });


        return newProcData;
    }


}

/**
 * 1.根據location.inaa001過濾庫存清單庫位.
 * 2.根據location.inaa007過濾庫存清單中所要顯示的儲位是空或非空
 * 3.庫位清單排序並選擇最相近值
 * 
 * @param {array} data 庫存清單資料
 * @param {object} stockHandelRecs 異動過的庫存紀錄,會用來調整異動過的庫存數量.
 * 
 */
const preWork = (data, stockHandelRecs) => {
    let keys = Object.keys(data[0]);

    const prData = data.map((x, index) => {

        //console.log(x);
        if (_.size(stockHandelRecs) > 0) {

            //找到新建立的stockData中符合stockHandelRecs的項目做扣除
            let target = findByKeys(x, stockHandelRecs);

            //存在已被設置過數量的庫存資訊就進行扣除
            if (target) {

                //取得出通單中該料號存貨資訊


                let rObj = {};

                rObj.id = index;
                rObj.shipQty = 0;
                linq.from(keys).forEach(
                    (c) => {
                        //console.log(c);
                        if (c !== 'inag008' || c !== 'inag009')
                            rObj[c] = x[c];
                    }
                );
                //console.log( ' parseInt(target.shipQty)='+parseInt(target.shipQty));
                //計算結果為該料庫存異動後的數量
                rObj.inag008 = parseInt(x.inag008) - parseInt(target.shipQty);
                rObj.inag009 = parseInt(x.inag009) - parseInt(target.shipQty);
                return rObj;
            }

        }


        x.id = index;
        x.shipQty = 0;
        return x;
    });

    return prData;
}

//回傳查詢到的目標物件
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


export const numExists = (num, data, orderNum) => {

    //console.log(data);
    let shipNoticeData = linq.from(data)
        .where(`$.xmdh006 === '${num}' && $.shipQty === 0 && $.xmdh001 ==='${orderNum}'`)
        .select("{shipQty:$.xmdh017,seq:$.xmdhseq,orderNum:$.xmdh001,xmdhdocno:$.xmdhdocno}").toArray();

    return shipNoticeData;
}
export const { saveStockData, doMaterialNum, doOrderNum, getShipNoticeData, saveStockInfoFromShipNoticeData, saveLocationList, saveStockHandelRecords, saveStockAndOrderNun } = stockTableSlice.actions;


export const selectStockData = state => state.stockTable.tableData;

export const selectStockNum = state => state.stockTable.stockNum;

export const selectOrderNum = state => state.stockTable.orderNum;

//export const numExists = stockTableSlice.numExists;

//將料號資訊從ship(出通單)傳到stock(庫存)
export const selectStockInfoFromShipNoticeData = state => state.stockTable.stockInfoFromShipNoticeData;

export const selectStockHandelRecords = state => state.stockTable.stockHandelRecords;

export const selectLocationList = state => state.stockTable.locationList;

export const selectStockAndOrderNun = state => state.stockTable.stockAndOrderNun;

export default stockTableSlice.reducer;
