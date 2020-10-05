import React, { useRef, createRef, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import { selectIsFinishDialogOpen, doFinishDialogOpen, doFinishDialogClose, } from '../lib/formDialogSlice';

import { useSelector, useDispatch } from 'react-redux';
//import QRReader from './QRReader'
import FinishTable from './tables/FinishTable';
import LocalPrintshopIcon from '@material-ui/icons/LocalPrintshop';
import { red, grey } from '@material-ui/core/colors';
import { Grid } from '@material-ui/core';
import { apiTWVPt100 } from '../api';
import { selectShipmentNoticeData } from '../lib/shipmentNoticeTableSlice';
import _ from 'lodash';

const useStyles = makeStyles((theme) => ({
    appBar: {
        position: 'relative',
        backgroundColor: red[500]
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
}));


const ColorBtn = withStyles((theme) => ({
    root: {
        color: theme.palette.getContrastText(grey[200]),
        backgroundColor: grey[200],
        '&:hover': {
            backgroundColor: red[200],
        },
    },
}))(Button);
const FinishDialog = React.forwardRef(function (props, ref) {
    //const [open, setOpen] = React.useState(false);

    // const handleClickOpen = () => {
    //   setOpen(true);
    // };

    // const handleClose = () => {
    //   setOpen(false);
    // };

    const shipmentNoticeData = useSelector(selectShipmentNoticeData);
    const classes = useStyles();
    const selectIsFinishDialogFlag = useSelector(selectIsFinishDialogOpen);

    const textInput = useRef();

    const dispatch = useDispatch();

    const doClose = () => {
        dispatch(doFinishDialogClose());
    }

    const shipperCreate = async () => {
        let shipperDetail = [];
        if (_.size(shipmentNoticeData) === 0) {
            alert('尚無資料');
            return false;
        }
        console.log("出通單品項數量:"+_.size(shipmentNoticeData))
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

        console.log(shipperDetail);
        let data = {
            shipperNotice: shipmentNoticeData[0].xmdhdocno,
            shipperDetail: shipperDetail
        };
        await apiTWVPt100(data).then(res => {
            console.log(res.data.payload.std_data.execution);
            //console.log(res.data.payload.std_data.execution.description);
            alert("T100創建出貨單結果訊息:" + res.data.payload.std_data.execution.description);
            alert("出貨單單號:" + res.data.payload.std_data.parameter.shipper_no);
        }).catch(err => {
            console.log(err);
        });
    }

    return (
        <div>

            <Button variant="outlined" onClick={() => dispatch(doFinishDialogOpen())}>
                檢貨結果
            </Button>
            <Dialog
                fullWidth={true}
                maxWidth='lg'
                ref={ref}
                open={selectIsFinishDialogFlag}
                onClose={doClose}
                aria-labelledby="form-dialog-title"
            >
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <Grid container direction="row" justify="space-between" alignItems="center" spacing={3}>
                            <Grid item xs={12} md={3} lg={3}>
                                <IconButton
                                    edge="start"
                                    color="inherit"
                                    onClick={doClose}
                                    aria-label="close"
                                >
                                    <CloseIcon />
                                    <Typography variant="h6" className={classes.title}>
                                        檢貨結果
                                    </Typography>
                                </IconButton>
                            </Grid>
                            <Grid item xs={12} md={3} lg={3}>
                                <ColorBtn
                                    edge="end"
                                    fullWidth={true}
                                    onClick={shipperCreate}
                                    aria-label="close"
                                    endIcon={<LocalPrintshopIcon />}
                                >
                                    建立出貨單
                        </ColorBtn>
                            </Grid>

                        </Grid>
                    </Toolbar>
                </AppBar>
                <DialogContent >
                    <FinishTable />
                </DialogContent>
            </Dialog>
        </div>
    );
});

export default FinishDialog;