import _ from 'lodash';
import { apiTWVPt100 } from '../api';

/**
 * 出貨動作
 * 
 * @param {object} shipmentNoticeData 根據出通單做分類
 */
export const shipperCreate = async (shipmentNoticeData) => {

    
    let shipperDetail = [];


    if (_.size(shipmentNoticeData) === 0) {
        alert('尚無資料');
        return false;
    }
    console.log("出通單品項數量:" + _.size(shipmentNoticeData))
    shipmentNoticeData.forEach(sn => {

        if (!_.isNaN(sn.stockToShipDatas) && !_.isEmpty(sn.stockToShipDatas) && _.size(sn.stockToShipDatas) > 0) {
            sn.stockToShipDatas.forEach(element => {
                shipperDetail.push({
                    sn_seq: sn.xmdhseq,
                    item_no: element.inag001,
                    warehouse_no: element.inag004,
                    storage_spaces_no: element.inag005,
                    lot_no: element.inag006,
                    qty: element.shipQty

                })
            });
        }


    });


    let data = {
        shipperNotice: shipmentNoticeData[0].xmdhdocno,
        //shipperNotice: '999999999999',
        shipperDetail: shipperDetail
    };

    console.log(data);



    // await apiTWVPt100(data).then(res => {
    //     console.log(res.data.payload.std_data.execution);
    //     //console.log(res.data.payload.std_data.execution.description);
    //     alert("T100創建出貨單結果訊息:" + res.data.payload.std_data.execution.description);
    //     alert("出貨單單號:" + res.data.payload.std_data.parameter.shipper_no);
    // }).catch(err => {
    //     console.log(err);
    // });




}


