import { Button } from "@material-ui/core";
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { red, grey } from '@material-ui/core/colors';



export default function ShipNumHisList(props) {


    return ( 
        <div>
        <ColorBtn>
            {props.children}
        </ColorBtn>
        </div>

    );
}